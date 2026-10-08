# 鸡兔同笼讲解视频 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Remotion 仓库里做出一支约 3 分钟的鸡兔同笼讲解视频，和 pi-durable、python-roadmap 两支片子共存互不干扰。

**Architecture:** 沿用仓库里已经定下的**兄弟文件命名**约定 —— 每支视频拥有自己的 `narration.<name>.json`、`src/timing.<name>.json`、`public/audio-<short>/` 和 `src/scenes-<short>/`，pi-durable 的原有路径保持不动。`tts.mjs` 已经支持三个位置路径参数。新 composition `ChickenRabbit` 复用现成的 `Stage`（backdrop / 标题 / 字幕 / 进度条 / 旁白音频都已封装，`brand` 和 `audioDir` 可传参）。六个场景组件只管内容区，时间全部从 `scene.paragraphs[i].startFrame` 推导。

**Tech Stack:** Remotion 4.0.533、React 19、TypeScript、macOS `say` + `afconvert`（TTS）

**Spec:** [docs/superpowers/specs/2026-10-08-chicken-rabbit-explainer-design.md](../specs/2026-10-08-chicken-rabbit-explainer-design.md)

---

## 开工前必读：三件已成事实

**1. 仓库里有三支视频，命名约定已经定了。** 本片按同一约定取名，不要另起一套：

| | pi-durable | python-roadmap | 本片 |
|---|---|---|---|
| 旁白 | `narration.json` | `narration.python.json` | `narration.math.json` |
| 时间轴 | `src/timing.json` | `src/timing.python.json` | `src/timing.math.json` |
| 音频 | `public/audio/` | `public/audio-py/` | `public/audio-math/` |
| 场景 | `src/scenes/` | `src/scenes-py/` | `src/scenes-math/` |
| brand | `pi-durable` | `python-roadmap` | `小学数学` |
| audioDir | `audio` | `audio-py` | `audio-math` |

python-roadmap 的文件此刻**还不存在**（只有计划文档和两个基础设施提交）。本计划不碰它预留的任何路径。

**2. `eslint src` 在这个仓库会挂死，不要用 `npm run lint`。**
ESLint 9 在 `src/scenes/S7Chord.tsx` 上 100% CPU 转不出来 —— 该文件第 162、170 行是以 `//`
开头的 JSX 文本（`<span ...>// follower 落后时用根替换</span>`）。已实测确认：60 秒不返回。
那个文件属于已冻结的 pi-durable，本计划绕开它，不去修。

**本计划所有任务的类型门禁一律是 `npx tsc --noEmit`**（实测 4 秒通过）。

**3. `scripts/tts.mjs` 的参数化改动已写好但未提交。** Task 1 负责验证并提交它。

---

## 验证方式

这个仓库没有测试框架，给一支视频装 vitest 是 YAGNI。所以本计划不写 `expect()`，
但**每个任务都有可执行命令和明确预期**，不许用「看着对」结案：

| 手段 | 命令 | 作用 |
|---|---|---|
| 类型 | `npx tsc --noEmit` | 全自动门禁，每个任务必过。**不要跑 `npm run lint`** |
| 单帧渲染 | `npx remotion still src/index.ts <ID> out/x.png --frame=N` | 真实渲染一帧，有运行时错误会非零退出 —— 本项目最接近单元测试的东西 |
| 人眼 | `npx remotion studio` | 只用于确认观感，不作为任务通过依据 |

**算帧号的工具命令**（timing 生成后可用，后面多次引用，记作 `FRAMES 命令`）：

```bash
node -e '
const t = require("./src/timing.math.json");
for (const s of t.scenes) for (const p of s.paragraphs)
  console.log(`${s.id}-${p.index}\tframe ${s.startFrame + p.startFrame + 25}\t${p.show}`);
'
```

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `scripts/tts.mjs` | 已改好待提交：三个可选位置参数 `[narrationPath] [timingOutPath] [audioOutDir]` |
| `narration.math.json` | 内容源：6 场景 40 句旁白，`say`/`show` 分开 |
| `src/timing.math.json` | TTS 生成，**勿手改** |
| `public/audio-math/*.wav` | 本片 40 个 wav |
| `src/theme.ts` | 改：新增 `MATH_COLORS` 导出，不动 `COLORS` |
| `src/scenes-math/components/Critters.tsx` | 新增：鸡兔形状、35 格阵列、脚点阵、脚数条。**≥2 幕用到的才放这里** |
| `src/scenes-math/M0Pose.tsx` … `M5Outro.tsx` | 新增：六幕，各自独立。幕内专用的视觉留在幕内 |
| `src/ChickenRabbit.tsx` | 新增：按 timing 的绝对帧摆六个 `Sequence` |
| `src/Root.tsx` | 改：新增 `Folder name="Math"` + composition |

**不动：** `narration.json`、`src/timing.json`、`public/audio/`、`src/scenes/`、`src/PiDurable.tsx`、`src/components/`、以及 python-roadmap 预留的 `narration.python.json`、`src/timing.python.json`、`public/audio-py/`、`src/scenes-py/`。

### 代码粒度说明

Task 2（共享原语）和 Task 5（M0）给出**完整代码** —— 原语接口必须精确，M0 是后面五幕的样板。
Task 6–10（M1–M5）给出完整数据常量、逐句画面映射、要调用的原语签名和验证帧号，不逐个 div 预写：
执行时手上已有 M0 这个同仓库样板，和 `src/scenes/S5States.tsx` 这个房屋风格参照。这是刻意取舍，不是省略。

### 房屋风格（必须遵守）

- 场景按当前句分阶段：`const { active, frame } = useSceneFrame(scene);` 然后 `if (active <= 4) { ... }`
- 入场统一 `<Reveal at={scene.paragraphs[i].startFrame}>`，不要自己写 fade
- 缓动只用 `since()` / `easeOut()` / `easeInOut()` / `clamp01()`，不引入新约定
- 内联 style，场景里不写 Tailwind class
- 缩进用 tab
- **禁止写死帧号。** 一切时间从 `scene.paragraphs[i].startFrame` / `durationInFrames` 推导
- **不要在 JSX 文本里写以 `//` 开头的内容** —— 就是它让 eslint 挂死的

---

## Task 1: 落地 TTS 参数化 + 忽略临时产物

**Files:**
- Commit（已改好待提交）: `scripts/tts.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: 确认 tts.mjs 的待提交改动长什么样**

```bash
git diff scripts/tts.mjs
```

预期：看到三个位置参数 `[narrationArg = "narration.json", timingArg = "src/timing.json", audioArg = "public/audio"]`、
`timingPath` 变量、以及 `mkdirSync(dirname(timingPath), { recursive: true })`。
**若 diff 为空**，说明已被别处提交，跳到 Step 4。

- [ ] **Step 2: 确认不带参数时行为与原来完全一致（回归测试）**

缺省参数必须复现 pi-durable 的老行为。写到临时路径验证，不碰真实素材：

```bash
node scripts/tts.mjs narration.json /tmp/timing-probe.json /tmp/audio-probe >/dev/null \
  && diff /tmp/timing-probe.json src/timing.json && echo "IDENTICAL"
```

预期：打印 `IDENTICAL`。`say` 是确定性的，同样的旁白必须产出同样的 timing。
若有 diff，停下来查清楚再继续 —— 这说明参数化改坏了东西。

- [ ] **Step 3: 确认 pi-durable 的真实素材一字未动**

```bash
git status --short public/audio src/timing.json narration.json
```

预期：无输出。

- [ ] **Step 4: 把 TTS 临时目录加进 `.gitignore`**

`.tts-tmp/` 和 `tmp/` 现在是未跟踪的垃圾。在 `.gitignore` 末尾追加：

```
# TTS scratch
.tts-tmp
tmp
```

- [ ] **Step 5: `npx tsc --noEmit`**

预期：PASS，无输出。（`scripts/` 不在 tsc 范围内，这步只确认没连带破坏。）

- [ ] **Step 6: Commit**

```bash
rm -rf .tts-tmp tmp /tmp/audio-probe /tmp/timing-probe.json
git add scripts/tts.mjs .gitignore
git commit -m "feat: take narration, timing and audio paths in the TTS script

The script hardcoded narration.json, src/timing.json and public/audio,
and wipes the audio directory on every run — so generating a second
video's voice-over would delete the first's. Three optional positional
args whose defaults reproduce the original behaviour exactly; verified by
regenerating pi-durable's timing to a scratch path and diffing it against
the committed one.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `MATH_COLORS` + 数学视觉原语

**Files:**
- Modify: `src/theme.ts`
- Create: `src/scenes-math/components/Critters.tsx`

- [ ] **Step 1: 在 `src/theme.ts` 的 `COLORS` 之后加 `MATH_COLORS`**

不要动 `COLORS` 里的任何一项 —— pi-durable 还在用。

```ts
/** Warm palette for the maths explainer. Chickens and rabbits are told apart by
 * shape as well as hue, so the video still reads for colour-blind viewers. */
export const MATH_COLORS = {
	chicken: "#f5c35a",
	chickenSoft: "#3a2c12",
	rabbit: "#b79bff",
	rabbitSoft: "#272042",
	/** Key numbers and the "missing legs" gap. */
	key: "#ff8f4a",
	keySoft: "#3a2113",
	foot: "#d8dced",
	unknown: "#5b6478",
	ok: "#5ed37f",
} as const;
```

- [ ] **Step 2: 建 `src/scenes-math/components/Critters.tsx`**

注意 import 深度是 `../../theme`（文件在 `src/scenes-math/components/` 下）。

```tsx
import type { CSSProperties } from "react";
import { interpolateColors } from "remotion";
import { MATH_COLORS, MONO, clamp01, easeOut } from "../../theme";

/**
 * One animal. `morph` 0 is a chicken (round, warm yellow, two feet), 1 is a
 * rabbit (rounded square, lilac, four feet); fractional values are mid-swap and
 * get a small pop so the change is felt, not just seen. `unknown` is the state
 * the problem actually starts in — we do not yet know what this animal is.
 */
export const Critter: React.FC<{
	morph?: number;
	/** 0..1, lifts exactly two feet off the ground. */
	lift?: number;
	size?: number;
	unknown?: boolean;
	dim?: boolean;
	style?: CSSProperties;
}> = ({ morph = 0, lift = 0, size = 56, unknown = false, dim = false, style }) => {
	const m = clamp01(morph);
	const body = unknown
		? "transparent"
		: interpolateColors(m, [0, 1], [MATH_COLORS.chicken, MATH_COLORS.rabbit]);
	const feet = unknown ? 0 : m > 0.5 ? 4 : 2;
	const pop = 1 + Math.sin(m * Math.PI) * 0.14;
	const foot = Math.max(6, Math.round(size * 0.13));
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: foot * 0.6,
				opacity: dim ? 0.3 : 1,
				...style,
			}}
		>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: `${50 - m * 24}%`,
					background: body,
					border: unknown ? `2px dashed ${MATH_COLORS.unknown}` : "none",
					boxShadow: unknown ? "none" : `0 0 ${size * 0.4}px ${body}55`,
					scale: String(pop),
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: MONO,
					fontSize: size * 0.45,
					color: MATH_COLORS.unknown,
				}}
			>
				{unknown ? "?" : null}
			</div>
			<div style={{ display: "flex", gap: foot * 0.7, height: foot }}>
				{Array.from({ length: feet }, (_, i) => {
					const up = i < 2 ? clamp01(lift) : 0;
					return (
						<span
							key={i}
							style={{
								width: foot,
								height: foot,
								borderRadius: "50%",
								background: MATH_COLORS.foot,
								opacity: 1 - up * 0.75,
								translate: `0px ${-up * size * 0.75}px`,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

/**
 * The 35 animals. Rabbits fill in from the end of the grid, so a fractional
 * `rabbits` animates one swap at a time instead of all of them at once.
 * `enter` 0..1 staggers them in.
 */
export const CritterGrid: React.FC<{
	count?: number;
	rabbits?: number;
	enter?: number;
	lift?: number;
	size?: number;
	columns?: number;
	unknown?: boolean;
	gap?: number;
}> = ({
	count = 35,
	rabbits = 0,
	enter = 1,
	lift = 0,
	size = 56,
	columns = 7,
	unknown = false,
	gap = 20,
}) => (
	<div
		style={{
			display: "grid",
			gridTemplateColumns: `repeat(${columns}, ${size}px)`,
			gap,
			justifyContent: "start",
		}}
	>
		{Array.from({ length: count }, (_, i) => {
			const t = easeOut(clamp01((enter * (count + 8) - i) / 8));
			const morph = clamp01(rabbits - (count - 1 - i));
			return (
				<div key={i} style={{ opacity: t, scale: String(0.6 + t * 0.4) }}>
					<Critter morph={morph} lift={lift} size={size} unknown={unknown} />
				</div>
			);
		})}
	</div>
);

/**
 * A dense row of foot dots. `shown` reveals them progressively; `lifted`
 * raises and fades the first N, which is the whole point of the whistle scene.
 * `paired` tints the dots just past the lifted ones in rabbit lilac.
 */
export const FootDots: React.FC<{
	count?: number;
	shown?: number;
	lifted?: number;
	paired?: number;
	perRow?: number;
	dot?: number;
	gap?: number;
}> = ({ count = 94, shown = count, lifted = 0, paired = 0, perRow = 47, dot = 16, gap = 8 }) => (
	<div style={{ display: "flex", flexDirection: "column", gap }}>
		{Array.from({ length: Math.ceil(count / perRow) }, (_, row) => (
			<div key={row} style={{ display: "flex", gap }}>
				{Array.from({ length: Math.min(perRow, count - row * perRow) }, (_, col) => {
					const i = row * perRow + col;
					const vis = clamp01(shown - i);
					const up = clamp01(lifted - i);
					const isPaired = i >= lifted && i < lifted + paired;
					return (
						<span
							key={col}
							style={{
								width: dot,
								height: dot,
								borderRadius: "50%",
								background: isPaired ? MATH_COLORS.rabbit : MATH_COLORS.foot,
								opacity: vis * (1 - up * 0.82),
								translate: `0px ${-up * 70}px`,
								boxShadow: isPaired ? `0 0 10px ${MATH_COLORS.rabbit}99` : "none",
							}}
						/>
					);
				})}
			</div>
		))}
	</div>
);

/**
 * Leg count on a 0..140 scale — 70 is all chickens, 140 all rabbits — with a
 * tick at the 94 we are aiming for. Showing the full range is deliberate: it
 * makes "70 is the floor" visible rather than asserted.
 */
export const LegBar: React.FC<{
	value: number;
	target?: number;
	max?: number;
	width?: number;
	hit?: boolean;
}> = ({ value, target = 94, max = 140, width = 620, hit = false }) => {
	const pct = clamp01(value / max) * 100;
	const tick = clamp01(target / max) * 100;
	const gap = target - value;
	return (
		<div style={{ width }}>
			<div
				style={{
					position: "relative",
					height: 26,
					borderRadius: 13,
					background: MATH_COLORS.keySoft,
					border: `1px solid ${MATH_COLORS.key}33`,
				}}
			>
				<div
					style={{
						width: `${pct}%`,
						height: "100%",
						borderRadius: 13,
						background: hit ? MATH_COLORS.ok : MATH_COLORS.chicken,
						boxShadow: hit ? `0 0 24px ${MATH_COLORS.ok}88` : "none",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: `${tick}%`,
						top: -10,
						bottom: -10,
						width: 3,
						background: hit ? MATH_COLORS.ok : MATH_COLORS.key,
						boxShadow: `0 0 16px ${hit ? MATH_COLORS.ok : MATH_COLORS.key}`,
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginTop: 10,
					fontFamily: MONO,
					fontSize: 21,
				}}
			>
				<span style={{ color: MATH_COLORS.foot }}>{Math.round(value)} 只脚</span>
				<span style={{ color: hit ? MATH_COLORS.ok : MATH_COLORS.key }}>
					{hit ? `命中 ${target}` : `还差 ${Math.round(gap)}`}
				</span>
			</div>
		</div>
	);
};
```

- [ ] **Step 3: `npx tsc --noEmit`**

预期：PASS。原语还没人用，这步只验类型。

- [ ] **Step 4: Commit**

```bash
git add src/theme.ts src/scenes-math/components/Critters.tsx
git commit -m "feat: add the maths explainer's visual primitives

Chickens and rabbits differ in shape as well as hue so the video still
reads without colour, and Critter morphs between them with a small pop so
a swap is felt rather than merely shown. LegBar plots legs on the full
0..140 range because that is what makes 'all chickens is the floor'
visible instead of asserted.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 旁白文案 + 生成音频

**Files:**
- Create: `narration.math.json`
- Generates: `public/audio-math/*.wav`、`src/timing.math.json`

- [ ] **Step 1: 写 `narration.math.json`**

`say` 里的数字**一律写中文汉字** —— `say -v Tingting` 对阿拉伯数字的读法不可控。
`show` 里用阿拉伯数字，屏幕上更好读。

```json
{
	"voice": "Tingting",
	"rate": 165,
	"gapSeconds": 0.42,
	"leadInSeconds": 0.55,
	"tailSeconds": 1.05,
	"scenes": [
		{
			"id": "s0",
			"index": "01",
			"title": "出题",
			"heading": "35 个头，94 只脚",
			"visual": "pose",
			"paragraphs": [
				{ "say": "笼子里有鸡，也有兔子。", "show": "笼子里有鸡，也有兔子" },
				{ "say": "数一数头，一共三十五个。", "show": "头：35 个" },
				{ "say": "再数一数脚，一共九十四只。", "show": "脚：94 只" },
				{ "say": "那么，鸡有几只，兔子有几只？", "show": "鸡几只？兔几只？" },
				{ "say": "先别急着算。你能猜出来吗？", "show": "先猜一猜" }
			]
		},
		{
			"id": "s1",
			"index": "02",
			"title": "列表法",
			"heading": "一个一个试",
			"visual": "table",
			"paragraphs": [
				{ "say": "最老实的办法，是一个一个去试。", "show": "最笨的办法：一个一个试" },
				{ "say": "假如笼子里全是鸡。三十五只鸡，七十只脚。", "show": "35 鸡 + 0 兔 = 70 只脚" },
				{ "say": "脚不够。换五只兔子进来。", "show": "脚不够，换 5 只兔进来" },
				{ "say": "三十只鸡，五只兔子，八十只脚。还是不够。", "show": "30 鸡 + 5 兔 = 80 只脚" },
				{ "say": "再换五只。九十只脚。快到了。", "show": "25 鸡 + 10 兔 = 90 只脚" },
				{ "say": "再换两只。二十三只鸡，十二只兔子，正好九十四只脚。", "show": "23 鸡 + 12 兔 = 94 只脚 ✓" },
				{ "say": "试出来了。不过，你发现了吗 —— 每多一只兔子，脚就多两只。", "show": "每多 1 只兔，脚多 2 只" }
			]
		},
		{
			"id": "s2",
			"index": "03",
			"title": "假设法",
			"heading": "全当成鸡",
			"visual": "assume",
			"paragraphs": [
				{ "say": "记住刚才那句话：每多一只兔子，脚多两只。", "show": "每多 1 只兔，脚多 2 只" },
				{ "say": "有了它，就不用一个一个试了。", "show": "不用试了" },
				{ "say": "先假设，笼子里全是鸡。", "show": "假设：全是鸡" },
				{ "say": "三十五只鸡，每只两只脚，一共七十只脚。", "show": "35 × 2 = 70 只脚" },
				{ "say": "可实际上有九十四只脚。", "show": "实际：94 只脚" },
				{ "say": "九十四减七十，少算了二十四只脚。", "show": "94 − 70 = 24 只脚不见了" },
				{ "say": "这二十四只脚，是被我们当成鸡的兔子，少掉的。", "show": "这 24 只脚是兔子的" },
				{ "say": "每只兔子少掉两只。二十四除以二，十二只兔子。", "show": "24 ÷ 2 = 12 只兔" },
				{ "say": "三十五减十二，鸡有二十三只。", "show": "35 − 12 = 23 只鸡" }
			]
		},
		{
			"id": "s3",
			"index": "04",
			"title": "抬腿法",
			"heading": "吹一声哨",
			"visual": "lift",
			"paragraphs": [
				{ "say": "还有一个更妙的办法。", "show": "还有更妙的办法" },
				{ "say": "你站在笼子前面，吹一声哨。", "show": "吹一声哨" },
				{ "say": "所有的鸡和兔子，都抬起两只脚。", "show": "所有动物抬起两只脚" },
				{ "say": "三十五只动物，一共抬起七十只脚。", "show": "抬起 35 × 2 = 70 只脚" },
				{ "say": "九十四减七十，地上还剩二十四只脚。", "show": "地上还剩 94 − 70 = 24 只脚" },
				{ "say": "鸡只有两只脚，已经全抬起来了，一只也没剩。", "show": "鸡的脚全抬起来了" },
				{ "say": "所以地上这二十四只脚，全都是兔子的。", "show": "地上的脚全是兔子的" },
				{ "say": "每只兔子在地上留两只。二十四除以二，十二只兔子。", "show": "24 ÷ 2 = 12 只兔" }
			]
		},
		{
			"id": "s4",
			"index": "05",
			"title": "三解合一",
			"heading": "其实是同一句话",
			"visual": "converge",
			"paragraphs": [
				{ "say": "三种办法，答案都是十二只兔子。", "show": "三种办法，同一个答案" },
				{ "say": "再回头看一眼它们。", "show": "再看一眼" },
				{ "say": "列表法，是试出了一个规律。", "show": "列表法：试出规律" },
				{ "say": "假设法，是直接拿这个规律来算。", "show": "假设法：用规律算" },
				{ "say": "抬腿法，是把这个规律，变成了一个动作。", "show": "抬腿法：把规律变成动作" },
				{ "say": "说到底，三种办法讲的是同一句话 —— 一只兔子，比一只鸡多两只脚。", "show": "一只兔比一只鸡多 2 只脚" }
			]
		},
		{
			"id": "s5",
			"index": "06",
			"title": "验算与留题",
			"heading": "换你了",
			"visual": "outro",
			"paragraphs": [
				{ "say": "验算一下。二十三加十二，等于三十五个头。对。", "show": "23 + 12 = 35 个头 ✓" },
				{ "say": "二十三乘二是四十六，十二乘四是四十八，加起来九十四只脚。对。", "show": "46 + 48 = 94 只脚 ✓" },
				{ "say": "最后留一道题给你。", "show": "换你了" },
				{ "say": "自行车和三轮车一共十辆，轮子一共二十六个。各有几辆？", "show": "10 辆车，26 个轮子" },
				{ "say": "小心 —— 这一次，每换一辆车，轮子只多一个。", "show": "这次每换一辆，轮子只多 1 个" }
			]
		}
	]
}
```

- [ ] **Step 2: 生成音频和时间轴**

```bash
node scripts/tts.mjs narration.math.json src/timing.math.json public/audio-math
```

预期：逐句打印时长，末尾 `total 2m XXs  NNNN frames`。

- [ ] **Step 3: 验证产物的形状**

```bash
echo "wav: $(ls public/audio-math/*.wav | wc -l)"
node -e '
const t = require("./src/timing.math.json");
const paras = t.scenes.reduce((n, s) => n + s.paragraphs.length, 0);
console.log("scenes", t.scenes.length, "paragraphs", paras, "seconds", t.totalSeconds.toFixed(1));
if (t.scenes.length !== 6) throw new Error("expected 6 scenes");
if (paras !== 40) throw new Error("expected 40 paragraphs, got " + paras);
if (t.totalSeconds < 120 || t.totalSeconds > 240) throw new Error("duration out of range: " + t.totalSeconds);
console.log("OK");
'
```

预期：`wav: 40`、`scenes 6 paragraphs 40 seconds 1XX.X`、`OK`。
若 `duration out of range`，按 spec 的规定**调旁白句子的多少**，不要去改场景帧数。

- [ ] **Step 4: 听一句，确认数字念对了**

```bash
afplay public/audio-math/s0-2.wav
```

预期：听到「再数一数脚，一共九十四只。」—— 数字念成「九十四」而不是别的。

- [ ] **Step 5: 确认其它两支视频的素材没被动过**

```bash
git status --short public/audio src/timing.json narration.json
```

预期：无输出。

- [ ] **Step 6: Commit**

```bash
git add narration.math.json src/timing.math.json public/audio-math
git commit -m "feat: add narration for the chicken-rabbit explainer

40 lines at rate 165 with 0.42s gaps — slower than pi-durable's 183/0.32
because the audience is nine years old and S0 deliberately leaves a beat
for them to guess. Numbers are spelled out in Chinese characters in the
spoken text because say -v Tingting reads Arabic numerals unpredictably.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 走通骨架 —— composition + 六个占位场景

先让整条片子从头到尾能播（旁白、字幕、标题、进度条全部到位），一个动画都还没写。
这样后面每一幕都是纯粹的内容填充，不和接线问题纠缠。

**Files:**
- Create: `src/ChickenRabbit.tsx`
- Create: `src/scenes-math/M0Pose.tsx` … `M5Outro.tsx`（六个占位）
- Modify: `src/Root.tsx`

- [ ] **Step 1: 建六个占位场景**

六个文件都用这个形状，把组件名和 `scene.title` 换成各自的（`M0Pose`、`M1Table`、`M2Assume`、`M3Lift`、`M4Converge`、`M5Outro`）。注意 import 深度是 `../components/Stage`（文件在 `src/scenes-math/` 下）：

```tsx
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT } from "../theme";
import type { SceneTiming } from "../types";

export const M0Pose: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
			<span style={{ fontFamily: FONT, fontSize: 40, color: COLORS.dim }}>
				{scene.title} · 第 {active + 1} / {scene.paragraphs.length} 句
			</span>
		</div>
	);
};
```

- [ ] **Step 2: 建 `src/ChickenRabbit.tsx`**

结构照抄 `src/PiDurable.tsx`：

```tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { M0Pose } from "./scenes-math/M0Pose";
import { M1Table } from "./scenes-math/M1Table";
import { M2Assume } from "./scenes-math/M2Assume";
import { M3Lift } from "./scenes-math/M3Lift";
import { M4Converge } from "./scenes-math/M4Converge";
import { M5Outro } from "./scenes-math/M5Outro";
import { COLORS } from "./theme";
import timingJson from "./timing.math.json";
import type { SceneTiming, Timing } from "./types";

const timing = timingJson as unknown as Timing;

const BODIES: Record<string, React.FC<{ scene: SceneTiming }>> = {
	s0: M0Pose,
	s1: M1Table,
	s2: M2Assume,
	s3: M3Lift,
	s4: M4Converge,
	s5: M5Outro,
};

/**
 * 鸡兔同笼. Every scene sits at the absolute frame its narration starts, so the
 * audio timeline in timing.math.json is the only source of pacing: regenerating
 * the voice-over re-cuts the whole video.
 */
export const ChickenRabbit: React.FC = () => {
	const { fps } = useVideoConfig();
	return (
		<AbsoluteFill style={{ background: COLORS.bgDeep }}>
			{timing.scenes.map((scene) => {
				const Body = BODIES[scene.id];
				if (Body === undefined) return null;
				return (
					<Sequence
						key={scene.id}
						from={scene.startFrame}
						durationInFrames={scene.durationInFrames}
						premountFor={fps}
					>
						<Stage scene={scene} brand="小学数学" audioDir="audio-math">
							<Body scene={scene} />
						</Stage>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const CR_TOTAL_FRAMES = timing.totalFrames;
```

- [ ] **Step 3: 在 `src/Root.tsx` 注册**

加 import：

```tsx
import { ChickenRabbit, CR_TOTAL_FRAMES } from "./ChickenRabbit";
```

在 `<Folder name="Explainer">` 之后插入：

```tsx
<Folder name="Math">
	<Composition
		id="ChickenRabbit"
		component={ChickenRabbit}
		durationInFrames={CR_TOTAL_FRAMES}
		fps={30}
		width={1920}
		height={1080}
	/>
</Folder>
```

- [ ] **Step 4: `npx tsc --noEmit`**

预期：PASS。

- [ ] **Step 5: 每一幕渲染一帧，确认六幕都能起来**

```bash
node -e '
const t = require("./src/timing.math.json");
console.log(t.scenes.map((s) => s.startFrame + s.paragraphs[0].startFrame + 25).join(" "));
'
```

把打印出的六个帧号依次代入：

```bash
mkdir -p out
for f in <六个帧号>; do
  npx remotion still src/index.ts ChickenRabbit "out/skeleton-$f.png" --frame="$f" || exit 1
done
echo "all six rendered"
```

预期：退出码 0、`all six rendered`、六张 png。用 Read 工具看其中两张：左上角场景编号 + 标题、
右上角「小学数学」、底部字幕条、底部进度条，中间是占位文字。

- [ ] **Step 6: Commit**

```bash
git add src/ChickenRabbit.tsx src/scenes-math src/Root.tsx
git commit -m "feat: wire up the ChickenRabbit composition skeleton

Placeholder scene bodies on purpose: getting narration, captions, headers
and the progress bar playing end to end first means each later scene is
pure content work rather than content tangled with plumbing.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: M0 出题（样板幕）

这一幕给出完整代码，后面五幕照这个形状写。

**Files:**
- Modify: `src/scenes-math/M0Pose.tsx`

- [ ] **Step 1: 实现**

```tsx
import { Chip, Hero, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MATH_COLORS, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { CritterGrid, FootDots } from "./components/Critters";

const Counter: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
	<div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
		<span style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim }}>{label}</span>
		<span style={{ fontFamily: MONO, fontSize: 52, color, lineHeight: 1 }}>{value}</span>
	</div>
);

export const M0Pose: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const heads = easeOut(since(frame, scene.paragraphs[1].startFrame, 34));
	const feet = since(frame, scene.paragraphs[2].startFrame, 46);
	// The chip pulses so the pause for guessing reads as an invitation.
	const pulse = 0.72 + Math.sin(frame / 7) * 0.28;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
			<Hero size={44}>
				笼子里有<span style={{ color: MATH_COLORS.chicken }}>鸡</span>，也有
				<span style={{ color: MATH_COLORS.rabbit }}>兔子</span>
			</Hero>

			<div style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
					<Counter
						label="头"
						value={active >= 1 ? String(Math.round(heads * 35)) : "?"}
						color={active >= 1 ? COLORS.text : COLORS.faint}
					/>
					<CritterGrid count={35} enter={heads} unknown size={48} columns={7} gap={16} />
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
					<Counter
						label="脚"
						value={active >= 2 ? String(Math.round(feet * 94)) : "?"}
						color={active >= 2 ? COLORS.text : COLORS.faint}
					/>
					<FootDots count={94} shown={feet * 94} perRow={24} dot={14} gap={7} />
				</div>
			</div>

			{active >= 3 ? (
				<Reveal at={scene.paragraphs[3].startFrame}>
					<div style={{ display: "flex", alignItems: "center", gap: 40 }}>
						<Counter label="鸡" value="?" color={MATH_COLORS.chicken} />
						<Counter label="兔" value="?" color={MATH_COLORS.rabbit} />
						{active >= 4 ? (
							<Chip
								color={MATH_COLORS.key}
								soft={MATH_COLORS.keySoft}
								style={{ fontSize: 26, padding: "10px 22px", opacity: pulse }}
							>
								先猜一猜
							</Chip>
						) : null}
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
```

- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS

- [ ] **Step 3: 五句各渲一帧**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[0];
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "));
'
for f in <五个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m0-$f.png" --frame="$f" || exit 1; done
```

逐张用 Read 工具检查：第 1 句只有标题；第 2 句头在弹入、计数在涨；第 3 句脚点阵在铺开；
第 4 句出现「鸡 ? 兔 ?」；第 5 句出现「先猜一猜」。**35 只动物必须是虚线 unknown，不是鸡。
没有文字溢出、没有元素重叠。**

- [ ] **Step 4: Commit**

```bash
git add src/scenes-math/M0Pose.tsx
git commit -m "feat: pose the problem in M0

The 35 animals are drawn as dashed unknowns rather than chickens: not
knowing which is which is the problem, and showing them as chickens would
give away the substitution method two scenes early.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: M1 列表法

**Files:**
- Modify: `src/scenes-math/M1Table.tsx`

**数据常量**（照抄，`at` 是这一行在第几句出现）：

```tsx
const ROWS = [
	{ chickens: 35, rabbits: 0, legs: 70, at: 1 },
	{ chickens: 30, rabbits: 5, legs: 80, at: 3 },
	{ chickens: 25, rabbits: 10, legs: 90, at: 4 },
	{ chickens: 23, rabbits: 12, legs: 94, at: 5 },
] as const;
```

**逐句画面：**

| 句 | 画面 |
|---|---|
| 0 | 一行小标题「最笨的办法：一个一个试」+ 空表头（鸡 / 兔 / 脚） |
| 1 | 第 1 行写入；右侧 `LegBar value={70}` |
| 2 | 第 1 行的「70」变 `MATH_COLORS.key` 并脉冲，LegBar 的「还差 24」高亮 |
| 3 | 第 2 行写入，LegBar 平滑走到 80 |
| 4 | 第 3 行写入，LegBar 走到 90 |
| 5 | 第 4 行写入，LegBar 走到 94 且 `hit` 为 true（变绿发光） |
| 6 | 相邻行之间浮出 `+5 兔 → +10 脚` 小箭头，底部一条 `MATH_COLORS.key` 横幅：**每多 1 只兔，脚多 2 只** |

**实现要点：**
- 表格用 `display: grid`、`gridTemplateColumns: "140px 140px 180px"`，行间 `gap: 14`
- 每行 `<Reveal at={scene.paragraphs[row.at].startFrame} from="left">` 包起来，`active >= row.at` 才渲染
- `LegBar` 的 `value` 要平滑：取当前已出现的最后一行为目标，用
  `easeInOut(since(frame, scene.paragraphs[row.at].startFrame, 20))` 在前一行和这一行的 `legs` 之间插值
- 第 6 句横幅用 `<Reveal at={scene.paragraphs[6].startFrame} from="scale">`

- [ ] **Step 1: 实现上表**
- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS
- [ ] **Step 3: 七句各渲一帧并逐张检查**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[1];
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "));
'
for f in <七个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m1-$f.png" --frame="$f" || exit 1; done
```

检查点：四行按序出现、LegBar 刻度线在 94 处、最后一行命中时变绿、末帧有规律横幅、无溢出重叠。

- [ ] **Step 4: Commit** — `feat: lay out the enumeration method in M1`
  提交信息说明：这一幕的目的不是解题，是让观众自己看见「每多一只兔脚多两只」，后两幕都站在它上面。

---

## Task 7: M2 假设法

**Files:**
- Modify: `src/scenes-math/M2Assume.tsx`

**逐句画面：**

| 句 | 画面 |
|---|---|
| 0 | 居中大字横幅：**每多 1 只兔，脚多 2 只**（接上一幕结论） |
| 1 | 横幅缩小上移到顶部，变成常驻提示条 |
| 2 | `CritterGrid` 35 只**全鸡**（`rabbits={0}`）staggered 入场 |
| 3 | 右侧 `35 × 2 = 70`，`LegBar value={70}` |
| 4 | 「实际 94」出现，LegBar 的 94 刻度线脉冲 |
| 5 | `94 − 70 = 24` 大字，缺口区间用 `MATH_COLORS.key` 半透明色块罩住并脉冲 |
| 6 | 「这 24 只脚是兔子的」，24 个脚点浮现并染成兔紫 |
| 7 | **换脚动画**：`rabbits` 从 0 平滑走到 12，LegBar 同步 70→94；右侧 `24 ÷ 2 = 12` |
| 8 | `35 − 12 = 23`，底部答案条：鸡 23 / 兔 12 |

**实现要点：**
- 第 7 句是本幕高潮：`const swap = easeInOut(since(frame, scene.paragraphs[7].startFrame, 48))`，
  然后 `<CritterGrid rabbits={swap * 12} />` 和 `<LegBar value={70 + swap * 24} hit={swap > 0.98} />`。
  `CritterGrid` 的 `rabbits` 接受小数，会一只一只地变 —— **不要取整**
- 第 0/1 句横幅的「缩小上移」用同一个 `since(frame, scene.paragraphs[1].startFrame, 24)` 同时驱动
  `fontSize`、`translate` 和容器 `gap`，别用两套插值

- [ ] **Step 1: 实现上表**
- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS
- [ ] **Step 3: 九句各渲一帧 + 换脚动画中段两帧**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[2];
const p7 = s.startFrame + s.paragraphs[7].startFrame;
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "), p7 + 16, p7 + 32);
'
for f in <十一个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m2-$f.png" --frame="$f" || exit 1; done
```

检查点：中段两帧必须能看到**部分已变紫、部分还是黄**的半途状态（证明小数插值生效，不是一下全变）；
末帧 LegBar 命中 94 变绿；答案条 鸡 23 / 兔 12。

- [ ] **Step 4: Commit** — `feat: work the substitution method in M2`

---

## Task 8: M3 抬腿法

本幕**不能暴露哪 12 只是兔子** —— 抬腿法的妙处正是不需要知道。所以主角是脚点，不是动物：
上方 35 只 unknown 动物，一条地面线，线下 94 个脚点。吹哨后 70 个脚点升起淡出，剩 24 个两两配对。

**Files:**
- Modify: `src/scenes-math/M3Lift.tsx`

**逐句画面：**

| 句 | 画面 |
|---|---|
| 0 | 顶部一行「还有更妙的办法」 |
| 1 | 35 只 unknown 动物 + 地面线 + 线下 94 个脚点全部就位 |
| 2 | 哨声：一圈白色脉冲从中心扩散（`since` 驱动 scale + 透明度），动物轻微弹一次 |
| 3 | `FootDots lifted={70 × 进度}` —— 70 个脚点升起淡出；右侧 `抬起 70` |
| 4 | `94 − 70 = 24` 大字；地上剩的 24 个脚点高亮 |
| 5 | 旁白讲「鸡的脚全抬完了」，升起那批脚点染成 `MATH_COLORS.chicken` 再淡出 |
| 6 | 地上 24 个脚点全部染成 `MATH_COLORS.rabbit` |
| 7 | `paired` 从 0 走到 24，两两之间画连接弧，右侧 `24 ÷ 2 = 12 只兔` |

**实现要点：**
- 用 `FootDots count={94} lifted={...} paired={...} perRow={47} dot={16}`
- 地面线：一条 `height: 2`、`background: COLORS.border` 的横线，脚点容器放它下面
- 哨声脉冲：`const w = since(frame, scene.paragraphs[2].startFrame, 22)`，
  一个绝对定位的圆 `scale: 0.2 + w * 3`、`opacity: (1 - w) * 0.5`、`border: 2px solid #fff`
- 两两配对的连接弧：24 个点分 12 组，每组用一个 `borderBottom` 圆角小方块跨在两点下方即可，
  **不要引 SVG**

- [ ] **Step 1: 实现上表**
- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS
- [ ] **Step 3: 八句各渲一帧 + 抬腿动画中段一帧**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[3];
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "),
  s.startFrame + s.paragraphs[3].startFrame + 14);
'
for f in <九个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m3-$f.png" --frame="$f" || exit 1; done
```

检查点：**动物全程是虚线 unknown，一只都没变成兔子**（本幕的正确性要求）；
中段帧能看到一部分脚点悬在空中；末帧地上恰好 24 个紫点、12 组配对弧。

- [ ] **Step 4: Commit** — `feat: lift the legs in M3`
  提交信息说明：动物全程保持 unknown 是刻意的 —— 抬腿法不需要知道谁是兔子，画出来就漏答案了。

---

## Task 9: M4 三解合一

**Files:**
- Modify: `src/scenes-math/M4Converge.tsx`

**数据常量：**

```tsx
const METHODS = [
	{ name: "列表法", essence: "试出规律", at: 2, color: MATH_COLORS.chicken },
	{ name: "假设法", essence: "用规律算", at: 3, color: MATH_COLORS.key },
	{ name: "抬腿法", essence: "把规律变成动作", at: 4, color: MATH_COLORS.rabbit },
] as const;
```

**逐句画面：**

| 句 | 画面 |
|---|---|
| 0 | 居中「三种办法，同一个答案」+ 大字 `12 只兔` |
| 1 | 三列 `Panel` 并排淡入（都还是暗的） |
| 2 | 第 1 列点亮（`active` + 自己的 color） |
| 3 | 第 2 列点亮 |
| 4 | 第 3 列点亮 |
| 5 | **三列向中间收敛**：左列右移、右列左移、整体淡到 0.18，中间浮出一行大字：**一只兔比一只鸡多 2 只脚** |

**实现要点：**
- 收敛：`const conv = easeInOut(since(frame, scene.paragraphs[5].startFrame, 34))`，
  第 i 列 `translate: ${(1 - i) * conv * 300}px 0px`、`opacity: 1 - conv * 0.82`
- 中间那行字同一个 `conv` 驱动 `opacity: conv` 和 `scale: 0.86 + conv * 0.14`，
  颜色 `MATH_COLORS.key`，`fontSize: 56`
- 三列和中间那行放在同一个相对定位容器里，中间那行绝对定位居中，否则收敛时会互相挤

- [ ] **Step 1: 实现上表**
- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS
- [ ] **Step 3: 六句各渲一帧 + 收敛中段一帧**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[4];
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "),
  s.startFrame + s.paragraphs[5].startFrame + 17);
'
for f in <七个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m4-$f.png" --frame="$f" || exit 1; done
```

检查点：三列按序点亮；中段帧能看到三列正在往中间挪、中间的字半透明；末帧中间那句话清晰醒目，三列退成背景。

- [ ] **Step 4: Commit** — `feat: converge the three methods in M4`
  提交信息说明：这一幕是全片的点，不是总结 —— 三种解法内核是同一句话。

---

## Task 10: M5 验算 + 留题

**Files:**
- Modify: `src/scenes-math/M5Outro.tsx`

**逐句画面：**

| 句 | 画面 |
|---|---|
| 0 | `23 + 12 = 35 个头` 从左到右写出，末尾一个 `MATH_COLORS.ok` 的 ✓ 弹入 |
| 1 | `23 × 2 + 12 × 4 = 94 只脚` 同样写出 + ✓ |
| 2 | 两条验算上移淡化，中央「换你了」弹入 |
| 3 | 变形题面板：10 辆车 + `26 个轮子` |
| 4 | 底部 `MATH_COLORS.key` 警示条：**这次每换一辆，轮子只多 1 个** |

**实现要点：**
- 「从左到右写出」用 `clipPath: inset(0 ${(1 - p) * 100}% 0 0)`，`p = easeOut(since(...))`
- ✓ 的弹入用 `<Reveal from="scale">`，延后 12 帧（`at: scene.paragraphs[i].startFrame + 12`）
- 小车不要新建组件（只这一幕用）：一个 `borderRadius: 10` 的方块 + 下面 2 或 3 个轮子圆点，
  **但 10 辆全部画成虚线 unknown**（`border: 2px dashed ${MATH_COLORS.unknown}`、轮子也不画）
  —— 留给观众的题不能把答案画出来
- 警示条是全片最后一个画面，`fontSize: 34`，给足 padding

- [ ] **Step 1: 实现上表**
- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS
- [ ] **Step 3: 五句各渲一帧**

```bash
node -e '
const t = require("./src/timing.math.json");
const s = t.scenes[5];
console.log(s.paragraphs.map((p) => s.startFrame + p.startFrame + 25).join(" "));
'
for f in <五个帧号>; do npx remotion still src/index.ts ChickenRabbit "out/m5-$f.png" --frame="$f" || exit 1; done
```

检查点：两条验算都有 ✓；**10 辆车全是虚线 unknown，没有泄露 4 辆自行车 6 辆三轮车**；
末帧警示条完整可读。

- [ ] **Step 4: Commit** — `feat: verify and hand over in M5`
  提交信息说明：变形题每换一辆轮子只多 1 个，刻意打破 +2 的模式 —— 背公式的人会在这里翻车。

---

## Task 11: 整片验收

**Files:** 无改动，纯验证。

- [ ] **Step 1: 类型**

```bash
npx tsc --noEmit
```

预期：PASS，无输出。

- [ ] **Step 2: 另两支视频的回归**

本片全程没碰 pi-durable 的任何文件，这步确认该事实成立、且 pi-durable 仍能渲染：

```bash
git status --short narration.json src/timing.json public/audio src/scenes src/PiDurable.tsx
npx remotion still src/index.ts PiDurable out/final-regress-pi.png --frame=1200 || exit 1
```

预期：`git status` 无输出；渲染退出码 0。用 Read 工具看 png，确认是 pi-durable 的正常画面。

- [ ] **Step 3: 全片抽帧 —— 每一句都渲一帧，任何一句崩了都会在这里暴露**

```bash
rm -rf out/sweep && mkdir -p out/sweep
node -e '
const t = require("./src/timing.math.json");
for (const s of t.scenes) for (const p of s.paragraphs)
  console.log(`${s.id}-${p.index} ${s.startFrame + p.startFrame + 25}`);
' | while read -r name f; do
  npx remotion still src/index.ts ChickenRabbit "out/sweep/$name.png" --frame="$f" || exit 1
done
echo "rendered: $(ls out/sweep/*.png | wc -l)"
```

预期：`rendered: 40`，中途无失败。

- [ ] **Step 4: 逐张看 40 帧，确认没有文字溢出、元素重叠、空画面**

用 Read 工具抽看，重点查这四项**正确性**要求（不只是美观）：

1. M0 的 35 只动物是虚线 unknown，不是鸡
2. M3 全程动物保持 unknown
3. M5 的 10 辆车保持 unknown
4. M2 的换脚中段能看到黄紫混杂的半途状态

任一项不满足 → 回到对应任务修，不要在这里将就。

- [ ] **Step 5: 渲染整片**

```bash
npx remotion render src/index.ts ChickenRabbit out/chicken-rabbit.mp4
```

预期：退出码 0，生成 mp4。`out/` 在 `.gitignore` 里，不会被提交。

- [ ] **Step 6: 更新 spec 的状态并提交**

把 spec 开头的 `状态：已评审通过，待实现` 改成 `状态：已实现`。
同时把 spec 的「技术架构」一节改成兄弟文件命名约定（spec 里原来写的 slug 方案已被仓库既有约定取代）。

```bash
git add docs/superpowers/specs/2026-10-08-chicken-rabbit-explainer-design.md
git commit -m "docs: mark the chicken-rabbit explainer as implemented

Also replaces the spec's slug-based asset layout with the sibling-file
convention the repo had already settled on, which leaves pi-durable's
paths untouched instead of moving them.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## 自检记录

对着 spec 逐节核过：

| spec 小节 | 对应任务 |
|---|---|
| 题目与答案 | Task 3（旁白）、Task 5–10（画面） |
| S0–S5 六幕内容 | Task 5、6、7、8、9、10 |
| 视觉设计（配色、形状双重区分） | Task 2 |
| 技术架构 / 文件布局 | Task 1、4 —— **已按仓库既有约定改写**，见下 |
| 旁白脚本 40 句 | Task 3（全文照抄） |
| 动画要点表 | Task 5–10 各自的「逐句画面」和「实现要点」 |
| 测试与验收 4 条 | Task 11（类型 / studio / pi-durable 回归 / 抽帧）。**`npm run lint` 换成 `npx tsc --noEmit`** |
| 风险：弄坏 pi-durable | 本计划不碰它任何文件；Task 1 Step 3、Task 3 Step 5、Task 11 Step 2 三道确认 |
| 风险：旁白重生成导致错位 | 房屋风格明令禁止写死帧号；每幕验证帧号都从 timing 算出 |
| 风险：35 头 + 94 脚排不开 | Task 5 用 `perRow={24} dot={14}`，Task 8 用 `perRow={47} dot={16}` |
| 风险：`say` 读错数字 | Task 3 Step 1 明令 `say` 用中文汉字；Step 4 实听一句 |

**与 spec 的两处刻意偏离：**

1. **素材布局换成兄弟文件命名**（`narration.math.json` 等），不是 spec 写的 slug 目录方案。
   原因：仓库里已有另一支视频（python-roadmap）定下了这套约定，并且 `tts.mjs` 已按它改好。
   采用它的额外好处是 pi-durable 的路径完全不动，回归风险归零。Task 11 Step 6 顺手把 spec 改正。
2. **类型门禁用 `npx tsc --noEmit` 而非 spec 写的 `npm run lint`。**
   原因：`eslint src` 在本仓库挂死（`src/scenes/S7Chord.tsx` 的 JSX 文本以 `//` 开头），已实测确认。

命名一致性核对：`MATH_COLORS`（Task 2 定义，Task 5–10 使用）、`Critter` / `CritterGrid` / `FootDots` /
`LegBar`（Task 2 定义，Task 5–10 调用签名一致）、`audioDir="audio-math"`（Task 4 使用，与
`public/audio-math` 一致）、`CR_TOTAL_FRAMES`（Task 4 定义并在同任务内使用）、
`src/scenes-math/components/Critters.tsx` 在 Task 5 的 import 路径是 `./components/Critters`（同级目录，正确）。
