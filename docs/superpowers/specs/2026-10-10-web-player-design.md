# 在线可交互播放器 — 设计

日期：2026-10-10
状态：已评审通过，待实现

## 目标

把整个 my-video 项目做成一个 Cloudflare Pages 静态站：观众打开 URL 就能在浏览器里
**实时渲染**三支视频，可以拖时间轴、清晰度无损，而不是看一个压好的 mp4。

成功标准：

- 一个公开 URL，别人打开就能看三支视频，不需要任何登录或安装
- 首屏可交互，音频按需加载而不是一次拉几十兆
- **三支视频的画面和本地渲染一致**（同一套场景组件，不是重新实现）
- 加第四支视频时，播放站**不需要改代码** —— 它从 `src/videos.ts` 读

## 为什么是 Player 而不是 mp4

mp4 方案（R2 托管成片）已经实现了一半，但它给观众的是一段录像。Player 方案给的是
真实渲染：任意缩放不糊、能逐帧看、将来加交互（点击跳转到某一幕）也是现成的。

代价是音频要随站点分发，这带来下面第一件事。

## 一、音频压缩

### 问题

238 个 wav，85.7 MB，平均 369 KB 一句。直接发出去，手机上每听一句话拉 369 KB。

实测 `afconvert -f m4af -d aac -b 64000` 压缩比 **4.7x** → 约 18 MB。

### 难点

`timing.json` 把扩展名写死在数据里：

```json
{ "file": "s0-0.wav", "startFrame": 17, "durationInFrames": 269 }
```

`Stage` 用 `staticFile(`${audioDir}/${paragraph.file}`)` 拼路径。所以换格式必须同时改数据。

### 做法

`scripts/compress-audio.mjs`，一次性：

1. 遍历 `public/audio*/` 下每个 `.wav`，`afconvert` 转出同名 `.m4a`
2. 改写 `src/timing.json` / `timing.python.json` / `timing.math.json` 里每个 `file` 字段的扩展名
3. 删掉 wav

**时长字段一个都不碰。** `durationInFrames` / `durationSeconds` 是 TTS 时从 wav 量出来的，
转码不改变时长，所以帧数、场景起止、整片长度全都不变。

`scripts/tts.mjs` 同步改成直接产出 m4a：量时长仍然用中间的 wav（`wavDuration()` 只会解析
RIFF），量完转码，写进 timing 的是 `.m4a`。

### 验收

```bash
git diff --stat src/timing*.json
```

必须只看到 `file` 行的 `.wav` → `.m4a`，没有任何数字变化。再渲一帧确认音频能解析。

### 退路

如果 AAC 转码在用户机器上也不可用，就直接发 wav：85.7 MB 总量，但 Remotion 的
`premountFor={fps}` 只预载约 1 秒，观众只下载看到的部分。能用，手机上浪费。

## 二、`web/` 改成 Vite + Player

### 结构

```
web/
  index.html        入口 HTML
  main.tsx          挂载
  App.tsx           视频切换 + <Player>
  vite.config.ts    publicDir 指向仓库根的 public/
  tsconfig.json
```

### 关键：复用 registry

播放站**不重新声明任何视频信息**，直接 import `src/videos.ts`：

```ts
import { VIDEOS } from "../src/videos";
```

每支视频的 `Component`、`timing.totalFrames`、`timing.fps`、`title` 全从那里来。
这是上一轮 registry 改造的直接回报：加第四支视频时这个文件一行不用动。

### 关键技术风险：`staticFile()` 在 Player 里怎么解析

`Stage` 用 `staticFile()` 拼音频路径。在 Studio 和渲染时 Remotion 会设置
`window.remotion_staticBase`；在一个普通的 Vite 应用里**它是否正确落到站点根目录，必须实测**，
不能假设。

验证方法：本地 `vite dev` 跑起来，打开浏览器 Network 面板，确认音频请求打到
`/audio-math/s0-0.m4a` 这样的路径并返回 200。若路径不对，在 `main.tsx` 里显式设置
`window.remotion_staticBase = "/"`。

**这是整件事唯一可能推翻方案的点，所以放在实现的最前面验证。**

### Vite 的 publicDir

音频在仓库根的 `public/`，不在 `web/public/`。`vite.config.ts` 里：

```ts
publicDir: path.resolve(__dirname, "../public")
```

这样 `public/audio-math/s0-0.m4a` 会被原样拷进 `web/dist/audio-math/s0-0.m4a`。

## 三、部署

```bash
npx wrangler pages deploy web/dist --project-name video-explainers
```

**全部放 Pages，不需要 R2。** 压缩后最大的单文件是几十 KB 的 m4a，远低于
[25 MiB 单文件上限](https://developers.cloudflare.com/pages/platform/limits/)；
`dist` 里约 250 个文件，远低于免费版 20000 的文件数限制。

现有的 `web/index.html`（R2 落地页）和 `web/DEPLOY.md` 被替换。
`out/*.mp4` 成片保留在本地，播放页底部给一个下载链接。

## 环境约束（已实测）

| | 沙箱内 | 终端面板（沙箱外） |
|---|---|---|
| `npm i` | ❌ 被拒（registry.npmjs.org denied） | ✅ |
| `afconvert` AAC 编码 | ❌ 编码器不可用，`m4af` 的 data_formats 为空 | ✅ 实测可用 |
| `vite build` | ✅ 应该可以（纯本地） | ✅ |
| `remotion still/render` | ❌ Chromium 起不来 | ✅ |
| `npx tsc --noEmit` | ✅ | ✅ |

所以装包和转码必须走 `mcp__terminal__run_in_terminal`。

## 风险

| 风险 | 处理 |
|---|---|
| `staticFile()` 在 Player 里路径不对 | 实现第一步就验证，失败则显式设 `remotion_staticBase`。这是唯一能推翻方案的点 |
| 转码改坏 timing | 只改 `file` 的扩展名，`git diff` 必须无数字变化 |
| AAC 在用户机器上不可用 | 退路是直接发 wav（85.7 MB，按需加载） |
| 删 wav 后无法回退 | 转码和删除分成两步，确认 m4a 数量和 wav 一致后再删 |
| Player 的包版本和 remotion 不匹配 | `@remotion/player` 必须锁到 `4.0.533`，与现有 remotion 完全一致 |
