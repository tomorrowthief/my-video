# Python 进阶路线图视频 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 `my-video` Remotion 项目里新增一条 15 分钟的《Python 进阶路线图》讲解视频，13 个场景，每个知识点都带可验证的练习动作，且不影响现有 pi-durable 视频。

**Architecture:** 沿用现有管线——`narration.python.json` 是内容源，`scripts/tts.mjs` 用 macOS `say` 生成配音并写出 `src/timing.python.json`，`timing` 是画面节奏的唯一真相，`PythonRoadmap.tsx` 按 `startFrame` 摆放 13 个场景。四个大章节各有一个视觉母题组件，章节内场景复用。

**Tech Stack:** Remotion 4.0.533、React 19、TypeScript 5.9、手写 inline style（与现有场景一致）、macOS `say` + `afconvert`

**Spec:** `docs/superpowers/specs/2026-10-07-python-advanced-roadmap-video-design.md`

---

## 关于「测试」

这个项目没有单元测试框架（`package.json` 只有 `eslint` / `tsc` / `prettier`）。**不要引入 vitest 或 jest**——视频代码的正确性不是单元测试保证的。

本计划每个任务的验证手段是下面三种：

| 手段 | 命令 | 验证什么 |
|---|---|---|
| 类型与规范 | `npx tsc --noEmit && npx eslint <本任务改动的文件>` | 类型正确、无 lint 错误 |
| 渲染抽帧 | `npx remotion still PythonRoadmap out/check-<id>.png --frame=<N>` | 该帧能渲染、不崩、布局不溢出 |
| 真实运行 | `node scripts/tts.mjs ...` / `npm run dev` | 管线端到端通、时长符合预期 |

「渲染抽帧」是本项目里最接近测试的东西：几秒内告诉你场景组件是不是崩了、有没有溢出。**每个场景任务都必须做这一步**。

### ⚠️ 不要跑 `npm run lint`

`npm run lint` 展开是 `eslint src && tsc`。**`eslint src` 在本仓库现在是挂死的**，100% CPU 死循环、永不退出，与本计划的改动无关。

复现与定位（已实测）：

- `src/scenes/S7Chord.tsx` 第 162、170 行：`<span style={{ color: COLORS.faint }}>// follower 落后时用根替换</span>`。
- **只要 JSX 文本节点的内容以 `//` 开头，ESLint 9 就死循环。**
- 用「零规则配置 + 只挂 TS parser」同样复现 → 与 Remotion 配置、rules、TS parser 都无关；`@typescript-eslint/parser` 解析这个文件只要 26ms。
- 全仓库只有 `S7Chord.tsx` 踩到（`grep -rn '>//' src/`）。该文件属于现有 pi-durable 视频，**本计划不得修改**，所以绕开它，不要试图修。

因此每个任务的 lint 步骤都写成 `npx eslint <本任务改动的文件>`。对本计划触碰的文件，覆盖面与 `npm run lint` 完全一致；`tsc --noEmit` 仍然是全项目检查。

**写新场景时的写法规则：**

| 写法 | 结果 |
|---|---|
| `<Tag>// 注释</Tag>`（`>` 后紧跟 `//`） | ❌ 死循环 |
| `<Tag>{"// 注释"}</Tag>` | ✅ 正常 |
| 换行缩进后再写 `//`（文本节点以空白开头） | ✅ 正常 |
| `<Tag>a // b</Tag>`（`//` 不在行首） | ✅ 正常 |
| `<Tag>{/* 注释 */}</Tag>`（JSX 注释） | ✅ 正常 |

也就是说：本计划里所有多行缩进的 JSX 天然安全，只有「把 `//` 紧贴在标签右尖括号后面」才会踩雷。Python 注释是 `#`；唯一要留意的是 Python 整除 `//`——只要它不在文本节点行首就没事。

---

## 文件结构

**新增：**

| 文件 | 职责 |
|---|---|
| `narration.python.json` | 内容源：13 场景的旁白与字幕文本 |
| `src/timing.python.json` | TTS 生成，勿手改 |
| `src/PythonRoadmap.tsx` | 合成入口：把 timing 里的场景摆到时间轴上 |
| `src/scenes-py/components/PracticeBox.tsx` | 右侧「怎么练」面板，全片统一出口 |
| `src/scenes-py/components/CodeCompare.tsx` | 语言内核母题：左右代码对比 + 差异行高亮 |
| `src/scenes-py/components/Timeline.tsx` | 并发母题：横向执行时间轴 |
| `src/scenes-py/components/TreeCompare.tsx` | 工程化母题：目录树 + 配置片段 |
| `src/scenes-py/components/EcosystemPicker.tsx` | 生态母题：三列路线卡片 |
| `src/scenes-py/P0Hook.tsx` … `P12Outro.tsx` | 13 个场景，每个一个文件 |

**修改（向后兼容）：**

| 文件 | 改动 |
|---|---|
| `src/components/Stage.tsx` | `Stage` 加可选 `brand` / `audioDir` prop，透传给 `SceneHeader` / `Narration` |
| `scripts/tts.mjs` | 加三个可选位置参数，缺省行为不变；并加路径守卫（见下） |
| `src/Root.tsx` | 新增 `Composition id="PythonRoadmap"` |

**不动：** `narration.json`、`src/timing.json`、`public/audio/`、`src/scenes/`、`src/PiDurable.tsx`。

### `tts.mjs` 的调用契约（务必照做）

参数是**相对项目根**的路径，`join(root, arg)` 拼接，所以绝对路径会被静默重写成根目录下的相对路径（`/tmp/x` → `<root>/tmp/x`）。

**永远显式传满三个参数**，或一个都不传：

```bash
node scripts/tts.mjs narration.python.json src/timing.python.json public/audio-py   # ✅
node scripts/tts.mjs                                                                # ✅ 缺省 = pi-durable
node scripts/tts.mjs narration.python.json                                          # ❌ 另外两个回落到缺省，会重写冻结的 src/timing.json 和 public/audio/
```

第三种写法是真实陷阱：脚本对音频目录执行 `rmSync(..., { recursive: true, force: true })`，所以在迭代 python 旁白时漏掉后两个参数，会删掉 pi-durable 的 106 个 wav。脚本已加守卫，会拒绝空参数、`.`、`..` 这类会删掉项目本身的路径，但**「只传一个参数」它拦不住**，因为那是合法的缺省行为。

本计划里 4 处调用全部合规。如果你临时手敲，先存档：`git stash` 或先确认 `git status` 干净。

---

## 场景与段落索引（全片导航）

每个场景的段落用 `p00-0` 这样的 id 引用（场景 id + 段落下标）。场景组件里靠 `active` 段落下标驱动画面状态，这是所有场景组件的共同约定。

| 场景 | id | 段落数 | 母题 |
|---|---|---|---|
| 开场：能跑 ≠ 会用 | `p00` | 6 | hook（无母题） |
| 路线图 + 学法总纲 | `p01` | 8 | roadmap |
| 数据模型：一切都是协议 | `p02` | 7 | code |
| 装饰器与闭包 | `p03` | 7 | code |
| 迭代器与生成器 | `p04` | 7 | code |
| 类型系统 | `p05` | 7 | code |
| GIL 的真相与并发选型 | `p06` | 7 | timeline |
| asyncio 心智模型 | `p07` | 7 | timeline |
| 性能：先测量再优化 | `p08` | 7 | timeline |
| 项目结构与依赖管理 | `p09` | 7 | tree |
| 测试与质量 | `p10` | 7 | tree |
| 三条路线选型 | `p11` | 7 | ecosystem |
| 收尾：8 周计划 | `p12` | 8 | plan |

合计 92 段。实测（Task 3 跑完后回填）：语音净长 970 秒，加上段落间隔与场景开销共约 46 秒，合计 **1016 秒 ≈ 16 分 56 秒**，落在 13–17 分钟区间内——但已贴近上界，所以后续任何任务都不要再往旁白里加句子。此处原先写的「93 段 / 约 14.9 分钟」是笔误：上表的 6+8+7×10+8 = 92，且原估算漏算了每段约 0.5 秒的间隔开销。

---

## Task 0: 建立基线分支并提交现有工作

工作树里整条 pi-durable 视频（`narration.json`、`src/scenes/`、`src/PiDurable.tsx`、`src/components/`、`src/theme.ts`、`scripts/`）都还没提交。后续任务要频繁提交，需要一个干净的起点。

**Files:**
- 无代码改动

- [ ] **Step 1: 确认当前状态**

Run: `cd /Users/zhongling/mypro/my-video && git status --short && git branch --show-current`

Expected: 当前在 `main`，有一批未跟踪和被修改的文件。记下这个列表。

- [ ] **Step 2: 确认 `.gitignore` 覆盖生成物**

Run: `cat .gitignore`

Expected: 包含 `node_modules`、`out`。如果 `public/audio` 或 `src/timing.json` 被忽略，需要确认——它们**应该**被提交（是渲染产物，但重跑 TTS 才能重建，提交能保证渲染可复现）。如果没有被忽略，什么都不用做。

- [ ] **Step 3: 创建分支**

```bash
git checkout -b python-roadmap-video
```

Expected: `Switched to a new branch 'python-roadmap-video'`

- [ ] **Step 4: 提交现有 pi-durable 基线**

```bash
git add -A
git commit -m "chore: baseline pi-durable explainer before python roadmap work

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

Expected: 一个包含全部现有视频文件的提交。

- [ ] **Step 5: 验证基线可渲染**

Run: `npx remotion still PiDurable /tmp/baseline-pidurable.png --frame=600`

Expected: 生成 PNG，无报错。这是后面回归对比的基准。

---

## Task 1: 参数化 `Stage.tsx`

`Stage.tsx` 有两处硬编码，导致它只能服务 pi-durable：页眉右角的品牌名（`Stage.tsx:97` 的 `pi-durable`）和音频目录（`Stage.tsx:175` 的 `audio/${file}`）。

**Files:**
- Modify: `src/components/Stage.tsx`

- [ ] **Step 1: 给 `SceneHeader` 加 `brand` prop**

把 `SceneHeader` 的签名和硬编码处改掉：

```tsx
const SceneHeader: React.FC<{ scene: SceneTiming; brand: string }> = ({ scene, brand }) => {
```

同时把第 97 行的字面量：

```tsx
			<span
				style={{
					fontFamily: '"SF Mono", Menlo, monospace',
					fontSize: 17,
					color: COLORS.faint,
					letterSpacing: "0.08em",
				}}
			>
				pi-durable
			</span>
```

改成：

```tsx
			<span
				style={{
					fontFamily: '"SF Mono", Menlo, monospace',
					fontSize: 17,
					color: COLORS.faint,
					letterSpacing: "0.08em",
				}}
			>
				{brand}
			</span>
```

- [ ] **Step 2: 给 `Narration` 加 `audioDir` prop**

```tsx
const Narration: React.FC<{ scene: SceneTiming; audioDir: string }> = ({ scene, audioDir }) => {
	const { fps } = useVideoConfig();
	return (
		<>
			{scene.paragraphs.map((paragraph) => (
				<Sequence
					key={paragraph.index}
					from={paragraph.startFrame}
					durationInFrames={paragraph.durationInFrames + 8}
					premountFor={fps}
				>
					<Audio src={staticFile(`${audioDir}/${paragraph.file}`)} />
				</Sequence>
			))}
		</>
	);
};
```

- [ ] **Step 3: 给 `Stage` 加可选 prop 并透传**

```tsx
/**
 * One scene: backdrop, header, the scene's own content, narration audio and the
 * caption band. Scenes own everything between the header and the caption.
 *
 * `brand` and `audioDir` default to the pi-durable explainer's values so that
 * composition keeps rendering exactly as before.
 */
export const Stage: React.FC<{
	scene: SceneTiming;
	brand?: string;
	audioDir?: string;
	children: ReactNode;
}> = ({ scene, brand = "pi-durable", audioDir = "audio", children }) => {
	const { frame, paragraph, local } = useSceneFrame(scene);
	const out = since(frame, scene.durationInFrames - 14, 14);
	return (
		<AbsoluteFill style={{ width: W, height: H, overflow: "hidden", opacity: 1 - out * 0.9 }}>
			<Backdrop scene={scene} />
			<SceneHeader scene={scene} brand={brand} />
			<div style={{ position: "absolute", left: PAD, right: PAD, top: 132, bottom: 148 }}>{children}</div>
			<Caption scene={scene} paragraph={paragraph} local={local} />
			<ProgressBar scene={scene} />
			<Narration scene={scene} audioDir={audioDir} />
		</AbsoluteFill>
	);
};
```

- [ ] **Step 4: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。`PiDurable.tsx` 没有传新 prop，走默认值。

- [ ] **Step 5: 回归验证——PiDurable 画面必须和基线一致**

Run: `npx remotion still PiDurable /tmp/after-stage-params.png --frame=600`

然后对比两张图。

Run: `python3 -c "import hashlib,sys; a=hashlib.md5(open('/tmp/baseline-pidurable.png','rb').read()).hexdigest(); b=hashlib.md5(open('/tmp/after-stage-params.png','rb').read()).hexdigest(); print(a); print(b); print('SAME' if a==b else 'DIFFERENT')"`

Expected: `SAME`。如果 `DIFFERENT`，说明改动引入了视觉变化，必须查清楚——默认值路径不应该改变任何渲染结果。

- [ ] **Step 6: 提交**

```bash
git add src/components/Stage.tsx
git commit -m "refactor: make Stage brand and audio dir configurable

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

## Task 2: 参数化 `scripts/tts.mjs`

脚本目前写死读 `narration.json`、写 `src/timing.json`、输出 `public/audio/`。加三个可选位置参数，缺省时行为与现在完全一致。

**Files:**
- Modify: `scripts/tts.mjs:1-14` 和 `:42-45` 和 `:93-95`

- [ ] **Step 1: 改路径解析**

把文件开头这段：

```js
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const narration = JSON.parse(readFileSync(join(root, "narration.json"), "utf8"));
const outDir = join(root, "public", "audio");
const tmpDir = join(root, ".tts-tmp");
```

改成：

```js
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Optional positional args so one project can host more than one explainer:
//   node scripts/tts.mjs [narrationPath] [timingOutPath] [audioOutDir]
// Paths are relative to the project root. Defaults reproduce the original
// pi-durable behaviour exactly.
const [narrationArg = "narration.json", timingArg = "src/timing.json", audioArg = "public/audio"] =
	process.argv.slice(2);

const narration = JSON.parse(readFileSync(join(root, narrationArg), "utf8"));
const outDir = join(root, audioArg);
const timingPath = join(root, timingArg);
const tmpDir = join(root, ".tts-tmp");
```

- [ ] **Step 2: 改 tmpDir 清理的位置**

`rmSync(outDir, ...)` 现在会删掉整个音频目录。如果两个视频共用一个目录名会误删，但现在目录是分开的，保持行为即可，只需保证输出目录的父目录存在：

把这段：

```js
rmSync(tmpDir, { recursive: true, force: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
```

改成：

```js
rmSync(tmpDir, { recursive: true, force: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(timingPath), { recursive: true });
```

- [ ] **Step 3: 改 timing 输出路径**

把：

```js
writeFileSync(
	join(root, "src", "timing.json"),
	`${JSON.stringify(
```

改成：

```js
writeFileSync(
	timingPath,
	`${JSON.stringify(
```

- [ ] **Step 4: 冒烟测试——缺省行为不变**

⚠️ 缺省运行会**重写 `src/timing.json` 和 `public/audio/` 里的每一个 wav**，这两个都是冻结产物，必须先快照：

```bash
cp src/timing.json /tmp/timing.json.bak
rm -rf /tmp/audio-before && cp -R public/audio /tmp/audio-before
```

Run: `node scripts/tts.mjs`

Expected: 终端逐场景打印句数和秒数，最后一行 `total 15m 43s  28289 frames`。**帧数必须和备份一致**（28289）。

Run:

```bash
diff /tmp/timing.json.bak src/timing.json && echo "TIMING_IDENTICAL"
git status --short -- public/audio && echo "AUDIO_CLEAN"
```

Expected: `TIMING_IDENTICAL`，且 `git status` 在 `public/audio` 下**没有输出**（重新生成的 wav 与已提交的逐字节一致），随后打印 `AUDIO_CLEAN`。

如果不同：先还原冻结产物（`cp /tmp/timing.json.bak src/timing.json`；`rm -rf public/audio && cp -R /tmp/audio-before public/audio`），再排查，不要提交。

- [ ] **Step 5: 冒烟测试——新参数可用**

参数是**相对项目根**的路径。脚本用 `join(root, arg)` 拼接，所以传绝对路径（如 `/tmp/x`）不会被当成绝对路径，而会变成 `<root>/tmp/x` —— 输出会悄悄落进仓库里。**必须传相对路径。**

Run: `node scripts/tts.mjs narration.json .tts-probe/timing.json .tts-probe/audio`

Expected: 成功，退出码 0，最后一行 `total 15m 43s  28289 frames`。

Run:

```bash
diff /tmp/timing.json.bak .tts-probe/timing.json && echo "IDENTICAL"
ls .tts-probe/audio/*.wav | wc -l ; ls public/audio/*.wav | wc -l
```

Expected: `IDENTICAL`（同样的旁白 → 同样的时长，与输出路径无关），两个 wav 数都是 106。

Run: `rm -rf .tts-probe`（清理探针产物，别留进仓库）

- [ ] **Step 6: 提交**

```bash
git add scripts/tts.mjs
git commit -m "refactor: let tts.mjs take narration, timing and audio paths

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: 写完整旁白并跑通 TTS

**这是全片最关键的一步。** 时长、节奏、每个场景的画面切换点全部由这一步的产出决定。旁白定稿之前不要开始画任何场景。

**Files:**
- Create: `narration.python.json`
- Create（生成物）: `src/timing.python.json`、`public/audio-py/*.wav`

- [ ] **Step 1: 写 `narration.python.json`**

完整内容如下，直接落盘。注意 `say` 是朗读文本（口语、可含标点停顿），`show` 是字幕文本（书面、更短）；省略 `show` 时字幕用 `say`。

```json
{
  "voice": "Tingting",
  "rate": 183,
  "gapSeconds": 0.32,
  "leadInSeconds": 0.55,
  "tailSeconds": 1.05,
  "scenes": [
    {
      "id": "p00",
      "index": "00",
      "title": "开场",
      "heading": "能跑，不等于会用",
      "visual": "hook",
      "paragraphs": [
        { "say": "先看一段代码。读一个文件，按行统计词频，返回前十名。这段代码能跑，结果也对，写它的人已经用 Python 两年了。", "show": "一段能跑、结果也对的「两年代码」" },
        { "say": "但它有三个问题。文件大了会吃掉全部内存。函数没法测，因为它直接读了磁盘。调用方拿不到中间结果，只能干等它跑完。", "show": "问题：吃满内存 / 没法测 / 拿不到中间结果" },
        { "say": "这些问题，语法书里都不教。因为答案不在语法里，在数据模型、生成器、工程化这些地方。", "show": "答案不在语法里，在数据模型、生成器、工程化" },
        { "say": "所以进阶卡住，往往不是某个语法没学会，而是没人告诉你，接下来该碰哪些东西，以及碰到什么程度算会了。", "show": "卡住的原因：不知道下一步学什么，学到什么程度算会" },
        { "say": "这条视频就干这一件事。给你一张四层能力地图，每层点名最该先碰的知识点，每一个都给出可以验证的练法。", "show": "四层地图 + 每个知识点的可验证练法" },
        { "say": "十五分钟，十来个知识点。不追深度，只把地图和走法讲清楚。", "show": "15 分钟，10 个知识点：地图 + 走法" }
      ]
    },
    {
      "id": "p01",
      "index": "01",
      "title": "路线图",
      "heading": "四层地图，和一套走法",
      "visual": "roadmap",
      "paragraphs": [
        { "say": "地图长这样，四层。最里面是语言内核，往外是并发与性能，再往外是工程化，最外面是生态方向。", "show": "语言内核 → 并发与性能 → 工程化 → 生态方向" },
        { "say": "顺序不是随便排的。内核决定了后面所有东西的理解上限。你不懂生成器，异步迭代器就是黑盒。不懂数据模型，框架里的魔法就只能是魔法。", "show": "内核决定理解上限：不懂生成器，异步迭代器就是黑盒" },
        { "say": "并发和性能放第二层，因为它是分水岭。很多人写了两年代码，还在用同步思维解决一切问题。", "show": "第二层是分水岭：还在用同步思维解决一切" },
        { "say": "工程化放第三层。它的作用是让你的代码能被别人用、被别人改、被别人信任。一个人写脚本可以跳过，一个团队不行。", "show": "工程化：让代码能被别人用、改、信任" },
        { "say": "最外层是方向选择。Web、数据、AI，三条路的进阶顺序差别很大，选错了会浪费一年。", "show": "方向选错，浪费一年" },
        { "say": "然后是走法。每个知识点都按这四步走，全片我会反复提。第一，读官方文档的对应章节，不是教程，是文档。", "show": "走法一：读官方文档对应章节，不是教程" },
        { "say": "第二，写一个最小复现，跑通，然后故意把它弄坏，看报什么错。第三，找一个真实库的源码，看它在哪用了这个东西。", "show": "走法二：最小复现，跑通，再故意弄坏 / 走法三：读真实库源码" },
        { "say": "第四，在一个真实项目里用上，留下一个能验证的产物。记住最后这条。听懂不算会，留下东西才算。", "show": "走法四：真实项目用上，留下可验证产物" }
      ]
    },
    {
      "id": "p02",
      "index": "02",
      "title": "数据模型",
      "heading": "数据模型：一切都是协议",
      "visual": "code",
      "paragraphs": [
        { "say": "第一个知识点，数据模型。先说一个反直觉的事：为什么 Python 里求长度写 len，而其他语言写点 length 加括号？", "show": "为什么是 len(x)，不是 x.length()" },
        { "say": "因为 len 不是普通函数，它走的是协议。任何对象只要实现了双下划线 len，len 就能作用在它身上。内置函数是协议的入口，不是类型的方法。", "show": "len(x) → x.__len__()：内置函数是协议入口" },
        { "say": "这一层东西，行业里叫 dunder，双下划线方法。它最容易被当成语法糖背下来，其实它是一套统一的接口约定。", "show": "dunder 不是语法糖，是统一的接口约定" },
        { "say": "比如 with。你天天用 with open，但它凭什么能自动关文件？因为文件对象实现了 enter 和 exit。你写的任何类，实现这两个方法，也能进 with。", "show": "with open 能自动关文件 → __enter__ / __exit__" },
        { "say": "再比如运算符。a 加 b 会去找 a 的双下划线 add。所以你可以让自己的类型支持加号，这不是重载技巧，是协议允许的。", "show": "a + b → a.__add__(b)：运算符也是协议" },
        { "say": "怎么练。找一个你自己写的类，让它至少实现三个协议：能进 with，能 len 或者能迭代，能比较或者能相加。", "show": "练：给自己的类实现 3 个协议（with / 迭代 / 比较或相加）" },
        { "say": "更关键的是，去翻一遍官方文档里 data model 那一章。它会告诉你 Python 一共有多少种协议，以及每种协议在什么场景下被触发。这一章看一遍，你对 Python 的理解会上一个台阶。", "show": "读 docs：Data Model 一章，看全部协议与触发场景" }
      ]
    },
    {
      "id": "p03",
      "index": "03",
      "title": "装饰器",
      "heading": "装饰器：闭包是底，functools 是标准答案",
      "visual": "code",
      "paragraphs": [
        { "say": "第二个，装饰器。很多人背下了 wraps 的写法，但说不清它为什么能成立。", "show": "会写 @wraps，说不清为什么成立" },
        { "say": "装饰器的底子是闭包。函数可以定义在函数里面，内层函数能记住外层函数的变量，这就是闭包。装饰器只是拿这个能力做了个语法包装。", "show": "闭包：内层函数记住外层变量 → 装饰器是语法包装" },
        { "say": "所以我建议你先手写闭包，再手写装饰器，不要用 at 语法。等你写明白 func 等于 deco(func) 这一行，装饰器就不神秘了。", "show": "先写 func = deco(func)，再引入 @ 语法" },
        { "say": "接下来是三段式。不带参数的装饰器，带参数的装饰器，类装饰器。带参数的那一层容易绕晕，因为它多包了一层。", "show": "三段式：不带参 → 带参 → 类装饰器" },
        { "say": "然后就是标准答案部分。wraps 保住被装饰函数的名字和文档，lru_cache 一行加缓存，partial 固定部分参数。这三个先记住。", "show": "functools：wraps / lru_cache / partial" },
        { "say": "怎么练。手写一个 retry 装饰器，参数是重试次数和间隔，能装饰任意函数，能保留原函数的名字，失败到上限抛异常。", "show": "练：手写 @retry(次数, 间隔)，保留函数名，超限抛异常" },
        { "say": "这一条写完，装饰器你就真的过了。因为它把闭包、参数传递、异常、functools 全串起来了。", "show": "@retry 串起闭包 + 参数 + 异常 + functools" }
      ]
    },
    {
      "id": "p04",
      "index": "04",
      "title": "生成器",
      "heading": "生成器：把函数变成一个状态机",
      "visual": "code",
      "paragraphs": [
        { "say": "第三个，生成器。它的价值只有一个词：惰性。", "show": "生成器 = 惰性求值" },
        { "say": "回到开场那个词频统计。它一次性把文件读完，文件多大内存就多大。换成生成器，一行一行读，内存是常数。", "show": "一次读完 → 内存随文件增长；逐行读 → 内存恒定" },
        { "say": "写法的分界点是 yield。函数里出现 yield，它就不再是函数了，它变成一个状态机：每次被调用，从上次停的地方继续。", "show": "出现 yield → 变成状态机，从上次停的地方继续" },
        { "say": "这里有个常见误解：以为生成器省的是时间。不是，它省的是内存，而且通常更慢。选它是因为数据量撑不住，不是因为想变快。", "show": "误解：生成器省时间。实际：省内存，通常更慢" },
        { "say": "然后是 itertools。它是个被严重低估的库。分组、切片、组合、笛卡尔积、无限序列，大部分你手写的循环，它都有一行写法。", "show": "itertools：分组 / 切片 / 组合 / 无限序列" },
        { "say": "怎么练。把开场那段词频统计重写一遍：用生成器逐行读，用 Counter 统计，用 nlargest 取前十。然后拿一个几百兆的日志文件压一下。", "show": "练：重写词频统计（生成器 + Counter + nlargest），压几百兆日志" },
        { "say": "顺便记住这条链：生成器、迭代器协议、异步迭代器，是同一个思想的三个版本。这条链打通了，asyncio 那一层会轻松很多。", "show": "生成器 → 迭代器协议 → 异步迭代器：同一条思想链" }
      ]
    },
    {
      "id": "p05",
      "index": "05",
      "title": "类型系统",
      "heading": "类型提示：写给工具，不是写给解释器",
      "visual": "code",
      "paragraphs": [
        { "say": "第四个，类型。先破一个误解：Python 加类型，不会让运行变快，也不会在运行时拦住你。类型提示是给工具和人看的。", "show": "类型提示不改变运行：给工具和人看" },
        { "say": "那它的价值在哪？在编辑器的自动补全，在静态检查能提前发现 bug，在别人读你的函数签名就知道怎么用。", "show": "价值：补全 / 静态检查 / 函数签名即文档" },
        { "say": "入门只需要知道 list、dict、Optional 怎么写。真正的门槛在后面三样：泛型 TypeVar，结构化类型 Protocol，还有字面量类型 Literal。", "show": "门槛：TypeVar 泛型 / Protocol / Literal" },
        { "say": "Protocol 值得单独说。它对应的是鸭子类型。你不需要继承，只要长得像，就符合 Protocol。这是 Python 类型系统里最有 Python 味道的一块。", "show": "Protocol = 鸭子类型的类型化写法：不继承，只要长得像" },
        { "say": "然后是工具。mypy 是老牌，pyright 更快，ruff 现在也带了一部分检查。选一个，接进编辑器，让它实时给你标红。", "show": "工具：mypy / pyright / ruff，接进编辑器实时标红" },
        { "say": "怎么练。挑一个你写过的、超过两百行的脚本，给它加完整类型标注，然后跑 mypy，看它能挑出多少问题。第一次跑通常很热闹。", "show": "练：给 200 行脚本加全类型标注，跑 mypy 看挑出多少" },
        { "say": "记住一点：不要追求一次零报错。先把检查跑起来，让它在你的日常开发里一直开着，慢慢清零。", "show": "别追零报错，先让它一直开着，慢慢清零" }
      ]
    },
    {
      "id": "p06",
      "index": "06",
      "title": "GIL 与选型",
      "heading": "GIL：它到底限制了什么",
      "visual": "timeline",
      "paragraphs": [
        { "say": "第五个，也是分水岭：并发。先从 GIL 开始，因为围绕它的误解最多。", "show": "分水岭：并发。误解最多的 GIL" },
        { "say": "GIL 是一把全局锁，保证同一时刻只有一个线程在执行 Python 字节码。所以多线程跑 CPU 密集的任务，是真的没用。", "show": "GIL：同一时刻只有一个线程执行字节码 → CPU 密集多线程无效" },
        { "say": "但注意，锁的是 Python 字节码，不是你的等待。做网络请求、读文件、查数据库的时候，线程会主动把锁放掉。所以 IO 密集的任务，多线程非常有效。", "show": "锁的是字节码，不是等待 → IO 密集多线程有效" },
        { "say": "于是选型就清楚了。CPU 密集，用多进程，绕开 GIL。IO 密集、并发量大，用 asyncio。IO 密集、量不大、或者要用同步库，用线程池。", "show": "CPU 密集 → 多进程 / 高并发 IO → asyncio / 普通 IO → 线程池" },
        { "say": "还有一条要更新：从 3.13 开始有自由线程模式，GIL 可以被关掉。但它还不是默认，生态也没跟上。现在学，仍然按有 GIL 来学。", "show": "3.13 起有自由线程模式，但非默认、生态未跟上" },
        { "say": "怎么练。写一个 CPU 密集任务和一个 IO 密集任务，各用串行、多线程、多进程跑一遍，把耗时记下来做成一张表。", "show": "练：同一任务用串行 / 线程 / 进程各跑一遍，记耗时做表" },
        { "say": "这张表你自己跑出来，比看十篇文章都管用。因为它把抽象的 GIL 变成了你能看见的数字。", "show": "自己跑出来的数字，比十篇文章管用" }
      ]
    },
    {
      "id": "p07",
      "index": "07",
      "title": "asyncio",
      "heading": "asyncio：事件循环不是线程",
      "visual": "timeline",
      "paragraphs": [
        { "say": "第六个，asyncio。它最容易学错，因为大部分人把它当成多线程来理解。", "show": "asyncio 最常被当成多线程理解" },
        { "say": "它不是。它只有一个线程，一个事件循环。所有任务在这一个线程上轮流跑，谁在等 IO，就切到下一个。这叫协作式调度。", "show": "单线程 + 事件循环，轮流跑，谁等 IO 就切走" },
        { "say": "await 的语义是：我在这儿等，把控制权交回去。所以 await 不是启动并发，它恰恰是让出执行权的地方。", "show": "await = 让出执行权，不是启动并发" },
        { "say": "要并发，你得先把协程变成 Task，然后 gather 或者 TaskGroup 等它们。这一步是新手最容易漏的，漏了就是老老实实串行。", "show": "并发要先 create_task，再 gather / TaskGroup" },
        { "say": "最大的坑是阻塞调用。在协程里调一个同步的库，比如老的 requests，整个事件循环会被卡住，所有并发全部退化。IO 密集的库要换成异步版本。", "show": "最大的坑：协程里调同步库 → 整个事件循环被卡住" },
        { "say": "怎么练。找一个你现在用 requests 串行请求的脚本，改成 httpx 异步并发，然后比较同样请求数下的耗时。", "show": "练：requests 串行 → httpx 异步并发，比耗时" },
        { "say": "进阶再去看 gather 的异常行为、超时控制，以及 TaskGroup 在 3.11 里为什么被加进来。这三个问题搞明白，异步就算入门了。", "show": "进阶：gather 异常行为 / 超时 / TaskGroup 的由来" }
      ]
    },
    {
      "id": "p08",
      "index": "08",
      "title": "性能",
      "heading": "性能：先测量，再优化",
      "visual": "timeline",
      "paragraphs": [
        { "say": "第七个，性能。这一条我只想强调一件事：顺序。", "show": "性能优化，唯一重要的是顺序" },
        { "say": "绝大多数性能优化是白做的，因为优化的人猜错了瓶颈在哪。你的直觉基本靠不住。", "show": "大部分优化是白做的：猜错了瓶颈" },
        { "say": "所以第一步永远是测量。cProfile 看函数级耗时，timeit 看一小段代码，tracemalloc 看内存分配在哪。三个工具，覆盖大部分场景。", "show": "先测量：cProfile 函数级 / timeit 片段 / tracemalloc 内存" },
        { "say": "测出热点之后，优化顺序大概是这样。先换算法和数据结构，这一层收益最大。再减少重复计算，加缓存。再考虑用 C 扩展库或者向量化，比如把循环换成 numpy。", "show": "顺序：算法与数据结构 → 缓存 → C 扩展 / 向量化" },
        { "say": "最后才考虑并发，以及微优化。大部分人一上来就做最后两步，所以没效果。", "show": "并发和微优化放最后，一上来就做等于没效果" },
        { "say": "怎么练。找一个你自己写的、跑得慢的脚本，先用 cProfile 跑一遍，把前几名热点记下来。", "show": "练：给一个慢脚本跑 cProfile，记下 top 热点" },
        { "say": "然后只优化第一名，再跑一遍，看数字有没有动。如果没动，说明你的优化方向是错的，回去看 profiling 结果，不要接着猜。", "show": "只改第一名，再测；没动就是方向错了，别接着猜" }
      ]
    },
    {
      "id": "p09",
      "index": "09",
      "title": "项目结构",
      "heading": "工程化一：把脚本变成包",
      "visual": "tree",
      "paragraphs": [
        { "say": "第八个，进入工程化。第一个动作是项目结构。", "show": "工程化第一步：项目结构" },
        { "say": "从一堆散装脚本变成一个包，要三样东西：一个 src 目录放代码，一个 pyproject.toml 描述项目和依赖，一个虚拟环境隔离依赖。", "show": "src 目录 + pyproject.toml + 虚拟环境" },
        { "say": "为什么要 src 目录？因为它强制你的代码必须被安装后才能导入。这样能提前暴露打包问题，也能防止测试意外读到源码目录，而不是装好的包。", "show": "src layout：强制安装后导入，提前暴露打包问题" },
        { "say": "依赖管理工具，现在直接用 uv。它快，一个工具同时管虚拟环境、依赖、锁定版本、跑脚本。poetry 也可以，但 uv 已经把差距拉开了。", "show": "依赖管理：直接用 uv（环境 + 依赖 + 锁定 + 运行）" },
        { "say": "还有一条纪律：所有依赖写进 pyproject，不要口头 pip install。锁文件要提交进版本库，保证别人装出来跟你一样。", "show": "纪律：依赖全部写进 pyproject，锁文件提交" },
        { "say": "怎么练。挑一个你现在还在用 python 直接跑脚本的场景，把它改成一个 src layout 的包。", "show": "练：把散装脚本改成 src layout 的包" },
        { "say": "改完你会踩到一堆坑：相对导入报错、模块找不到、路径写死。这些坑踩过一遍，工程化的第一课就上完了。", "show": "踩坑清单：相对导入 / 模块找不到 / 路径写死" }
      ]
    },
    {
      "id": "p10",
      "index": "10",
      "title": "测试与质量",
      "heading": "工程化二：让它能被信任",
      "visual": "tree",
      "paragraphs": [
        { "say": "第九个，测试和质量。这一条回答的是：凭什么别人敢用你的代码。", "show": "测试回答：凭什么别人敢用你的代码" },
        { "say": "pytest 是最低门槛。它的核心能力有三个：断言直接写 assert，fixture 管测试的准备工作，参数化让你一次跑多组输入。", "show": "pytest：assert / fixture / 参数化" },
        { "say": "写测试有个判断标准：如果你要改一处实现，测试必须跟着改，那这个测试写错了。好的测试测的是行为，不是实现。", "show": "好测试测行为，不测实现" },
        { "say": "然后是静态检查。ruff 做风格和一部分 bug 检查，速度快到可以忽略。mypy 或者 pyright 做类型检查。pre-commit 把它们挂在提交前，不通过就提交不了。", "show": "ruff + mypy/pyright + pre-commit 挂提交前" },
        { "say": "最后接一个 CI。哪怕只是最简单的：每次 push 跑一遍测试、跑一遍 lint。这一步成本很低，收益是防止你某天提交一堆红的代码上去。", "show": "CI 最小版：每次 push 跑测试 + lint" },
        { "say": "怎么练。挑你项目里最核心的一个函数，先补测试，把边界情况写全，然后加上 ruff、mypy、pre-commit。", "show": "练：给最核心的函数补测试 + 边界，再接 ruff/mypy/pre-commit" },
        { "say": "注意顺序：先测试，后工具。工具只能保证风格统一和类型没问题，保证不了逻辑对不对。逻辑只有测试能保证。", "show": "顺序：先测试后工具。工具保证不了逻辑" }
      ]
    },
    {
      "id": "p11",
      "index": "11",
      "title": "生态方向",
      "heading": "生态：三条路，选一条走",
      "visual": "ecosystem",
      "paragraphs": [
        { "say": "第十个，方向选择。这一条不是知识点，是路线。因为三条路的进阶顺序完全不同。", "show": "三条路的进阶顺序完全不同" },
        { "say": "第一条，Web。从 FastAPI 入手，比 Django 更适合学现代异步 Web。要补的是：Pydantic 做数据校验，SQLAlchemy 做 ORM，再往上才是架构和部署。", "show": "Web：FastAPI → Pydantic → SQLAlchemy → 架构与部署" },
        { "say": "第二条，数据。pandas 是入口，但建议你早点认识 polars：写法接近，快很多。要补的是表操作、NumPy 的向量化，以及可视化。", "show": "数据：pandas → polars → NumPy 向量化 → 可视化" },
        { "say": "第三条，AI 和 Agent。Python 在这条路上是事实标准。要补的是：模型 API 的调用与流式、向量检索，以及怎么把工具调用和状态管理串成一个可靠的循环。", "show": "AI/Agent：模型 API + 流式 → 向量检索 → 工具调用与状态管理" },
        { "say": "三条路不需要都走。选一条，把上面那条链走完，比三条都浅尝有用得多。另一条以后要用再补，成本不高。", "show": "选一条走完，胜过三条浅尝" },
        { "say": "怎么练。写下你未来一年最想做成的一件事，然后从上面选一条能支撑它的路线。", "show": "练：写下一年最想做成的一件事，反推选哪条路" },
        { "say": "选完之后，把这条链上的每个库，用我们前面说的四步法过一遍。注意，是过一遍，不是学完。", "show": "选定后用四步法过一遍，不是学完" }
      ]
    },
    {
      "id": "p12",
      "index": "12",
      "title": "收尾",
      "heading": "八周，每周一个可验证的产出",
      "visual": "plan",
      "paragraphs": [
        { "say": "最后，把前面十个知识点排进八周。原则只有一条：每周必须有一个能拿出来的东西。", "show": "八周，每周一个能拿出来的东西" },
        { "say": "第一周，数据模型和装饰器。产出是你自己的一个类，实现了三个协议，再加一个手写的 retry。", "show": "W1 数据模型 + 装饰器 → 自定义类实现 3 协议 + 手写 @retry" },
        { "say": "第二周，生成器和迭代。产出是把一个真实的大文件处理脚本改成惰性流式。第三周，类型。产出是一个两百行以上、mypy 全绿的项目。", "show": "W2 生成器 → 大文件脚本改流式 / W3 类型 → 200 行 mypy 全绿" },
        { "say": "第四周和第五周，并发和性能。产出是那张串行、线程、进程的对比表，和一份 profiling 报告加上你实际的优化结果。", "show": "W4-W5 并发与性能 → 对比表 + profiling 报告与优化结果" },
        { "say": "第六周和第七周，工程化。产出是把你那个脚本改成规范的包，配上测试、ruff、mypy、pre-commit，再接一条 CI。", "show": "W6-W7 工程化 → 规范包 + 测试 + ruff/mypy/pre-commit + CI" },
        { "say": "第八周，方向。选一条路线，用它做一个你自己想用的小工具，哪怕很小。这一周不学新东西，只做。", "show": "W8 方向 → 用选定路线做一个小工具，只做不学" },
        { "say": "八周之后，你手里会有七个能给别人看的东西。这份清单的意义不在于八周能不能完成，而在于每一周你都知道自己该干什么。", "show": "八周后你手里有七个可展示的产物" },
        { "say": "最后重复一遍那句话：听懂不算会，留下东西才算。就这样，祝你好运。", "show": "听懂不算会，留下东西才算" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 跑 TTS**

```bash
node scripts/tts.mjs narration.python.json src/timing.python.json public/audio-py
```

Expected: 终端逐场景打印，形如：

```
p00  6 句  62.1s
p01  8 句  78.4s
...
total 16m 56s 30471 frames
```

- [ ] **Step 3: 检查总时长**

Run: `node -e "const t=require('./src/timing.python.json'); const m=Math.floor(t.totalSeconds/60); console.log(m+'m '+Math.round(t.totalSeconds-m*60)+'s', t.scenes.length+' scenes', t.totalFrames+' frames')"`

Expected: 场景数 13，总时长在 **13–17 分钟**之间。

**如果超出范围**：不要改语速（rate 183 是有意选的语速），改为**删句子**。删句原则——优先删「怎么练」之外的补充说明，保留痛点句和练习句。每个内容场景最少保留 5 句。删完重跑本 task 的 Step 2–3。

- [ ] **Step 4: 抽查音频文件**

Run: `ls public/audio-py | head -20 && ls public/audio-py | wc -l`

Expected: 文件名形如 `p00-0.wav` … `p12-7.wav`，**总数 92**。

Run: `afplay public/audio-py/p00-0.wav`

Expected: 听到中文女声朗读第一句。这一步是唯一能确认 TTS 没有静音或截断的方法——自动时长检查发现不了「生成了但内容是空的」。

- [ ] **Step 5: 提交**

```bash
git add narration.python.json src/timing.python.json public/audio-py
git commit -m "feat: add python roadmap narration and voice-over

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: 合成入口与 13 个占位场景

先让整条时间轴能跑起来、能预览，再逐个把占位换成真画面。这样任何时刻仓库都是可运行的，任何一步出错都能定位到单个场景。

**Files:**
- Create: `src/scenes-py/P0Hook.tsx` … `P12Outro.tsx`（13 个占位）
- Create: `src/PythonRoadmap.tsx`
- Modify: `src/Root.tsx`

- [ ] **Step 1: 生成 13 个占位场景文件**

```bash
cd /Users/zhongling/mypro/my-video
mkdir -p src/scenes-py/components
while read -r sid name; do
  cat > "src/scenes-py/${name}.tsx" <<EOF
import { Hero, Mono } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS } from "../theme";
import type { SceneTiming } from "../types";

/** Placeholder for scene ${sid}. Replaced in its own task. */
export const ${name}: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<Hero>{scene.heading}</Hero>
			<Mono size={24} color={COLORS.faint}>
				placeholder · paragraph {active + 1} / {scene.paragraphs.length}
			</Mono>
		</div>
	);
};
EOF
done <<'LIST'
p00 P0Hook
p01 P1Roadmap
p02 P2DataModel
p03 P3Decorators
p04 P4Generators
p05 P5Typing
p06 P6Gil
p07 P7Asyncio
p08 P8Profiling
p09 P9Structure
p10 P10Testing
p11 P11Ecosystem
p12 P12Outro
LIST
ls src/scenes-py
```

Expected: 13 个 `.tsx` 文件 + 一个 `components/` 目录。

- [ ] **Step 2: 写 `src/PythonRoadmap.tsx`**

```tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { P0Hook } from "./scenes-py/P0Hook";
import { P1Roadmap } from "./scenes-py/P1Roadmap";
import { P2DataModel } from "./scenes-py/P2DataModel";
import { P3Decorators } from "./scenes-py/P3Decorators";
import { P4Generators } from "./scenes-py/P4Generators";
import { P5Typing } from "./scenes-py/P5Typing";
import { P6Gil } from "./scenes-py/P6Gil";
import { P7Asyncio } from "./scenes-py/P7Asyncio";
import { P8Profiling } from "./scenes-py/P8Profiling";
import { P9Structure } from "./scenes-py/P9Structure";
import { P10Testing } from "./scenes-py/P10Testing";
import { P11Ecosystem } from "./scenes-py/P11Ecosystem";
import { P12Outro } from "./scenes-py/P12Outro";
import { COLORS } from "./theme";
import timingJson from "./timing.python.json";
import type { SceneTiming, Timing } from "./types";

const timing = timingJson as unknown as Timing;

const BODIES: Record<string, React.FC<{ scene: SceneTiming }>> = {
	p00: P0Hook,
	p01: P1Roadmap,
	p02: P2DataModel,
	p03: P3Decorators,
	p04: P4Generators,
	p05: P5Typing,
	p06: P6Gil,
	p07: P7Asyncio,
	p08: P8Profiling,
	p09: P9Structure,
	p10: P10Testing,
	p11: P11Ecosystem,
	p12: P12Outro,
};

/**
 * The python advanced roadmap explainer. Same contract as PiDurable: the audio
 * timeline in timing.python.json is the single source of truth for pacing, so
 * rewriting the narration re-cuts the whole video.
 */
export const PythonRoadmap: React.FC = () => {
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
						<Stage scene={scene} brand="python-roadmap" audioDir="audio-py">
							<Body scene={scene} />
						</Stage>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const PY_TOTAL_FRAMES = timing.totalFrames;
export const PY_FPS = timing.fps;
export const PY_DURATION_SECONDS = timing.totalSeconds;
```

- [ ] **Step 3: 在 `src/Root.tsx` 注册 Composition**

在 `import { PiDurable, TOTAL_FRAMES } from "./PiDurable";` 下面加一行：

```tsx
import { PythonRoadmap, PY_TOTAL_FRAMES } from "./PythonRoadmap";
```

在 `Explainer` Folder 里的 `PiDurable` Composition 之后加：

```tsx
				<Composition
					id="PythonRoadmap"
					component={PythonRoadmap}
					durationInFrames={PY_TOTAL_FRAMES}
					fps={30}
					width={1920}
					height={1080}
				/>
```

- [ ] **Step 4: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。如果报 `timing.python.json` 找不到，确认 Task 3 Step 2 已经跑过。

- [ ] **Step 5: 验证合成能渲染，且抽三个不同场景的帧**

```bash
npx remotion still PythonRoadmap /tmp/py-skeleton-000.png --frame=60
npx remotion still PythonRoadmap /tmp/py-skeleton-800.png --frame=8000
npx remotion still PythonRoadmap /tmp/py-skeleton-last.png --frame=26000
```

Expected: 三张 PNG 都能生成。分别应该显示不同的 heading（开场 / 中段某场景 / 收尾）。如果三张图一样，说明 `startFrame` 摆放有问题。

- [ ] **Step 6: 提交**

```bash
git add src/scenes-py src/PythonRoadmap.tsx src/Root.tsx
git commit -m "feat: wire python roadmap composition with placeholder scenes

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 5: `PracticeBox` 组件

全片 10 个内容场景右侧都用它。固定版式才能让观众形成「这块是练法」的条件反射。

**Files:**
- Create: `src/scenes-py/components/PracticeBox.tsx`

- [ ] **Step 1: 写组件**

先读 `src/components/Bits.tsx` 确认 `Panel` / `Label` / `Mono` 的签名，然后写：

```tsx
import type { ReactNode } from "react";
import { Label, Panel, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, FONT, MONO } from "../../theme";
import type { SceneTiming } from "../../types";

export type PracticeItem = {
	/** The verifiable action. Imperative, concrete, starts with a verb. */
	readonly text: string;
	/** What you end up with. Shown pinned to the right. */
	readonly artifact: string;
};

/**
 * The "how to practise" panel every content scene ends on. The scene tasks
 * a fixed rhythm: whatever else changes, this box is always bottom-right.
 */
export const PracticeBox: React.FC<{
	scene: SceneTiming;
	items: readonly PracticeItem[];
	/** Paragraph index from which this box appears. */
	at: number;
	title?: string;
}> = ({ scene, items, at, title = "怎么练" }) => {
	const { active } = useSceneFrame(scene);
	const start = scene.paragraphs[at]?.startFrame ?? 0;
	const on = active >= at;

	return (
		<Reveal at={start} frames={16} from="left" style={{ height: "100%" }}>
			<Panel
				active={on}
				accent={COLORS.ok}
				pad="26px 30px"
				style={{ height: "100%", display: "flex", flexDirection: "column", opacity: on ? 1 : 0.35 }}
			>
				<Label color={COLORS.ok} style={{ marginBottom: 20 }}>
					{title}
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
					{items.map((item, i) => (
						<div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
								<span style={{ fontFamily: MONO, fontSize: 20, color: COLORS.ok, flex: "0 0 auto" }}>
									{i + 1}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.45 }}>
									{item.text}
								</span>
							</div>
							<div
								style={{
									marginLeft: 34,
									fontFamily: MONO,
									fontSize: 19,
									color: COLORS.dim,
									borderLeft: `2px solid ${COLORS.borderHi}`,
									paddingLeft: 14,
								}}
							>
								{item.artifact}
							</div>
						</div>
					))}
				</div>
				<div style={{ marginTop: "auto", paddingTop: 20 }}>
					<Mono size={18} color={COLORS.faint}>
						听懂不算会，留下东西才算
					</Mono>
				</div>
			</Panel>
		</Reveal>
	);
};
```

- [ ] **Step 2: 冒烟测试——用一个真实场景临时接线**

**版式约定（后面所有内容场景都遵守）：** 母题组件占满画布宽度，`PracticeBox` 不与它并排，而是**接管**画布。每个内容场景第 6 段（下标 5）是分界点——前 5 段展示母题，后 2 段整屏切成练习面板。所以实践上就是二选一渲染：

```tsx
{active < 5 ? <母题 /> : <PracticeBox ... />}
```

原因是 1920 宽减去两侧 88 的内边距只剩 1744，`CodeCompare` 两栏各需要约 820，再塞一个右栏会把代码行压到 25 字符以内，读不了。

把 `src/scenes-py/P2DataModel.tsx` 临时改成（Task 11 会用真实现覆盖它）：

```tsx
import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { PracticeBox } from "./components/PracticeBox";
import type { SceneTiming } from "../types";

export const P2DataModel: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return (
			<PracticeBox
				scene={scene}
				at={5}
				items={[
					{ text: "给自己的类实现 3 个协议", artifact: "一个能 with、能迭代、能比较的类" },
					{ text: "读一遍 Data Model 文档章节", artifact: "一份协议清单笔记" },
				]}
			/>
		);
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<Hero>{scene.heading}</Hero>
			<span style={{ fontFamily: MONO, fontSize: 24, color: COLORS.faint }}>
				母题占位 · 第 {active + 1} 段
			</span>
		</div>
	);
};
```

（记得 import `MONO` 和 `COLORS`：`import { COLORS, MONO } from "../theme";`）

- [ ] **Step 3: 抽两帧验证切换**

`p02` 从第 6 段（下标 5）切成练习面板。先算出第 5 段的绝对帧：

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p02'); console.log('scene start', s.startFrame); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

Expected: 打印出每段的绝对起始帧。

用第 5 段起始帧减 60 作为「还是母题」的帧，加 60 作为「已经切成练习面板」的帧：

```bash
npx remotion still PythonRoadmap /tmp/practice-before.png --frame=<第5段起始帧-60>
npx remotion still PythonRoadmap /tmp/practice-after.png --frame=<第5段起始帧+60>
```

Expected: 第一张是 heading + 占位行，第二张整屏是绿色的「怎么练」面板。打开两张图确认切换干净、没有两张画面重叠。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/components/PracticeBox.tsx src/scenes-py/P2DataModel.tsx
git commit -m "feat: add PracticeBox component for the how-to-practise panel

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 6: `CodeCompare` 组件（语言内核母题）

服务 `p02`–`p05`。左右两栏代码，差异行高亮，随段落推进逐行点亮。

**Files:**
- Create: `src/scenes-py/components/CodeCompare.tsx`

- [ ] **Step 1: 写组件**

```tsx
import { useCurrentFrame } from "remotion";
import { Label } from "../../components/Bits";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type CodeLine = {
	readonly text: string;
	/** Highlight this line as the differing / interesting one. */
	readonly mark?: boolean;
};

export type CodePane = {
	readonly title: string;
	readonly note?: string;
	readonly lines: readonly CodeLine[];
};

/**
 * The language-core motif: the plain way on the left, the advanced way (or the
 * thing the plain way is really doing) on the right. Both panes reveal line by
 * line so the narration can walk down them.
 */
export const CodeCompare: React.FC<{
	scene: SceneTiming;
	left: CodePane;
	right: CodePane;
	/** Scene-relative frame the line reveal starts at. Defaults to the first paragraph. */
	from?: number;
	accentLeft?: string;
	accentRight?: string;
}> = ({ scene, left, right, from, accentLeft = COLORS.dim, accentRight = COLORS.accent }) => {
	const frame = useCurrentFrame();
	const start = from ?? (scene.paragraphs[0]?.startFrame ?? 0);

	return (
		<div style={{ display: "flex", gap: 26, height: "100%" }}>
			{[{ pane: left, accent: accentLeft }, { pane: right, accent: accentRight }].map(
				({ pane, accent }, col) => (
					<div
						key={pane.title}
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							background: COLORS.panel,
							border: `1px solid ${COLORS.border}`,
							borderRadius: 14,
							padding: "22px 26px",
							gap: 16,
						}}
					>
						<div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
							<Label color={accent}>{pane.title}</Label>
							{pane.note !== undefined ? (
								<span style={{ fontFamily: FONT, fontSize: 20, color: COLORS.faint, marginLeft: "auto" }}>
									{pane.note}
								</span>
							) : null}
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
							{pane.lines.map((line, i) => {
								// Left column leads, right column follows half a beat later.
								const at = start + i * 9 + col * 14;
								const p = easeOut(since(frame, at, 12));
								return (
									<div
										key={i}
										style={{
											opacity: p,
											translate: `${(1 - p) * 10}px 0px`,
											fontFamily: MONO,
											fontSize: 22,
											lineHeight: 1.55,
											whiteSpace: "pre",
											color: line.mark === true ? accent : COLORS.dim,
											background: line.mark === true ? `${accent}14` : "transparent",
											borderLeft:
												line.mark === true ? `2px solid ${accent}` : "2px solid transparent",
											paddingLeft: 12,
										}}
									>
										{line.text}
									</div>
								);
							})}
						</div>
					</div>
				),
			)}
		</div>
	);
};
```

**两条硬约束**（渲染抽帧时核对）：

1. **每行代码不超过 42 个字符**。两栏各占约 820px，22px 等宽字体下 42 字符接近上限。超了就会横向溢出面板。
2. `whiteSpace: "pre"` 保留缩进——写 `lines` 时用真实的空格，不要用制表符。

- [ ] **Step 2: 冒烟测试——换成一段真实内容抽帧**

临时把 `P2DataModel.tsx` 的左侧区域换成：

```tsx
<CodeCompare
	scene={scene}
	left={{
		title: "基础写法",
		lines: [
			{ text: "n = len(items)" },
			{ text: "with open(path) as f:" },
			{ text: "    data = f.read()" },
			{ text: "total = a + b" },
		],
	}}
	right={{
		title: "背后的协议",
		lines: [
			{ text: "n = items.__len__()", mark: true },
			{ text: "f.__enter__() / f.__exit__()", mark: true },
			{ text: "a.__add__(b)", mark: true },
		],
		note: "内置函数是协议的入口",
	}}
/>
```

Run: `npx remotion still PythonRoadmap /tmp/code-compare.png --frame=<p02 第2段起始帧+40>`

Expected: 左右两栏，行已逐条出现，右侧带高亮。**检查最长的行有没有贴边或溢出。**

- [ ] **Step 3: 提交**

```bash
git add src/scenes-py/components/CodeCompare.tsx src/scenes-py/P2DataModel.tsx
git commit -m "feat: add CodeCompare motif for language-core scenes

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 7: `Timeline` 组件（并发母题）

服务 `p06`–`p08`。横向时间轴，展示不同并发方式下任务的执行块分布，用来把「GIL 让多线程无效」变成看得见的形状。

**Files:**
- Create: `src/scenes-py/components/Timeline.tsx`

- [ ] **Step 1: 写组件**

```tsx
import { useCurrentFrame } from "remotion";
import { COLORS, FONT, MONO, easeInOut, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type TimelineLane = {
	readonly title: string;
	readonly note?: string;
	/** Each block spans [start, end] on a 0..1 scale, with a busy/wait kind. */
	readonly blocks: readonly { start: number; end: number; kind: "busy" | "wait"; label?: string }[];
	readonly accent?: string;
};

const KIND_COLORS = {
	busy: COLORS.accent,
	wait: COLORS.warn,
} as const;

/**
 * The concurrency motif: one lane per strategy (serial, threads, processes,
 * asyncio). Busy blocks are solid, waiting blocks are hatched — the shape of a
 * lane is the whole argument.
 */
export const Timeline: React.FC<{
	scene: SceneTiming;
	lanes: readonly TimelineLane[];
	/** Which lane is lit; driven by the scene's paragraph index. */
	lit: number;
	/** Scene-relative frame the lanes reveal at. Defaults to the first paragraph. */
	from?: number;
}> = ({ scene, lanes, lit, from }) => {
	const frame = useCurrentFrame();
	const track = 1180;
	const start = from ?? (scene.paragraphs[0]?.startFrame ?? 0);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
			{lanes.map((lane, li) => {
				const accent = lane.accent ?? COLORS.accent;
				const on = li === lit;
				const p = easeOut(since(frame, start + li * 10, 14));
				return (
					<div
						key={lane.title}
						style={{
							opacity: p,
							display: "flex",
							alignItems: "center",
							gap: 22,
							background: on ? COLORS.panelHi : COLORS.panel,
							border: `1px solid ${on ? accent : COLORS.border}`,
							borderRadius: 14,
							padding: "20px 26px",
							boxShadow: on ? `0 0 30px ${accent}22` : "none",
						}}
					>
						<div style={{ flex: "0 0 250px", display: "flex", flexDirection: "column", gap: 6 }}>
							<span style={{ fontFamily: MONO, fontSize: 25, color: on ? accent : COLORS.dim }}>
								{lane.title}
							</span>
							{lane.note !== undefined ? (
								<span style={{ fontFamily: FONT, fontSize: 20, color: COLORS.faint }}>{lane.note}</span>
							) : null}
						</div>
						<div
							style={{
								position: "relative",
								flex: 1,
								height: 46,
								background: COLORS.bg,
								border: `1px solid ${COLORS.border}`,
								borderRadius: 8,
								overflow: "hidden",
							}}
						>
							{lane.blocks.map((block, bi) => {
								const grow = easeInOut(since(frame, start + li * 10 + bi * 6, 18));
								return (
									<div
										key={bi}
										style={{
											position: "absolute",
											top: 6,
											bottom: 6,
											left: `${block.start * 100}%`,
											width: `${(block.end - block.start) * 100 * grow}%`,
											background:
												block.kind === "busy"
													? `linear-gradient(180deg, ${KIND_COLORS.busy}, ${accent})`
													: `repeating-linear-gradient(45deg, ${KIND_COLORS.wait}55 0 6px, ${KIND_COLORS.wait}22 6px 12px)`,
											borderRadius: 5,
											display: "flex",
											alignItems: "center",
											paddingLeft: 10,
										}}
									>
										{block.label !== undefined ? (
											<span style={{ fontFamily: MONO, fontSize: 17, color: COLORS.bgDeep }}>
												{block.label}
											</span>
										) : null}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
			<div
				style={{
					marginLeft: 272,
					width: track,
					display: "flex",
					justifyContent: "space-between",
					fontFamily: MONO,
					fontSize: 18,
					color: COLORS.faint,
				}}
			>
				<span>0s</span>
				<span>时间 →</span>
			</div>
		</div>
	);
};
```

- [ ] **Step 2: 冒烟测试——用 GIL 场景的真实内容抽帧**

临时把 `P6Gil.tsx` 换成：

```tsx
import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { Timeline } from "./components/Timeline";
import type { SceneTiming } from "../types";

export const P6Gil: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
			<Hero size={40}>{scene.heading}</Hero>
			<Timeline
				scene={scene}
				lit={Math.min(Math.max(active - 1, 0), 3)}
				lanes={[
					{ title: "串行", note: "一个接一个", blocks: [
						{ start: 0, end: 0.25, kind: "busy", label: "T1" },
						{ start: 0.25, end: 0.5, kind: "busy", label: "T2" },
						{ start: 0.5, end: 0.75, kind: "busy", label: "T3" },
						{ start: 0.75, end: 1, kind: "busy", label: "T4" },
					] },
					{ title: "多线程 · CPU 密集", note: "抢一把锁", blocks: [
						{ start: 0, end: 0.28, kind: "busy", label: "T1" },
						{ start: 0.28, end: 0.62, kind: "busy", label: "T2" },
						{ start: 0.62, end: 0.82, kind: "busy", label: "T3" },
						{ start: 0.82, end: 1, kind: "busy", label: "T4" },
					] },
					{ title: "多线程 · IO 密集", note: "等的时候放锁", blocks: [
						{ start: 0, end: 0.18, kind: "busy", label: "T1" },
						{ start: 0.18, end: 0.4, kind: "wait" },
						{ start: 0.4, end: 0.58, kind: "busy", label: "T2" },
						{ start: 0.58, end: 0.9, kind: "wait" },
						{ start: 0.9, end: 1, kind: "busy", label: "T3" },
					] },
					{ title: "多进程", note: "各跑各的解释器", blocks: [
						{ start: 0, end: 0.25, kind: "busy", label: "P1" },
						{ start: 0, end: 0.25, kind: "busy", label: "P2" },
						{ start: 0, end: 0.25, kind: "busy", label: "P3" },
						{ start: 0, end: 0.25, kind: "busy", label: "P4" },
					] },
				]}
			/>
		</div>
	);
};
```

Run: `npx remotion still PythonRoadmap /tmp/timeline.png --frame=<p06 第5段起始帧+40>`

Expected: 四条泳道，第四段被点亮。「多进程」那条的四个块应该重叠在一起。检查重叠块是否可读——如果标签互相压住，把 `label` 去掉，只留色块。

- [ ] **Step 3: 提交**

```bash
git add src/scenes-py/components/Timeline.tsx src/scenes-py/P6Gil.tsx
git commit -m "feat: add Timeline motif for concurrency scenes

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 8: `TreeCompare` 组件（工程化母题）

服务 `p09`–`p10`。左边目录树，右边对应的配置片段，两边同段落一起点亮。

**Files:**
- Create: `src/scenes-py/components/TreeCompare.tsx`

- [ ] **Step 1: 写组件**

```tsx
import { useCurrentFrame } from "remotion";
import { Label } from "../../components/Bits";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type TreeNode = {
	/** Tree-drawing prefix, e.g. "│  ├─ ". Spaces matter: pre is preserved. */
	readonly prefix: string;
	readonly name: string;
	readonly note?: string;
	readonly mark?: boolean;
};

export type TreeSnippet = {
	readonly title: string;
	readonly lines: readonly string[];
	readonly mark?: readonly number[];
};

/**
 * The engineering motif: the shape of a project on the left, the file that
 * makes that shape work on the right. Both sides light up together.
 */
export const TreeCompare: React.FC<{
	scene: SceneTiming;
	tree: readonly TreeNode[];
	snippet: TreeSnippet;
	/** Paragraph index that lights the whole thing; lines reveal from here. */
	at: number;
}> = ({ scene, tree, snippet, at }) => {
	const frame = useCurrentFrame();
	const start = scene.paragraphs[at]?.startFrame ?? 0;

	return (
		<div style={{ display: "flex", gap: 26, height: "100%" }}>
			<div
				style={{
					flex: 1,
					background: COLORS.panel,
					border: `1px solid ${COLORS.border}`,
					borderRadius: 14,
					padding: "22px 26px",
					display: "flex",
					flexDirection: "column",
					gap: 14,
				}}
			>
				<Label color={COLORS.accent2}>项目结构</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					{tree.map((node, i) => {
						const p = easeOut(since(frame, start + i * 6, 12));
						return (
							<div
								key={i}
								style={{
									opacity: p,
									translate: `${(1 - p) * 8}px 0px`,
									display: "flex",
									alignItems: "baseline",
									gap: 10,
									fontFamily: MONO,
									fontSize: 23,
									lineHeight: 1.5,
								}}
							>
								<span style={{ color: COLORS.faint, whiteSpace: "pre" }}>{node.prefix}</span>
								<span style={{ color: node.mark === true ? COLORS.accent2 : COLORS.text }}>
									{node.name}
								</span>
								{node.note !== undefined ? (
									<span style={{ fontFamily: FONT, fontSize: 19, color: COLORS.dim, marginLeft: "auto" }}>
										{node.note}
									</span>
								) : null}
							</div>
						);
					})}
				</div>
			</div>

			<div
				style={{
					flex: 1,
					background: COLORS.panel,
					border: `1px solid ${COLORS.border}`,
					borderRadius: 14,
					padding: "22px 26px",
					display: "flex",
					flexDirection: "column",
					gap: 14,
				}}
			>
				<Label color={COLORS.accent}>{snippet.title}</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					{snippet.lines.map((line, i) => {
						const isMark = snippet.mark?.includes(i) === true;
						const p = easeOut(since(frame, start + i * 7, 12));
						return (
							<div
								key={i}
								style={{
									opacity: p,
									fontFamily: MONO,
									fontSize: 22,
									lineHeight: 1.55,
									whiteSpace: "pre",
									color: isMark ? COLORS.accent : COLORS.dim,
									background: isMark ? `${COLORS.accent}14` : "transparent",
									borderLeft: `2px solid ${isMark ? COLORS.accent : "transparent"}`,
									paddingLeft: 12,
								}}
							>
								{line}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
```

- [ ] **Step 2: 冒烟测试——用项目结构场景的真实内容抽帧**

临时把 `P9Structure.tsx` 换成：

```tsx
import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { TreeCompare } from "./components/TreeCompare";
import type { SceneTiming } from "../types";

export const P9Structure: React.FC<{ scene: SceneTiming }> = ({ scene }) => (
	<div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 22 }}>
		<Hero size={38}>{scene.heading}</Hero>
		<div style={{ flex: 1 }}>
			<TreeCompare
				scene={scene}
				at={1}
				tree={[
					{ prefix: "", name: "myproj/", mark: true },
					{ prefix: "├─ ", name: "src/myproj/", note: "代码", mark: true },
					{ prefix: "│  ├─ ", name: "__init__.py" },
					{ prefix: "│  └─ ", name: "core.py" },
					{ prefix: "├─ ", name: "tests/", note: "测试" },
					{ prefix: "├─ ", name: "pyproject.toml", note: "项目与依赖", mark: true },
					{ prefix: "└─ ", name: "uv.lock", note: "锁定的版本" },
				]}
				snippet={{
					title: "pyproject.toml",
					mark: [0, 6],
					lines: [
						"[project]",
						'name = "myproj"',
						'version = "0.1.0"',
						'dependencies = ["httpx"]',
						"",
						"[project.scripts]",
						'myproj = "myproj.core:main"',
						"",
						"[dependency-groups]",
						'dev = ["pytest", "ruff", "mypy"]',
					],
				}}
			/>
		</div>
	</div>
);
```

注意 `lines` 是**字符串数组**，`mark` 是**行号数组**——两者不要混。上面 `mark: [0, 6]` 高亮 `[project]` 和 `myproj = "myproj.core:main"` 两行。

Run: `npx remotion still PythonRoadmap /tmp/tree.png --frame=<p09 第4段起始帧+50>`

Expected: 左边目录树、右边 toml，都已展开。检查 `│  ├─ ` 这种前缀的对齐——中文字体下等宽渲染可能不齐，不齐就把 `prefix` 里的竖线去掉，只留缩进。

- [ ] **Step 3: 提交**

```bash
git add src/scenes-py/components/TreeCompare.tsx src/scenes-py/P9Structure.tsx
git commit -m "feat: add TreeCompare motif for engineering scenes

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 9: `EcosystemPicker` 组件（生态母题）

服务 `p11`。三列路线卡片，按目标打勾。

**Files:**
- Create: `src/scenes-py/components/EcosystemPicker.tsx`

- [ ] **Step 1: 写组件**

```tsx
import { useCurrentFrame } from "remotion";
import { Label } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type Track = {
	readonly name: string;
	readonly goal: string;
	/** The learning chain, in order. */
	readonly chain: readonly string[];
	readonly accent: string;
	readonly soft: string;
};

/**
 * The ecosystem motif: three tracks side by side. `lit` picks which one is
 * highlighted, so the narration can walk Web → 数据 → AI and then land on one.
 */
export const EcosystemPicker: React.FC<{
	scene: SceneTiming;
	tracks: readonly Track[];
	lit: number;
	/** Paragraph index at which the "pick one" banner appears. */
	pickAt?: number;
}> = ({ scene, tracks, lit, pickAt }) => {
	const frame = useCurrentFrame();
	const pickStart = pickAt !== undefined ? (scene.paragraphs[pickAt]?.startFrame ?? 0) : Infinity;
	const showPick = frame >= pickStart;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
			<div style={{ display: "flex", gap: 24, flex: 1 }}>
				{tracks.map((track, i) => {
					const on = i === lit;
					const p = easeOut(since(frame, i * 12, 16));
					return (
						<div
							key={track.name}
							style={{
								flex: 1,
								opacity: lit >= 0 && !on ? 0.45 : p,
								background: on ? track.soft : COLORS.panel,
								border: `1px solid ${on ? track.accent : COLORS.border}`,
								borderRadius: 16,
								padding: "26px 28px",
								display: "flex",
								flexDirection: "column",
								gap: 18,
								boxShadow: on ? `0 0 38px ${track.accent}33` : "none",
								translate: on ? "0px -8px" : "0px 0px",
							}}
						>
							<div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
								<span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 600, color: track.accent }}>
									{track.name}
								</span>
								<Mono size={18} color={COLORS.faint} style={{ marginLeft: "auto" }}>
									{track.goal}
								</Mono>
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								{track.chain.map((step, si) => {
									const sp = easeOut(since(frame, i * 12 + si * 8, 14));
									return (
										<div
											key={step}
											style={{
												opacity: sp,
												display: "flex",
												alignItems: "center",
												gap: 12,
												background: COLORS.bg,
												border: `1px solid ${COLORS.border}`,
												borderRadius: 10,
												padding: "12px 16px",
											}}
										>
											<span style={{ fontFamily: MONO, fontSize: 17, color: COLORS.faint }}>
												{si + 1}
											</span>
											<span style={{ fontFamily: MONO, fontSize: 22, color: COLORS.text }}>
												{step}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
			{showPick ? (
				<Label color={COLORS.ok} style={{ textAlign: "center" }}>
					选一条走完，胜过三条浅尝
				</Label>
			) : null}
		</div>
	);
};
```

- [ ] **Step 2: 冒烟测试——用生态场景的真实内容抽帧**

```tsx
// 临时替换 src/scenes-py/P11Ecosystem.tsx
import { useSceneFrame } from "../components/Stage";
import { EcosystemPicker } from "./components/EcosystemPicker";
import type { SceneTiming } from "../types";

const TRACKS = [
	{
		name: "Web",
		goal: "服务端接口",
		chain: ["FastAPI", "Pydantic", "SQLAlchemy", "部署"],
		accent: "#7d8cff",
		soft: "#1b2040",
	},
	{
		name: "数据",
		goal: "分析与处理",
		chain: ["pandas", "polars", "NumPy", "可视化"],
		accent: "#2fd3bd",
		soft: "#0e2b2b",
	},
	{
		name: "AI / Agent",
		goal: "模型应用",
		chain: ["模型 API", "流式", "向量检索", "工具循环"],
		accent: "#ffb454",
		soft: "#2e2210",
	},
];

export const P11Ecosystem: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%" }}>
			<EcosystemPicker scene={scene} tracks={TRACKS} lit={Math.min(Math.max(active - 1, -1), 2)} pickAt={4} />
		</div>
	);
};
```

Run: `npx remotion still PythonRoadmap /tmp/ecosystem.png --frame=<p11 第3段起始帧+40>`

Expected: 三列卡片，「数据」那列被抬高点亮，另外两列变暗。再抽第 6 段的帧，应该看到底部「选一条走完」出现。

- [ ] **Step 3: 提交**

```bash
git add src/scenes-py/components/EcosystemPicker.tsx src/scenes-py/P11Ecosystem.tsx
git commit -m "feat: add EcosystemPicker motif for the tracks scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 10: `P0Hook` 与 `P1Roadmap`（两个框架场景，完整参考实现）

这两个场景没有母题组件可复用，画面从零写。它们是全片的框架，也是后面 10 个内容场景的**风格参考**——先做这两个，把版式基调定下来。

**Files:**
- Modify: `src/scenes-py/P0Hook.tsx`
- Modify: `src/scenes-py/P1Roadmap.tsx`

- [ ] **Step 1: 写 `src/scenes-py/P0Hook.tsx`**

6 段：0 展示「两年代码」→ 1 三个问题点亮 → 2 答案不在语法里 → 3 卡住的原因 → 4 四层缩略 → 5 标题卡。

```tsx
import { Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const CODE = [
	"def top_words(path):",
	"    text = open(path).read()",
	"    counts = {}",
	"    for w in text.split():",
	"        counts[w] = counts.get(w, 0) + 1",
	"    return sorted(counts.items(),",
	"                  key=lambda kv: -kv[1])[:10]",
];

const PROBLEMS = ["文件大了吃满内存", "函数直接读磁盘，没法测", "调用方拿不到中间结果"];

const DESTINATIONS = ["数据模型", "生成器", "工程化"];

const LAYERS = ["语言内核", "并发与性能", "工程化", "生态方向"];

export const P0Hook: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
			{active <= 1 ? (
				<div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
					<Panel pad="26px 30px" style={{ flex: "0 0 760px" }}>
						<Label style={{ marginBottom: 16 }}>已经用了两年 Python</Label>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{CODE.map((line, i) => (
								<Reveal key={i} at={i * 5}>
									<div
										style={{
											fontFamily: MONO,
											fontSize: 24,
											lineHeight: 1.5,
											whiteSpace: "pre",
											color: COLORS.dim,
										}}
									>
										{line}
									</div>
								</Reveal>
							))}
						</div>
					</Panel>
					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							gap: 16,
							opacity: active === 1 ? 1 : 0,
						}}
					>
						<Label color={COLORS.warn}>但</Label>
						{PROBLEMS.map((p, i) => (
							<Reveal key={p} at={scene.paragraphs[1].startFrame + i * 12} from="left">
								<div
									style={{
										background: COLORS.warnSoft,
										border: `1px solid ${COLORS.warn}55`,
										borderRadius: 12,
										padding: "16px 22px",
										fontFamily: FONT,
										fontSize: 26,
										color: COLORS.text,
									}}
								>
									{p}
								</div>
							</Reveal>
						))}
					</div>
				</div>
			) : null}

			{active === 2 ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
					<Hero>这些问题，语法书里都不教</Hero>
					<div style={{ display: "flex", gap: 18, alignItems: "center" }}>
						<Mono size={24} color={COLORS.faint}>
							答案在
						</Mono>
						{DESTINATIONS.map((d, i) => (
							<Reveal key={d} at={scene.paragraphs[2].startFrame + 20 + i * 12} from="scale">
								<div
									style={{
										background: COLORS.accentSoft,
										border: `1px solid ${COLORS.accent}`,
										borderRadius: 12,
										padding: "14px 26px",
										fontFamily: MONO,
										fontSize: 28,
										color: COLORS.accent,
									}}
								>
									{d}
								</div>
							</Reveal>
						))}
					</div>
				</div>
			) : null}

			{active === 3 ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
					<Hero>进阶卡住的原因</Hero>
					<Bullets
						items={[
							{ text: "不是某个语法没学会" },
							{ text: "是没人告诉你，接下来该碰哪些东西" },
							{ text: "以及，碰到什么程度算会了" },
						]}
						active={2}
					/>
				</div>
			) : null}

			{active >= 4 ? (
				<div style={{ display: "flex", gap: 48, alignItems: "center" }}>
					<div style={{ flex: "0 0 620px", display: "flex", flexDirection: "column", gap: 10 }}>
						{LAYERS.map((l, i) => (
							<Reveal key={l} at={scene.paragraphs[4].startFrame + i * 10}>
								<div
									style={{
										background: COLORS.panel,
										border: `1px solid ${COLORS.border}`,
										borderRadius: 12,
										padding: "16px 26px",
										fontFamily: FONT,
										fontSize: 28,
										color: i === 0 ? COLORS.accent : COLORS.dim,
									}}
								>
									{l}
								</div>
							</Reveal>
						))}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
						<Hero size={52}>Python 进阶路线图</Hero>
						<Mono size={24} color={COLORS.dim}>
							15 分钟 · 10 个知识点 · 每个都带可验证的练法
						</Mono>
					</div>
				</div>
			) : null}
		</div>
	);
};
```

对应的 import 行是：

```tsx
import { Bullets, Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
```

- [ ] **Step 2: 写 `src/scenes-py/P1Roadmap.tsx`**

8 段：0–4 逐层点亮四层地图 → 5–7 四步学法逐个点亮。

```tsx
import { Chip, Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const LAYERS = [
	{
		name: "生态方向",
		detail: "Web / 数据 / AI，三条路选一条",
		chips: ["FastAPI", "polars", "模型 API"],
		color: COLORS.warn,
		soft: COLORS.warnSoft,
	},
	{
		name: "工程化",
		detail: "让别人能用、能改、能信任",
		chips: ["pyproject", "pytest", "ruff", "CI"],
		color: COLORS.ok,
		soft: "#122a1c",
	},
	{
		name: "并发与性能",
		detail: "同步思维的分水岭",
		chips: ["GIL", "多进程", "asyncio", "cProfile"],
		color: COLORS.accent2,
		soft: COLORS.accent2Soft,
	},
	{
		name: "语言内核",
		detail: "决定后面所有东西的理解上限",
		chips: ["数据模型", "装饰器", "生成器", "类型"],
		color: COLORS.accent,
		soft: COLORS.accentSoft,
	},
];

const STEPS = [
	{ n: "1", text: "读官方文档的对应章节", note: "不是教程，是 docs" },
	{ n: "2", text: "写最小复现，跑通，再故意弄坏", note: "看它报什么错" },
	{ n: "3", text: "读真实库的源码，看它在哪用", note: "搜用法，不读全篇" },
	{ n: "4", text: "真实项目里用上，留下产物", note: "听懂不算会" },
];

export const P1Roadmap: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	// Paragraph 1 lights the innermost layer, and it moves outward from there.
	const litIndex = active >= 1 && active <= 4 ? 3 - (active - 1) : -1;
	const lit = litIndex >= 0 ? LAYERS[litIndex] : undefined;
	// Steps light at paragraphs 5, 6 (two of them) and 7.
	const stepLit = active < 5 ? -1 : active === 5 ? 0 : active === 6 ? 2 : 4;

	return (
		<div style={{ height: "100%", display: "flex", gap: 46 }}>
			<div style={{ flex: "0 0 860px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
				{LAYERS.map((layer, i) => {
					const on = lit === layer;
					const revealAt = scene.paragraphs[0].startFrame + i * 10;
					return (
						<Reveal key={layer.name} at={revealAt} from="left">
							<div
								style={{
									background: on ? layer.soft : COLORS.panel,
									border: `1px solid ${on ? layer.color : COLORS.border}`,
									borderRadius: 14,
									padding: "18px 26px",
									display: "flex",
									alignItems: "center",
									gap: 20,
									translate: on ? "12px 0px" : "0px 0px",
									boxShadow: on ? `0 0 34px ${layer.color}33` : "none",
								}}
							>
								<span
									style={{
										fontFamily: FONT,
										fontSize: 30,
										color: on ? layer.color : COLORS.dim,
										flex: "0 0 auto",
									}}
								>
									{layer.name}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 23, color: COLORS.dim }}>
									{layer.detail}
								</span>
							</div>
						</Reveal>
					);
				})}
				<Reveal at={scene.paragraphs[0].startFrame} style={{ marginTop: 6 }}>
					<Mono size={21} color={COLORS.faint}>
						↑ 每一层只建立在下层之上
					</Mono>
				</Reveal>
			</div>

			<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
				{lit !== undefined ? (
					<Panel active accent={lit.color} pad="28px 32px">
						<Label color={lit.color} style={{ marginBottom: 16 }}>
							{lit.name}
						</Label>
						<div style={{ fontFamily: FONT, fontSize: 29, color: COLORS.text, marginBottom: 24 }}>
							{lit.detail}
						</div>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
							{lit.chips.map((c) => (
								<Chip key={c} color={lit.color} soft={lit.soft}>
									{c}
								</Chip>
							))}
						</div>
					</Panel>
				) : (
					<Panel pad="28px 32px">
						<Label style={{ marginBottom: 18 }}>走法 · 每个知识点都这么过</Label>
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							{STEPS.map((step, i) => {
								const on = i < stepLit;
								return (
									<div
										key={step.n}
										style={{
											display: "flex",
											gap: 16,
											alignItems: "baseline",
											opacity: on ? 1 : 0.3,
											borderLeft: `3px solid ${on ? COLORS.ok : COLORS.border}`,
											paddingLeft: 16,
										}}
									>
										<span style={{ fontFamily: MONO, fontSize: 20, color: COLORS.ok }}>{step.n}</span>
										<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
											<span style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text }}>
												{step.text}
											</span>
											<span style={{ fontFamily: MONO, fontSize: 18, color: COLORS.faint }}>
												{step.note}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</Panel>
				)}
				{active >= 7 ? (
					<Reveal at={scene.paragraphs[7].startFrame} from="scale">
						<Hero size={34} color={COLORS.accent}>
							听懂不算会，留下东西才算
						</Hero>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 4: 抽帧检查两个场景的每个状态**

P0 有 6 段、P1 有 8 段，状态多。先拿段起始帧：

Run: `node -e "const t=require('./src/timing.python.json'); for (const id of ['p00','p01']) { const s=t.scenes.find(x=>x.id===id); console.log('==',id,s.heading); s.paragraphs.forEach(p=>console.log(' para',p.index,'frame',s.startFrame+p.startFrame)); }"`

对每一段抽一帧（段起始帧 + 30）：

```bash
npx remotion still PythonRoadmap /tmp/p0-<para>.png --frame=<段起始帧+30>
```

Expected: P0 依次是「代码 + 三个问题」→「答案在…」→「卡住的原因」→「四层 + 标题卡」；P1 依次是四层逐个点亮 → 右侧换成四步走 → 最后一行 slogan。**逐张看图**，任何一张空白或溢出都要修。

- [ ] **Step 5: 提交**

```bash
git add src/scenes-py/P0Hook.tsx src/scenes-py/P1Roadmap.tsx
git commit -m "feat: build the hook and roadmap framing scenes

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## 内容场景的通用骨架

Tasks 11–21 都是同一套骨架，差别只在母题组件和内容数据。骨架长这样：

```tsx
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";

export const PXX: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	// Paragraph 5 is where every content scene hands the canvas to the practice panel.
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return <MainMotif scene={scene} active={active} />;
};
```

三条约定，每个场景任务都适用：

1. **不要在自己的 body 里重复 `scene.heading`。** `Stage` 的 `SceneHeader` 已经在左上角渲染了序号和 heading，重复一次会出现两行一样的标题。
2. **第 5 段是切换点。** 前 5 段（下标 0–4）讲机制，后 2 段（下标 5–6）整屏是练习面板。上面骨架里的 `at={5}` 不要改。
3. **母题组件消耗 `active` 来决定点亮状态**，映射关系在每个任务的表格里给出。`active` 是场景内相对段落下标，从 0 开始。

每个场景任务仍然要抽帧验证，命令模板：

```bash
node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='<scene-id>'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"
npx remotion still PythonRoadmap /tmp/<scene-id>-<para>.png --frame=<段起始帧+30>
```

---

## Task 11: `P2DataModel`（语言内核 · 数据模型）

**Files:**
- Modify: `src/scenes-py/P2DataModel.tsx`

段落 → 画面状态（母题：`CodeCompare`）：

| 段 | 画面 |
|---|---|
| 0 | 左栏「基础写法」开始逐行出现 |
| 1 | 右栏「背后的协议」出现，与左栏一一对应，高亮 |
| 2 | 右栏 `__len__` 行强调（`mark`） |
| 3 | 高亮 `__enter__ / __exit__` 行 |
| 4 | 高亮 `__add__` 行 |
| 5–6 | 整屏切 `PracticeBox` |

实现上不需要按段切换内容——`CodeCompare` 自己会按行逐个揭示，`active` 只影响 `from` 参数的推进。

- [ ] **Step 1: 写场景**

```tsx
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给自己的类实现 3 个协议", artifact: "一个能 with、能迭代、能比较的类" },
	{ text: "读一遍官方 Data Model 章节", artifact: "一份「协议 → 触发场景」清单" },
];

export const P2DataModel: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "基础写法",
					note: "能跑",
					lines: [
						{ text: "n = len(items)" },
						{ text: "with open(path) as f:" },
						{ text: "    data = f.read()" },
						{ text: "total = a + b" },
						{ text: "for x in obj:" },
						{ text: "    process(x)" },
					],
				}}
				right={{
					title: "背后都是协议",
					note: "dunder 是接口约定，不是语法糖",
					lines: [
						{ text: "n = items.__len__()", mark: true },
						{ text: "f.__enter__() / f.__exit__()", mark: true },
						{ text: "    # 只要实现它，你的类也能进 with" },
						{ text: "total = a.__add__(b)", mark: true },
						{ text: "obj.__iter__() → __next__()", mark: true },
						{ text: "" },
					],
				}}
			/>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p02'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

对第 0、2、5 段各抽一帧：

```bash
npx remotion still PythonRoadmap /tmp/p02-0.png --frame=<第0段起始帧+40>
npx remotion still PythonRoadmap /tmp/p02-2.png --frame=<第2段起始帧+40>
npx remotion still PythonRoadmap /tmp/p02-5.png --frame=<第5段起始帧+60>
```

Expected: 前两张是双栏代码，行数递增；第三张是练习面板。**逐张核对最长的代码行没有贴到面板边缘。**

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P2DataModel.tsx
git commit -m "feat: build P2 data model scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 12: `P3Decorators`（语言内核 · 装饰器与闭包）

**Files:**
- Modify: `src/scenes-py/P3Decorators.tsx`

段落 → 画面状态（母题：`CodeCompare`）：

| 段 | 画面 |
|---|---|
| 0 | 左栏「手写装饰器」逐行出现 |
| 1–2 | 右栏顶部 `fetch = retry(fetch)` 高亮——这是全片的「原来如此」时刻 |
| 3 | 右栏中部出现「三段式」三行 |
| 4 | 右栏底部 `functools` 三行高亮 |
| 5–6 | 整屏切 `PracticeBox` |

- [ ] **Step 1: 写场景**

```tsx
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "手写 @retry(次数, 间隔)", artifact: "能装饰任意函数、保留函数名、超限抛异常的装饰器" },
	{ text: "先写闭包，再写装饰器，最后才用 @", artifact: "一份能讲清 func = deco(func) 的笔记" },
];

export const P3Decorators: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "手写装饰器",
					note: "先不用 @ 语法",
					lines: [
						{ text: "def retry(fn):" },
						{ text: "    def wrapper(*a, **kw):" },
						{ text: "        return fn(*a, **kw)" },
						{ text: "    return wrapper" },
						{ text: "" },
						{ text: "def fetch():" },
						{ text: "    ..." },
						{ text: "" },
						{ text: "fetch = retry(fetch)" },
					],
				}}
				right={{
					title: "为什么成立 / 标准答案",
					note: "装饰器就是一次赋值",
					lines: [
						{ text: "fetch = retry(fetch)", mark: true },
						{ text: "    # @retry 只是这行的语法糖" },
						{ text: "" },
						{ text: "# 三段式：" },
						{ text: "#   不带参 → 带参 → 类装饰器", mark: true },
						{ text: "" },
						{ text: "functools.wraps(fn)      # 保住名字", mark: true },
						{ text: "functools.lru_cache       # 一行缓存", mark: true },
						{ text: "functools.partial(fn, x)  # 固定参数", mark: true },
					],
				}}
			/>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p03'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p03-1.png --frame=<第1段起始帧+40>
npx remotion still PythonRoadmap /tmp/p03-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p03-5.png --frame=<第5段起始帧+60>
```

Expected: 第 1 段帧右栏顶部一行高亮；第 4 段帧右栏 functools 三行高亮；第 5 段帧是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P3Decorators.tsx
git commit -m "feat: build P3 decorators scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 13: `P4Generators`（语言内核 · 迭代器与生成器）

**Files:**
- Modify: `src/scenes-py/P4Generators.tsx`

段落 → 画面状态（母题：`CodeCompare`）：

| 段 | 画面 |
|---|---|
| 0 | 标题式对比：左「一次性读」右「惰性流式」 |
| 1 | 左栏首行 `open(path).read()` 高亮——开销在哪 |
| 2 | 右栏 `yield` 行高亮 |
| 3 | 右栏加一行注释「省内存，不省时间」 |
| 4 | 右栏底部 `itertools` 三行高亮 |
| 5–6 | 整屏切 `PracticeBox` |

- [ ] **Step 1: 写场景**

```tsx
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把词频统计改成流式", artifact: "能吃几百兆日志、内存恒定的脚本" },
	{ text: "用 itertools 替掉手写循环", artifact: "一段用 groupby / islice / chain 的代码" },
];

export const P4Generators: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "一次性读",
					note: "文件多大，内存多大",
					lines: [
						{ text: "text = open(path).read()", mark: true },
						{ text: "counts = {}" },
						{ text: "for w in text.split():" },
						{ text: "    counts[w] = counts.get(w, 0) + 1" },
						{ text: "return sorted(counts.items()," },
						{ text: "              key=lambda kv: -kv[1])[:10]" },
					],
				}}
				right={{
					title: "惰性流式",
					note: "省内存，不省时间",
					lines: [
						{ text: "def lines(path):" },
						{ text: "    with open(path) as f:" },
						{ text: "        for line in f:" },
						{ text: "            yield line", mark: true },
						{ text: "" },
						{ text: "Counter(w for l in lines(p)" },
						{ text: "          for w in l.split())", mark: true },
						{ text: "" },
						{ text: "itertools.groupby / islice / chain", mark: true },
					],
				}}
			/>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p04'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p04-1.png --frame=<第1段起始帧+40>
npx remotion still PythonRoadmap /tmp/p04-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p04-5.png --frame=<第5段起始帧+60>
```

Expected: 左栏首行高亮 / 右栏 `yield` 与 `Counter` 行高亮 / 练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P4Generators.tsx
git commit -m "feat: build P4 generators scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 14: `P5Typing`（语言内核 · 类型系统）

**Files:**
- Modify: `src/scenes-py/P5Typing.tsx`

段落 → 画面状态（母题：`CodeCompare`）：

| 段 | 画面 |
|---|---|
| 0 | 左栏「够用的写法」三行 |
| 1 | 左栏加注释「不改变运行，给工具看」 |
| 2 | 右栏 `TypeVar` 泛型行高亮 |
| 3 | 右栏 `Protocol` 块高亮——本场景的重点 |
| 4 | 右栏 `Literal` 行 + 工具行高亮 |
| 5–6 | 整屏切 `PracticeBox` |

- [ ] **Step 1: 写场景**

```tsx
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给一个 200 行的脚本加全类型标注", artifact: "一个 mypy 能跑通的仓库" },
	{ text: "把类型检查接进编辑器", artifact: "日常开发实时标红，慢慢清零" },
];

export const P5Typing: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "够用的写法",
					note: "第一天就会",
					lines: [
						{ text: "def load(path: str) -> dict[str, int]:" },
						{ text: "    ..." },
						{ text: "" },
						{ text: "items: list[Item] = []" },
						{ text: "maybe: str | None = None" },
						{ text: "" },
						{ text: "# 不改变运行，是给工具和人看的", mark: true },
					],
				}}
				right={{
					title: "真正的门槛",
					note: "三样东西",
					lines: [
						{ text: "T = TypeVar(\"T\")", mark: true },
						{ text: "def first(xs: list[T]) -> T: ...", mark: true },
						{ text: "" },
						{ text: "class Reader(Protocol):", mark: true },
						{ text: "    def read(self, n: int) -> bytes: ...", mark: true },
						{ text: "    # 不继承，只要长得像 → 鸭子类型", mark: true },
						{ text: "" },
						{ text: "Level = Literal[\"debug\", \"info\"]", mark: true },
						{ text: "" },
						{ text: "mypy / pyright / ruff → 接进编辑器", mark: true },
					],
				}}
			/>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p05'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p05-3.png --frame=<第3段起始帧+40>
npx remotion still PythonRoadmap /tmp/p05-5.png --frame=<第5段起始帧+60>
```

Expected: 第 3 段帧右栏 `Protocol` 块高亮；第 5 段帧是练习面板。右栏有 10 行，**注意检查最下面一行有没有被字幕条压住**（内容区底部是 148px 留白）。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P5Typing.tsx
git commit -m "feat: build P5 typing scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 15: `P6Gil`（并发 · GIL 与选型）

Task 7 已经写了这个场景的可用版本（含四条泳道的数据）。这个任务把它定稿：加上练习面板切换，并核验泳道点亮映射。

**Files:**
- Modify: `src/scenes-py/P6Gil.tsx`

段落 → 画面状态（母题：`Timeline`，`lit` 参数驱动）：

| 段 | `lit` | 说明 |
|---|---|---|
| 0 | 0 | 四条泳道先出现，串行被点亮 |
| 1 | 1 | 多线程 · CPU 密集——重点：四个块几乎不重叠 |
| 2 | 2 | 多线程 · IO 密集——重点：wait 块是斜纹 |
| 3 | 3 | 多进程——重点：四个块完全重叠 |
| 4 | 3 | 停留（3.13 自由线程的补充说明） |
| 5–6 | — | 整屏切 `PracticeBox` |

Task 7 写的是 `lit={Math.min(Math.max(active - 1, 0), 3)}`，对应上表是正确的（`active=0` → `0`）。保留。

- [ ] **Step 1: 在 Task 7 的版本上补练习面板切换**

把 `P6Gil.tsx` 改成：

```tsx
import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { Timeline } from "./components/Timeline";
import type { SceneTiming } from "../types";

const LANES = [
	{
		title: "串行",
		note: "一个接一个",
		blocks: [
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T1" },
			{ start: 0.25, end: 0.5, kind: "busy" as const, label: "T2" },
			{ start: 0.5, end: 0.75, kind: "busy" as const, label: "T3" },
			{ start: 0.75, end: 1, kind: "busy" as const, label: "T4" },
		],
	},
	{
		title: "多线程 · CPU 密集",
		note: "抢同一把锁",
		blocks: [
			{ start: 0, end: 0.28, kind: "busy" as const, label: "T1" },
			{ start: 0.28, end: 0.62, kind: "busy" as const, label: "T2" },
			{ start: 0.62, end: 0.82, kind: "busy" as const, label: "T3" },
			{ start: 0.82, end: 1, kind: "busy" as const, label: "T4" },
		],
	},
	{
		title: "多线程 · IO 密集",
		note: "等的时候把锁放掉",
		blocks: [
			{ start: 0, end: 0.18, kind: "busy" as const, label: "T1" },
			{ start: 0.18, end: 0.4, kind: "wait" as const },
			{ start: 0.4, end: 0.58, kind: "busy" as const, label: "T2" },
			{ start: 0.58, end: 0.9, kind: "wait" as const },
			{ start: 0.9, end: 1, kind: "busy" as const, label: "T3" },
		],
	},
	{
		title: "多进程",
		note: "各跑各的解释器，绕开 GIL",
		blocks: [
			{ start: 0, end: 0.25, kind: "busy" as const },
			{ start: 0, end: 0.25, kind: "busy" as const },
			{ start: 0, end: 0.25, kind: "busy" as const },
			{ start: 0, end: 0.25, kind: "busy" as const },
		],
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "同一任务用串行 / 线程 / 进程各跑一遍", artifact: "一张耗时对比表" },
	{ text: "CPU 密集和 IO 密集各做一次", artifact: "能说出「什么时候多线程真的有用」" },
];

export const P6Gil: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<Hero size={42}>{scene.heading}</Hero>
			<Timeline scene={scene} lit={Math.min(Math.max(active - 1, 0), 3)} lanes={LANES} />
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。`TimelineLane` 的 `blocks[].kind` 是联合字面量，上面的 `as const` 是必需的，别删。

- [ ] **Step 3: 抽帧检查四条的泳道点亮**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p06'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p06-1.png --frame=<第1段起始帧+40>
npx remotion still PythonRoadmap /tmp/p06-3.png --frame=<第3段起始帧+40>
npx remotion still PythonRoadmap /tmp/p06-5.png --frame=<第5段起始帧+60>
```

Expected: 第 1 段帧点亮第二条泳道；第 3 段帧点亮第四条（四个块重叠成一块）；第 5 段帧是练习面板。**多进程那条重叠后如果标签挤成一团，把 `label` 全部去掉。**

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P6Gil.tsx
git commit -m "feat: finalise P6 GIL scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 16: `P7Asyncio`（并发 · asyncio）

**Files:**
- Modify: `src/scenes-py/P7Asyncio.tsx`

段落 → 画面状态（母题：`Timeline`）：

| 段 | `lit` | 说明 |
|---|---|---|
| 0 | 0 | 串行 requests——四个块首尾相接 |
| 1 | 0 | 停留 |
| 2 | 0 | 停留（await 的语义） |
| 3 | 1 | 线程池——四个块重叠 |
| 4 | 2 | asyncio——**单线程**也能重叠，强调这一点 |
| 5–6 | — | 整屏切 `PracticeBox` |

第 4 段的重点是「一个线程也能并发」，所以第三条泳道要画成「同一条轨道上的交错块」而不是多条并行轨。

- [ ] **Step 1: 写场景**

```tsx
import { Hero, Mono } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { Timeline } from "./components/Timeline";
import { COLORS } from "../theme";
import type { SceneTiming } from "../types";

const LANES = [
	{
		title: "串行 requests",
		note: "请求一个等一个",
		blocks: [
			{ start: 0, end: 0.25, kind: "wait" as const, label: "req" },
			{ start: 0.25, end: 0.5, kind: "wait" as const, label: "req" },
			{ start: 0.5, end: 0.75, kind: "wait" as const, label: "req" },
			{ start: 0.75, end: 1, kind: "wait" as const, label: "req" },
		],
	},
	{
		title: "线程池",
		note: "四个线程一起等",
		blocks: [
			{ start: 0, end: 0.25, kind: "wait" as const },
			{ start: 0.02, end: 0.27, kind: "wait" as const },
			{ start: 0.04, end: 0.29, kind: "wait" as const },
			{ start: 0.06, end: 0.31, kind: "wait" as const },
		],
	},
	{
		title: "asyncio · 单线程",
		note: "一个线程，交错等",
		accent: COLORS.accent2,
		blocks: [
			{ start: 0, end: 0.14, kind: "busy" as const, label: "a" },
			{ start: 0.14, end: 0.3, kind: "wait" as const },
			{ start: 0.16, end: 0.32, kind: "busy" as const, label: "b" },
			{ start: 0.32, end: 0.48, kind: "wait" as const },
			{ start: 0.34, end: 0.5, kind: "busy" as const, label: "c" },
			{ start: 0.5, end: 0.66, kind: "wait" as const },
		],
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把 requests 串行脚本改成 httpx 异步并发", artifact: "同一批请求的耗时对比" },
	{ text: "故意在协程里调一次同步阻塞函数", artifact: "亲眼看到并发全部退化" },
];

export const P7Asyncio: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	const lit = active <= 2 ? 0 : active === 3 ? 1 : 2;
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
			<Hero size={42}>{scene.heading}</Hero>
			<Timeline scene={scene} lit={lit} lanes={LANES} />
			{active === 4 ? (
				<Mono size={22} color={COLORS.accent2}>
					↑ 一个线程，一样能并发——前提是每一步都真的在等 IO
				</Mono>
			) : null}
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p07'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p07-1.png --frame=<第1段起始帧+40>
npx remotion still PythonRoadmap /tmp/p07-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p07-5.png --frame=<第5段起始帧+60>
```

Expected: 第 1 段帧点亮第一条；第 4 段帧点亮第三条并出现底部注释；第 5 段帧是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P7Asyncio.tsx
git commit -m "feat: build P7 asyncio scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 17: `P8Profiling`（性能 · 先测量再优化）

这个场景**不用 `Timeline`**。它的内容是「顺序」，不是「时间分布」——强行套时间轴会把论证讲糊。改用两个一次性组件：左边 cProfile 热点排行，右边优化顺序阶梯。

**Files:**
- Modify: `src/scenes-py/P8Profiling.tsx`

段落 → 画面状态：

| 段 | 画面 |
|---|---|
| 0–1 | 只有中间一句大字：「顺序」 |
| 2 | 左侧热点排行出现（cProfile 风格的排行条） |
| 3 | 右侧优化顺序阶梯出现，前三级点亮 |
| 4 | 阶梯后两级点亮并变暗（标注「放最后」） |
| 5–6 | 整屏切 `PracticeBox` |

- [ ] **Step 1: 写场景**

```tsx
import { Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const HOTSPOTS = [
	{ name: "parse_row", pct: 46 },
	{ name: "normalize", pct: 24 },
	{ name: "sort_keys", pct: 13 },
	{ name: "read_csv", pct: 9 },
	{ name: "<built-in>", pct: 5 },
];

const RUNGS = [
	{ text: "换算法和数据结构", note: "收益最大" },
	{ text: "减少重复计算，加缓存", note: "第二" },
	{ text: "换 C 扩展库 / 向量化", note: "比如循环换 numpy" },
	{ text: "上并发", note: "放最后" },
	{ text: "微优化", note: "放最后" },
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给一个跑得慢的脚本跑 cProfile", artifact: "一份 top 热点清单" },
	{ text: "只优化第一名，再测一次", artifact: "数字动了才继续；没动就回去看 profiling" },
];

export const P8Profiling: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active <= 1) {
		return (
			<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Hero size={82}>顺序</Hero>
			</div>
		);
	}
	return (
		<div style={{ height: "100%", display: "flex", gap: 30, alignItems: "center" }}>
			<Panel pad="26px 30px" style={{ flex: 1 }}>
				<Label color={COLORS.accent} style={{ marginBottom: 20 }}>
					cProfile · 先看事实
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
					{HOTSPOTS.map((h, i) => (
						<Reveal key={h.name} at={scene.paragraphs[2].startFrame + i * 8} from="left">
							<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
								<Mono size={22} color={i === 0 ? COLORS.accent : COLORS.dim} style={{ flex: "0 0 210px" }}>
									{h.name}
								</Mono>
								<div style={{ flex: 1, height: 22, background: COLORS.bg, borderRadius: 5 }}>
									<div
										style={{
											width: `${h.pct * 2}%`,
											height: "100%",
											background: i === 0 ? COLORS.accent : COLORS.borderHi,
											borderRadius: 5,
										}}
									/>
								</div>
								<Mono size={20} color={COLORS.faint} style={{ flex: "0 0 60px" }}>
									{h.pct}%
								</Mono>
							</div>
						</Reveal>
					))}
				</div>
			</Panel>

			<Panel pad="26px 30px" style={{ flex: "0 0 640px" }}>
				<Label color={COLORS.ok} style={{ marginBottom: 20 }}>
					优化顺序
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					{RUNGS.map((r, i) => {
						const late = i >= 3;
						const on = active >= 3 && (late ? active >= 4 : true);
						return (
							<div
								key={r.text}
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: 16,
									opacity: on ? (late ? 0.45 : 1) : 0.15,
									borderLeft: `3px solid ${late ? COLORS.danger : COLORS.ok}`,
									paddingLeft: 16,
								}}
							>
								<span style={{ fontFamily: MONO, fontSize: 20, color: late ? COLORS.danger : COLORS.ok }}>
									{i + 1}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text }}>{r.text}</span>
								<span style={{ fontFamily: MONO, fontSize: 18, color: COLORS.faint, marginLeft: "auto" }}>
									{r.note}
								</span>
							</div>
						);
					})}
				</div>
			</Panel>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p08'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p08-0.png --frame=<第0段起始帧+40>
npx remotion still PythonRoadmap /tmp/p08-3.png --frame=<第3段起始帧+40>
npx remotion still PythonRoadmap /tmp/p08-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p08-5.png --frame=<第5段起始帧+60>
```

Expected: 第一张只有「顺序」两个大字；第二张三、两张面板都在，阶梯前三级亮；第三张后两级亮但变暗；第四张是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P8Profiling.tsx
git commit -m "feat: build P8 profiling scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 18: `P9Structure`（工程化 · 项目结构与依赖）

Task 8 已经写了这个场景的可用版本。定稿：加练习面板切换。

**Files:**
- Modify: `src/scenes-py/P9Structure.tsx`

段落 → 画面状态（母题：`TreeCompare`，`at` 参数是内容开始揭示的段）：

| 段 | 画面 |
|---|---|
| 0 | 空白（只讲「第一步是项目结构」） |
| 1 | `at={1}`——目录树与 `pyproject.toml` 同时展开 |
| 2 | 停留，`src/` 那几行是重点 |
| 3 | 停留（讲 uv） |
| 4 | 停留（讲锁文件纪律） |
| 5–6 | 整屏切 `PracticeBox` |

- [ ] **Step 1: 定稿场景**

```tsx
import { useSceneFrame } from "../components/Stage";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { TreeCompare } from "./components/TreeCompare";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把散装脚本改成 src layout 的包", artifact: "一个 pip install -e . 之后能导入的包" },
	{ text: "把踩到的坑记下来", artifact: "相对导入 / 模块找不到 / 路径写死，各一条" },
];

export const P9Structure: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active < 1) {
		return null;
	}
	return (
		<TreeCompare
			scene={scene}
			at={1}
			tree={[
				{ prefix: "", name: "myproj/", mark: true },
				{ prefix: "├─ ", name: "src/myproj/", note: "代码", mark: true },
				{ prefix: "│  ├─ ", name: "__init__.py" },
				{ prefix: "│  └─ ", name: "core.py" },
				{ prefix: "├─ ", name: "tests/", note: "测试" },
				{ prefix: "├─ ", name: "pyproject.toml", note: "项目与依赖", mark: true },
				{ prefix: "└─ ", name: "uv.lock", note: "锁定的版本" },
			]}
			snippet={{
				title: "pyproject.toml",
				mark: [0, 6, 9],
				lines: [
					"[project]",
					'name = "myproj"',
					'version = "0.1.0"',
					'requires-python = ">=3.12"',
					'',
					"[project.scripts]",
					'myproj = "myproj.core:main"',
					'',
					"[dependency-groups]",
					'dev = ["pytest", "ruff", "mypy"]',
				],
			}}
		/>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p09'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p09-1.png --frame=<第1段起始帧+60>
npx remotion still PythonRoadmap /tmp/p09-5.png --frame=<第5段起始帧+60>
```

Expected: 第一张目录树 + toml 都已展开；第二张是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P9Structure.tsx
git commit -m "feat: finalise P9 project structure scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 19: `P10Testing`（工程化 · 测试与质量）

**Files:**
- Modify: `src/scenes-py/P10Testing.tsx`

段落 → 画面状态（母题：`TreeCompare`）：

| 段 | 画面 |
|---|---|
| 0 | 空白 |
| 1 | 左侧 `tests/` 目录 + 一个测试文件骨架 |
| 2 | 停留（好测试测行为，不测实现） |
| 3 | 右侧换成质量工具配置（ruff / mypy / pre-commit） |
| 4 | 右侧底部出现 CI 配置片段 |
| 5–6 | 整屏切 `PracticeBox` |

第 3 段右侧内容和第 1、2 段不同，所以这个场景用一个 `snippet`，把 CI 那两行放在末尾，靠 `mark` 行号在段 3/4 之间区分。`TreeCompare` 没有「按段换内容」的能力，如果实现时觉得生硬，改为在第 3 段切一个独立的 `Panel`——这是允许的，不比硬套母题差。

- [ ] **Step 1: 写场景**

```tsx
import { Label, Mono, Panel } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { TreeCompare } from "./components/TreeCompare";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给最核心的函数补测试，边界写全", artifact: "一个测试文件，覆盖正常 + 边界 + 异常" },
	{ text: "接上 ruff / mypy / pre-commit", artifact: "提交前跑不过就提交不了" },
];

export const P10Testing: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active < 1) {
		return null;
	}
	if (active >= 3) {
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
				<Panel pad="26px 32px">
					<Label color={COLORS.accent} style={{ marginBottom: 20 }}>
						静态检查与 CI
					</Label>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{[
							"ruff check .        # 风格 + 一部分 bug",
							"mypy src            # 类型",
							"pre-commit install  # 挂在提交前",
							"",
							"# CI 最小版：每次 push 跑一遍",
							"pytest -q && ruff check .",
						].map((line, i) => (
							<Mono key={i} size={23} color={i >= 4 ? COLORS.ok : COLORS.dim} style={{ whiteSpace: "pre" }}>
								{line}
							</Mono>
						))}
					</div>
				</Panel>
				<div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
					<Mono size={21} color={COLORS.warn}>
						先测试，后工具
					</Mono>
					<span style={{ fontFamily: FONT, fontSize: 23, color: COLORS.dim }}>
						—— 工具保证不了逻辑对不对
					</span>
				</div>
			</div>
		);
	}
	return (
		<TreeCompare
			scene={scene}
			at={1}
			tree={[
				{ prefix: "", name: "myproj/", mark: true },
				{ prefix: "├─ ", name: "src/myproj/core.py", note: "被测对象" },
				{ prefix: "└─ ", name: "tests/", note: "测试", mark: true },
				{ prefix: "   ├─ ", name: "test_core.py", mark: true },
				{ prefix: "   └─ ", name: "conftest.py", note: "共享 fixture" },
			]}
			snippet={{
				title: "test_core.py",
				mark: [1, 5, 8],
				lines: [
					"def test_normal():",
					"    assert parse(\"a b\") == {...}",
					"",
					"@pytest.fixture",
					"def tmp_csv(tmp_path): ...",
					"",
					"@pytest.mark.parametrize(\"raw,expected\", [",
					"    (\"\", {}),",
					"    (\"a\", {\"a\": 1}),",
					"])",
					"def test_cases(raw, expected): ...",
				],
			}}
		/>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p10'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p10-1.png --frame=<第1段起始帧+60>
npx remotion still PythonRoadmap /tmp/p10-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p10-5.png --frame=<第5段起始帧+60>
```

Expected: 第一张是测试目录 + 测试文件；第二张换成质量工具面板 + 底部「先测试后工具」；第三张是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P10Testing.tsx
git commit -m "feat: build P10 testing scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 20: `P11Ecosystem`（生态 · 三条路线）

Task 9 已经写了这个场景的可用版本。定稿：确认点亮映射，加练习面板切换。

**Files:**
- Modify: `src/scenes-py/P11Ecosystem.tsx`

段落 → 画面状态（母题：`EcosystemPicker`）：

| 段 | `lit` | 画面 |
|---|---|---|
| 0 | -1 | 三列卡片一起出现，都不点亮 |
| 1 | 0 | Web 点亮 |
| 2 | 1 | 数据点亮 |
| 3 | 2 | AI / Agent 点亮 |
| 4 | 2 | 底部出现「选一条走完」 |
| 5–6 | — | 整屏切 `PracticeBox` |

- [ ] **Step 1: 定稿场景**

```tsx
import { useSceneFrame } from "../components/Stage";
import { EcosystemPicker } from "./components/EcosystemPicker";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import type { SceneTiming } from "../types";

const TRACKS = [
	{
		name: "Web",
		goal: "服务端接口",
		chain: ["FastAPI", "Pydantic", "SQLAlchemy", "部署"],
		accent: "#7d8cff",
		soft: "#1b2040",
	},
	{
		name: "数据",
		goal: "分析与处理",
		chain: ["pandas", "polars", "NumPy", "可视化"],
		accent: "#2fd3bd",
		soft: "#0e2b2b",
	},
	{
		name: "AI / Agent",
		goal: "模型应用",
		chain: ["模型 API", "流式", "向量检索", "工具循环"],
		accent: "#ffb454",
		soft: "#2e2210",
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "写下一年最想做成的一件事", artifact: "一句话，越具体越好" },
	{ text: "反推选哪条路线", artifact: "选定后，用四步法把这条链过一遍" },
];

export const P11Ecosystem: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<EcosystemPicker
				scene={scene}
				tracks={TRACKS}
				lit={active === 0 ? -1 : Math.min(active - 1, 2)}
				pickAt={4}
			/>
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p11'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p11-0.png --frame=<第0段起始帧+50>
npx remotion still PythonRoadmap /tmp/p11-2.png --frame=<第2段起始帧+40>
npx remotion still PythonRoadmap /tmp/p11-4.png --frame=<第4段起始帧+40>
npx remotion still PythonRoadmap /tmp/p11-5.png --frame=<第5段起始帧+60>
```

Expected: 第一张三列都亮；第二张「数据」列点亮、其余变暗；第三张底部出现「选一条走完」；第四张是练习面板。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P11Ecosystem.tsx
git commit -m "feat: finalise P11 ecosystem scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 21: `P12Outro`（收尾 · 八周计划）

这个场景**不用切换**——八周计划表本身就是「怎么练」，所以它没有独立的练习面板。8 段里前 7 段逐周点亮，第 8 段是收尾 slogan。

**Files:**
- Modify: `src/scenes-py/P12Outro.tsx`

段落 → 画面状态：

| 段 | 画面 |
|---|---|
| 0 | 标题「八周」+ 空表 |
| 1 | W1 点亮 |
| 2 | W2、W3 点亮 |
| 3 | W4、W5 点亮 |
| 4 | W6、W7 点亮 |
| 5 | W8 点亮 |
| 6 | 底部汇总「七个可展示的产物」 |
| 7 | 整屏只剩 slogan |

- [ ] **Step 1: 写场景**

```tsx
import { Hero, Mono, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const WEEKS = [
	{ label: "W1", topic: "数据模型 + 装饰器", artifact: "自定义类实现 3 协议 + 手写 @retry", from: 1 },
	{ label: "W2", topic: "生成器与迭代", artifact: "大文件脚本改流式", from: 2 },
	{ label: "W3", topic: "类型系统", artifact: "200 行以上、mypy 全绿", from: 2 },
	{ label: "W4", topic: "并发", artifact: "串行 / 线程 / 进程对比表", from: 3 },
	{ label: "W5", topic: "性能", artifact: "profiling 报告 + 实际优化结果", from: 3 },
	{ label: "W6", topic: "工程化 · 结构", artifact: "规范的包", from: 4 },
	{ label: "W7", topic: "工程化 · 质量", artifact: "测试 + ruff/mypy/pre-commit + CI", from: 4 },
	{ label: "W8", topic: "方向", artifact: "一个你自己想用的小工具", from: 5 },
];

export const P12Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);

	if (active >= 7) {
		return (
			<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Hero size={72} color={COLORS.accent}>
					听懂不算会，留下东西才算
				</Hero>
			</div>
		);
	}

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<div style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 6 }}>
				<Hero size={44}>八周</Hero>
				<Mono size={24} color={COLORS.dim}>
					每周一个能拿出来的东西
				</Mono>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				{WEEKS.map((w, i) => {
					const on = active >= w.from;
					return (
						<Reveal key={w.label} at={scene.paragraphs[w.from].startFrame + i * 5} from="left">
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 20,
									opacity: on ? 1 : 0.22,
									background: on ? COLORS.panelHi : "transparent",
									border: `1px solid ${on ? COLORS.borderHi : COLORS.border}`,
									borderLeft: `3px solid ${on ? COLORS.ok : COLORS.border}`,
									borderRadius: 11,
									padding: "12px 22px",
								}}
							>
								<Mono size={22} color={on ? COLORS.ok : COLORS.faint} style={{ flex: "0 0 54px" }}>
									{w.label}
								</Mono>
								<span
									style={{
										fontFamily: FONT,
										fontSize: 27,
										color: COLORS.text,
										flex: "0 0 330px",
									}}
								>
									{w.topic}
								</span>
								<Mono size={20} color={on ? COLORS.dim : COLORS.faint}>
									{w.artifact}
								</Mono>
							</div>
						</Reveal>
					);
				})}
			</div>
			{active >= 6 ? (
				<Reveal at={scene.paragraphs[6].startFrame}>
					<Mono size={23} color={COLORS.accent2}>
						↑ 八周之后，你手里会有七个能给别人看的东西
					</Mono>
				</Reveal>
			) : null}
		</div>
	);
};
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit && npx eslint <本任务改动的文件>`

Expected: 通过。

- [ ] **Step 3: 抽帧检查**

Run: `node -e "const t=require('./src/timing.python.json'); const s=t.scenes.find(x=>x.id==='p12'); s.paragraphs.forEach(p=>console.log(p.index, s.startFrame+p.startFrame))"`

```bash
npx remotion still PythonRoadmap /tmp/p12-0.png --frame=<第0段起始帧+40>
npx remotion still PythonRoadmap /tmp/p12-3.png --frame=<第3段起始帧+40>
npx remotion still PythonRoadmap /tmp/p12-7.png --frame=<第7段起始帧+40>
```

Expected: 第一张八行都在但都是暗的；第二张前五行亮；第三张整屏只有 slogan。**注意八行的总高度**——8 行加上间隙可能超出 132–932 的内容区，超了就把 `padding` 从 `12px 22px` 降到 `8px 22px`。

- [ ] **Step 4: 提交**

```bash
git add src/scenes-py/P12Outro.tsx
git commit -m "feat: build P12 outro with the eight-week plan

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 22: 验收与回归

**Files:**
- 无代码改动（除非验收发现问题）

- [ ] **Step 1: 类型与规范全绿**

```bash
npx tsc --noEmit
npx eslint src/PythonRoadmap.tsx src/Root.tsx src/components/Stage.tsx src/scenes-py
```

Expected: 两条都退出码 0、无输出。

注意：**不要跑 `npm run lint`**（也不要跑 `npx eslint src`）——`src/scenes/S7Chord.tsx` 会让 ESLint 死循环，见上文「⚠️ 不要跑 `npm run lint`」。上面这条逐路径命令覆盖了本计划新增/修改的全部 TS/TSX 文件，所以它取代设计文档 §8 验收标准第 6 条（「`npm run lint` 通过」）：该条按字面无法达成，原因是本计划不得触碰的既有文件，不是本计划的产物。

- [ ] **Step 2: 端到端跑一遍 TTS，确认可重复**

```bash
node scripts/tts.mjs narration.python.json src/timing.python.json public/audio-py
node -e "const t=require('./src/timing.python.json'); const m=Math.floor(t.totalSeconds/60); console.log(m+'m '+Math.round(t.totalSeconds-m*60)+'s', t.scenes.length, 'scenes')"
```

Expected: 13 场景，总时长 13–17 分钟，与 Task 3 的结论一致（TTS 是确定性的，重复执行不应漂移）。

- [ ] **Step 3: 逐场景全帧扫一遍**

对 13 个场景各抽一帧（每个场景取 `startFrame + 60`）：

```bash
node -e "const t=require('./src/timing.python.json'); t.scenes.forEach(s=>console.log(s.id, s.startFrame+60))"
```

用打印出的帧号逐个 `npx remotion still`，**逐张打开看图**。这一步是人工的，不能跳过——类型检查发现不了布局溢出。重点看：

- 中文有没有被截断
- 代码行有没有贴边或换行
- 内容区底部（字幕条上方）有没有压住
- 每个场景的 heading（左上角）没有和 body 里的文字重复

- [ ] **Step 4: 渲染整片**

```bash
npx remotion render PythonRoadmap out/python-roadmap.mp4
```

Expected: 生成 mp4，时长与 `timing.python.json` 的 `totalSeconds` 一致（±1 秒），音频完整。

- [ ] **Step 5: 回归——现有 pi-durable 视频完好**

`/tmp/baseline-pidurable.png` 是 Task 0 在**任何改动之前**、`--frame=600` 渲染的基准。用同一帧再渲染一次，md5 必须逐字节一致：

```bash
npx remotion still PiDurable /tmp/final-pidurable.png --frame=600
python3 -c "import hashlib; a=hashlib.md5(open('/tmp/baseline-pidurable.png','rb').read()).hexdigest(); b=hashlib.md5(open('/tmp/final-pidurable.png','rb').read()).hexdigest(); print(a); print(b); print('SAME' if a==b else 'DIFFERENT')"
```

Expected: `SAME`。这是整条回归里最硬的一条证据——从 Task 0 到 Task 22 之间对 `Stage.tsx` / `Root.tsx` 的所有改动，都没有改变 pi-durable 的任何一个像素。

再确认整片仍能渲染：

```bash
npx remotion render PiDurable out/pi-durable-regression.mp4
```

- [ ] **Step 6: 确认没动过的文件真的没动**

基线是 **Task 0 的提交 `b8bcfbc`**，不是 `main`——`main` 上只有 Remotion 脚手架（16 个文件），pi-durable 的全部产物都是本分支新增的，拿 `main` 比会看到 119 个 `A`（added）而不是空。

```bash
git diff --stat b8bcfbc -- narration.json src/timing.json src/scenes src/PiDurable.tsx public/audio
```

Expected: **输出为空**。任何一行输出都说明改到了不该改的地方，必须查明。

- [ ] **Step 7: 提交最终产物**

⚠️ **不要用 `git add -A`。** 本仓库实测有别的会话在**同一条分支**上做另一个视频（chicken-rabbit 讲解），工作区里可能出现不属于本计划的改动；`git add -A` 会把别人的工作一起提交。只加本计划产出的路径：

```bash
git add src/PythonRoadmap.tsx src/Root.tsx src/components/Stage.tsx scripts/tts.mjs \
        src/scenes-py narration.python.json src/timing.python.json public/audio-py \
        docs/superpowers/plans/2026-10-07-python-advanced-roadmap-video.md
git status --short
```

Expected: `git status` 里只出现上面这些路径。如果还有别的文件被暂存，说明加多了，先 `git restore --staged <那个文件>`。

确认无误后再提交：

```bash
git commit -m "chore: python roadmap video final render checks

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

- [ ] **Step 8: 交付说明**

向用户报告：

1. 成片路径：`out/python-roadmap.mp4`，总时长
2. 预览方式：`npm run dev` → 选 `PythonRoadmap`
3. 13 个场景各自讲的知识点与练法（对照 spec 第 4 节的表）
4. 「路线图定位」这个取舍的实际效果——如果看完觉得某个方向太浅，下一步就是按 `docs/superpowers/specs/` 同样的流程，为那个方向单独出一集
5. 未做的事：没有 commit 到 `main`（工作在 `python-roadmap-video` 分支上）

---

## 自检记录

**Spec 覆盖：**

| Spec 章节 | 对应任务 |
|---|---|
| 目标、受众、硬约束 | 由 Task 3 的旁白内容落实（三段式、每场景 5 段机制 + 2 段练法） |
| 4. 内容结构（13 场景表） | Task 3（旁白）+ Task 10–21（画面） |
| 4.1 三段式节奏 | 「内容场景的通用骨架」+ 每场景的 `at={5}` 约定 |
| 4.2 通用学法四步 | Task 10 的 `P1Roadmap`（`STEPS` 数据） |
| 5. 视觉设计（四个母题） | Task 6（CodeCompare）、Task 7（Timeline）、Task 8（TreeCompare）、Task 9（EcosystemPicker）。生态母题 spec 里没列，是计划新增的 |
| 5. `PracticeBox` | Task 5 |
| 6.1 Stage 参数化 | Task 1 |
| 6.2 tts 参数化 | Task 2 |
| 6.3 新增文件清单 | Task 4（骨架）+ Task 5–21 |
| 6.4 数据流 | Task 3 → Task 4 → 各场景任务 |
| 6.5 配音参数 | Task 3 Step 1 的 narration 头部 |
| 7. 非破坏性 | Task 1 Step 5、Task 22 Step 5–6 |
| 8. 验收标准 | Task 22 |
| 9. 风险表 | 见下 |
| 10. 非目标 | 未安排任何超范围任务 |

**与 spec 的偏差（有意）：**

1. spec 5 节没给生态章节指定母题，计划新增了 `EcosystemPicker`。原因是三列路线卡片用现有积木拼不出来，且它值得成为一个独立母题。
2. spec 5 节把 `Timeline` 指定给整个「并发与性能」章节，但 p08 讲的是「顺序」，套时间轴会讲糊，计划改为一次性组件。这是对 spec 的修正，不是遗漏。

**风险表落点：**

| Spec 风险 | 计划里的应对 |
|---|---|
| 13 场景变流水账 | 「内容场景的通用骨架」的三条约定 + 每场景只留一个核心机制 |
| TTS 时长不可控 | Task 3 Step 3 的删句规则（不改 rate，只删句，每场景最少 5 句） |
| 中文与代码混排溢出 | Task 6 的 42 字符硬约束 + 每个场景任务的抽帧检查步骤 |
| 参数化碰坏现有视频 | Task 1 Step 5 的 md5 对比 + Task 22 Step 5–6 的回归 |

**步骤里的坑（已在对应位置提示）：** `TimelineLane.blocks[].kind` 需要 `as const`；`TreeCompare` 的 `lines` 是字符串数组而 `mark` 是行号数组；内容场景不要重复渲染 `scene.heading`。