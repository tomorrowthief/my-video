# 部署到 Cloudflare Pages

整个项目作为静态站发布：观众在浏览器里**实时渲染**三支视频，而不是看压好的 mp4。

## 一次性准备

```bash
npm i -D wrangler
npx wrangler login
```

## 每次发布

```bash
npm run web:build
npx wrangler pages deploy web/dist --project-name video-explainers
```

输出里会给你 `https://video-explainers.pages.dev` —— 这就是发给别人的 URL。

## 为什么全在 Pages，不需要 R2

| | 实测 | [Pages 限制](https://developers.cloudflare.com/pages/platform/limits/) |
|---|---|---|
| 最大单文件 | 1.1 MB（JS bundle） | 25 MiB |
| 文件总数 | 241 | 20000（免费版） |
| 总体积 | 24 MB | 无硬性上限 |

早先那版「mp4 放 R2」是因为成片 66 MB 装不进 Pages。实时渲染方案没有大文件 ——
最重的是 238 个 m4a 旁白，每个几十 KB。

## 音频为什么是 m4a

TTS 产出的是 wav，238 个共 85.7 MB，平均一句话 369 KB。
`scripts/compress-audio.mjs` 转成 64 kbps AAC 后 **16.8 MB（5.1x）**，语音听不出差别。

时长字段没有重算 —— 它们是生成旁白时从 wav 量出来的，转码不改变时长。
验收方式是 `git diff src/timing*.json` 只有 `.wav` → `.m4a`，没有任何数字变化。

构建只拷 `.m4a`（见 `web/vite.config.ts` 的 `narrationAssets` 插件），
所以仓库里即使还留着 wav 也不会进 dist。

## 本地预览

```bash
npm run web:dev      # http://localhost:3200，实时渲染，改场景即时生效
npm run web:preview  # 预览构建产物，发布前最后一道确认
```

## 加第四支视频之后

播放站**不用改**。它从 `src/videos.ts` 读 registry，新视频登记进去就自动出现在切换栏里。
只需要记得：

```bash
node scripts/compress-audio.mjs   # 把新视频的 wav 也转掉
```
