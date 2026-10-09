# 多视频 registry 与共享渲染器 — 设计

日期：2026-10-09
状态：已实现（2026-10-09，分支 `video-registry`）。验收：三支视频各取 6 帧，改造前后 18/18 逐字节相同。

## 目标

把三支视频之间重复的 composition 骨架收成一份，让「再加一支视频」从改 5 个散落的地方
变成 2 处登记，并且写错场景 id 能在打开 Studio 时立刻报错。

成功标准：

- 加第 4 支视频只需要：写旁白 → `videos.json` 加一条 → 跑 TTS → 建场景目录 → `src/videos.ts` 加一行
- 三支既有视频渲染结果**逐帧不变**（这是整个改造的验收底线）
- timing 里有场景但没注册组件（或反过来）时，Studio 一加载就抛错，不是播到那一幕才黑屏

## 现状的问题

| 问题 | 具体 |
|---|---|
| composition 文件 90% 相同 | `PiDurable.tsx` / `PythonRoadmap.tsx` / `ChickenRabbit.tsx` 是同一段约 60 行抄三遍 |
| 导出名三套 | `TOTAL_FRAMES` / `PY_TOTAL_FRAMES` / `CR_TOTAL_FRAMES`，同一个概念 |
| **fps 已经不一致** | `Root.tsx` 里 pi 和 math 写死 `fps={30}`，python 用 `PY_FPS`（从 timing 读）。出现 60fps 的视频时前两者会错拍 |
| 容错三套 | python 版做了未知 scene id 抛错 + 全量 `Record` 类型检查；pi 和 math 静默 `return null`，渲染出黑屏仍算成功 |
| 调色板堆积 | `theme.ts` 同时装着共享基础和 `MATH_COLORS` |
| TTS 要背路径 | `node scripts/tts.mjs narration.math.json src/timing.math.json public/audio-math` |

## 架构

### `videos.json`（仓库根）— 路径的唯一真相

`scripts/tts.mjs`（纯 JS）和 `src/videos.ts`（TS）都要读它，所以是 JSON。

```json
{
	"pi-durable": {
		"title": "PiDurable",
		"brand": "pi-durable",
		"folder": "Explainer",
		"narration": "narration.json",
		"timing": "src/timing.json",
		"audio": "audio"
	},
	"python": {
		"title": "PythonRoadmap",
		"brand": "python-roadmap",
		"folder": "Explainer",
		"narration": "narration.python.json",
		"timing": "src/timing.python.json",
		"audio": "audio-py"
	},
	"math": {
		"title": "ChickenRabbit",
		"brand": "小学数学",
		"folder": "Math",
		"narration": "narration.math.json",
		"timing": "src/timing.math.json",
		"audio": "audio-math"
	}
}
```

字段说明：

- `title` —— Remotion composition 的 id，也是 Studio 里显示的名字。保持与现有 id 一字不差，
  否则既有的渲染命令会失效
- `brand` —— `Stage` 右上角的字样
- `folder` —— Studio 侧边栏的分组
- `audio` —— **public 相对**路径。`Stage` 的 `audioDir` 直接用它，`tts.mjs` 前面拼 `public/`

pi-durable 的裸文件名是历史遗留，作为显式例外老实写在这里，不改文件
（改它要 `git mv` 106 个 wav，且与仓库里另一支在制视频有冲突风险）。
**新视频一律走 `narration.<slug>.json` / `src/timing.<slug>.json` / `audio-<slug>` 约定。**

### `src/videos.ts` — 代码层

JSON 承载不了的两件事：timing 的静态 import（打包器需要在编译期看到）和场景组件映射。

```ts
export type VideoDef = {
	readonly key: string;
	readonly title: string;
	readonly brand: string;
	readonly folder: string;
	readonly timing: Timing;
	readonly Component: React.FC;
};

export const VIDEOS: readonly VideoDef[] = [
	defineVideo("pi-durable", piTiming, { s0: S0Hook, /* … */ s9: S9Outro }),
	defineVideo("python", pyTiming, { p00: P0Hook, /* … */ p12: P12Outro }),
	defineVideo("math", mathTiming, { s0: M0Pose, /* … */ s5: M5Outro }),
];
```

`defineVideo` 在**模块加载时**双向校验：

- timing 里出现、但 `bodies` 里没有的 scene id → 抛错（会黑屏的那种）
- `bodies` 里有、但 timing 里没有的 key → 抛错（写错了名字，或者旁白删了一幕忘了删组件）

两个方向都查，是因为只查前者的话，改名 typo 会同时制造一个黑屏场景和一个死组件，
而错误信息只会提到前者。错误信息要列出双方的差集和已知 id 列表。

校验放在模块加载时而不是渲染时：Studio 一打开就炸，而不是拖到那一幕才发现。

### `src/components/Explainer.tsx` — 共享渲染器

那 60 行骨架的唯一一份：

```tsx
export const makeExplainer = (
	timing: Timing,
	brand: string,
	audioDir: string,
	bodies: Record<string, React.FC<{ scene: SceneTiming }>>,
): React.FC => { /* … */ };
```

返回一个**稳定的**组件引用（在 `defineVideo` 里调用一次，存进 `VideoDef.Component`），
不能写成 `component={() => <Explainer …/>}` —— 那样每次渲染都是新的组件标识，
Remotion 会把整棵树当成新的。

渲染逻辑与现有三份一致：按 `scene.startFrame` 摆 `Sequence`，`premountFor={fps}`，
外层 `AbsoluteFill` 背景 `COLORS.bgDeep`。

### `src/Root.tsx` — 遍历 registry

按 `folder` 分组后渲染。**fps、width、height 全部从 `video.timing` 读**，
不再在 Root 里写死 —— 这是 fps 不一致那个隐患的根治。

`HelloWorld` / `Logo` / `Title` 这三个脚手架自带的 composition 原样保留，不在 registry 里。

### `scripts/tts.mjs`

主用法变成：

```bash
node scripts/tts.mjs math
```

第一个参数若是 `videos.json` 里的 key，就查表解析三个路径；否则退回现有的三位置参数形式。
**老形式保留**：仓库里另一支在制视频的计划文档引用了它，而且刚给它加过路径安全防护，
贸然移除会打断那边的工作流。新文档只写 key 形式。

### 调色板

`MATH_COLORS` 从 `theme.ts` 移到 `src/scenes-math/palette.ts`，跟着它的场景走。
`theme.ts` 只留共享基础：`COLORS`、`FONT`、`MONO`、`W`/`H`/`PAD`、`since`/`easeOut`/`easeInOut`/`clamp01`。

约定：某支视频要自己的配色，就放在自己的场景目录下。零抽象成本 —— 不引入
palette context 或主题切换机制，因为目前只有一支视频需要，第二支需要时再说。

### 删除

- `src/PiDurable.tsx`
- `src/PythonRoadmap.tsx`
- `src/ChickenRabbit.tsx`

这三个文件的全部职责都被 `videos.ts` + `Explainer.tsx` 接管。
**场景文件（29 个）一个不动。**

## 改造后加一支视频

1. 写 `narration.<slug>.json`
2. `videos.json` 加一条
3. `node scripts/tts.mjs <slug>`
4. 建 `src/scenes-<slug>/`，写场景组件
5. `src/videos.ts` 加一行 `defineVideo(...)`

## 测试与验收

没有测试框架，验收靠这几条。**底线是三支视频渲染结果逐帧不变。**

1. `npx tsc --noEmit` 通过。**不要跑 `npm run lint`** —— `eslint src` 在本仓库挂死
   （`src/scenes/S7Chord.tsx` 第 162、170 行是以 `//` 开头的 JSX 文本）
2. **逐帧等价回归**：改造前对三支视频各渲若干帧存为基线，改造后重渲同样的帧，
   `md5` 必须逐一相同。这比「看起来一样」强得多，也是本次改造唯一真正的验收标准
3. 负向测试：故意把一个 scene id 写错，确认 `tsc` 或加载时立刻报错且信息里有那个 id；
   验证完改回来
4. 渲染必须走终端面板 —— 沙箱里 Chromium 起不来
   （Seatbelt 拒绝 Mach 端口注册，报 `Permission denied (1100)`）

## 风险

| 风险 | 处理 |
|---|---|
| 改造悄悄改变了某支视频的画面 | 验收第 2 条的 md5 逐帧比对就是为这个设的；基线必须在动代码**之前**渲好 |
| 与仓库里另一支在制视频的会话冲突 | 那边最后提交在 10:34，已静置数小时，且其未完成工作（13 幕里 12 幕仍是占位）可能转交过来。本次仍在独立 worktree 里做。要**删除** `PythonRoadmap.tsx`，若那边仍在改它，合并会是实质冲突而非自动可并 —— 合并前先确认那边收工 |
| 改造时机 | 在 python 视频那 12 幕占位场景被实现**之前**做，是刻意的：公共结构先定下来，新场景直接落在上面；等写完再改要多动 12 个文件 |
| `videos.json` 的 `title` 写错会导致渲染命令失效 | 三个 title 必须与现有 composition id 一字不差：`PiDurable`、`PythonRoadmap`、`ChickenRabbit` |
| `tsconfig` 的 `lib` 是 es2020 | 不能用 `Array.prototype.at`、`Object.hasOwn` 等 es2022 API（已经踩过一次）。用 `Array.from`、索引访问 |
| `src/videos.ts` 要 import 仓库根的 `videos.json` | 已验证安全：`tsconfig.json` 没有 `rootDir` 也没有 `include`，不会触发 TS6059。另外 `noUnusedLocals: true` 是帮手 —— 删掉三个 composition 文件后任何残留的死 import 会直接报错 |
| 共享渲染器返回不稳定的组件引用 | `makeExplainer` 每支视频只调用一次，结果存进 `VideoDef.Component` |
