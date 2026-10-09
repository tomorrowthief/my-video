# 多视频 registry 与共享渲染器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把三支视频重复的 composition 骨架收成一份 registry + 一个共享渲染器，让加视频从 5 处散落改动变成 2 处登记。

**Architecture:** `videos.json`（仓库根）持有 node 和 TS 都要读的路径；`src/videos.ts` 补上 JSON 装不下的静态 timing import 和场景组件映射，并在模块加载时双向校验；`src/components/Explainer.tsx` 持有那 60 行骨架的唯一一份；`src/Root.tsx` 遍历 registry，fps 与尺寸一律从 timing 读。

**Tech Stack:** Remotion 4.0.533、React 19、TypeScript（target ES2018 / lib es2020）

**Spec:** [docs/superpowers/specs/2026-10-09-video-registry-design.md](../specs/2026-10-09-video-registry-design.md)

---

## 这是纯重构：唯一的验收是「输出一个比特都没变」

本计划不新增任何画面功能。所以**唯一有意义的验收是三支视频逐帧 md5 等价**。
Task 1 在动任何代码之前先把基线渲出来，Task 7 用同样的帧号重渲并比对。
中间每个任务只要 `npx tsc --noEmit` 过即可 —— 真正的判决在 Task 7。

| 手段 | 怎么跑 | 作用 |
|---|---|---|
| 类型 | `npx tsc --noEmit`（普通 Bash） | 每个任务必过。**不要跑 `npm run lint`** |
| 逐帧等价 | `npx remotion still` + `md5`，**必须走终端面板** | 本次改造的唯一判决 |

**⚠️ 渲染不能在普通 Bash 工具里跑 —— 沙箱会拦死。**
macOS Seatbelt 不允许 Chromium 注册 Mach 端口，报
`bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer: Permission denied (1100)`。
渲染一律用 `mcp__terminal__run_in_terminal`，开 tab 时 `cwd` 设成工作目录。

**环境约束（已踩过的坑）：**

- `lib` 是 es2020：**不能用 `Array.prototype.at`、`Object.hasOwn`**。用 `Array.from`、索引访问
- `noUnusedLocals: true`：删文件后残留的死 import 会直接报错（这是帮手）
- `tsconfig` 无 `rootDir`/`include`，`src/videos.ts` import `../videos.json` 安全
- 提交信息用 heredoc（`git commit -F -`），信息里带嵌套引号时 `-m` 会被 shell 拆碎

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `videos.json` | 新增。每支视频的 title / brand / folder 和三个路径。**路径的唯一真相** |
| `src/videos.ts` | 新增。静态 timing import + 场景组件映射 + 加载时双向校验，导出 `VIDEOS` |
| `src/components/Explainer.tsx` | 新增。`makeExplainer()` —— 60 行骨架的唯一一份 |
| `src/Root.tsx` | 改。遍历 `VIDEOS` 按 folder 分组；fps/宽高从 timing 读 |
| `scripts/tts.mjs` | 改。首参数是 `videos.json` 的 key 时查表；三位置参数形式保留 |
| `src/theme.ts` | 改。移出 `MATH_COLORS` |
| `src/scenes-math/palette.ts` | 新增。接收 `MATH_COLORS` |
| `src/scenes-math/*.tsx`（6 个） | 改。`MATH_COLORS` 的 import 来源改为 `./palette` |
| `src/PiDurable.tsx` | **删除** |
| `src/PythonRoadmap.tsx` | **删除** |
| `src/ChickenRabbit.tsx` | **删除** |

**场景文件（29 个）除了 math 那 6 个改一行 import 外，一个不动。**

### 三支视频的场景映射（照抄，不要凭记忆写）

```
pi-durable  s0:S0Hook s1:S1Layers s2:S2Invariants s3:S3Commit s4:S4Poison
            s5:S5States s6:S6Tasks s7:S7Chord s8:S8Storage s9:S9Outro

python      p00:P0Hook p01:P1Roadmap p02:P2DataModel p03:P3Decorators
            p04:P4Generators p05:P5Typing p06:P6Gil p07:P7Asyncio
            p08:P8Profiling p09:P9Structure p10:P10Testing p11:P11Ecosystem
            p12:P12Outro

math        s0:M0Pose s1:M1Table s2:M2Assume s3:M3Lift s4:M4Converge s5:M5Outro
```

composition id 必须一字不差保持为 `PiDurable`、`PythonRoadmap`、`ChickenRabbit` —— 改了既有渲染命令就失效。

---

## Task 1: 渲染基线（动代码之前）

**Files:** 无改动，纯产出基线。

- [ ] **Step 1: 隔离工作区**

用 `superpowers:using-git-worktrees` 技能。主 checkout 在 `python-roadmap-video` 分支上，
本次要删除 `PythonRoadmap.tsx`，必须隔离。

worktree 从**当前 HEAD** 开，不要从 `main`（main 是 16 个文件的空壳脚手架，没有 `Stage.tsx`/`theme.ts`）。
建好后 `ln -s ../../node_modules node_modules`，然后 `npx tsc --noEmit` 确认工具链通。

- [ ] **Step 2: 算出基线帧号**

每支视频取 6 帧，覆盖开头、中段、结尾：

```bash
node -e '
const vids = [
  ["PiDurable", "./src/timing.json"],
  ["PythonRoadmap", "./src/timing.python.json"],
  ["ChickenRabbit", "./src/timing.math.json"],
];
for (const [id, path] of vids) {
  const t = require(path);
  const n = t.totalFrames;
  const frames = [1, 0.17, 0.34, 0.5, 0.7, 0.93].map((r) => Math.floor(n * r) || 1);
  frames[0] = 1;
  console.log(id, frames.join(" "));
}
' | tee out/baseline-frames.txt
```

预期：三行，每行一个 composition id 加六个帧号。

- [ ] **Step 3: 渲出 18 张基线图**

走终端面板。对上一步每行的 id 和帧号：

```bash
mkdir -p out/base
while read -r id f1 f2 f3 f4 f5 f6; do
  for f in $f1 $f2 $f3 $f4 $f5 $f6; do
    npx remotion still src/index.ts $id out/base/$id-$f.png --frame=$f > /dev/null 2>&1 || echo "FAILED $id $f"
  done
done < out/baseline-frames.txt
echo BASE_DONE
ls out/base | wc -l
```

预期：`BASE_DONE`，`18`，无 `FAILED`。

- [ ] **Step 4: 存下基线 md5**

```bash
md5 -r out/base/*.png | sed 's|out/base/||' | sort > out/baseline.md5
wc -l < out/baseline.md5
```

预期：`18`。**这个文件是整个改造的判决依据，不要删。**
（`out/` 在 `.gitignore` 里，不会被提交 —— 它只需要活到 Task 7。）

- [ ] **Step 5: 无需提交**

基线是产物不是源码。继续。

---

## Task 2: `videos.json`

**Files:**
- Create: `videos.json`

- [ ] **Step 1: 写 `videos.json`**

`title` 三个值必须与现有 composition id 一字不差。`audio` 是 **public 相对**路径。

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

- [ ] **Step 2: 确认每条路径都真实存在**

```bash
node -e '
const m = require("./videos.json");
const fs = require("fs");
for (const [key, v] of Object.entries(m)) {
  for (const p of [v.narration, v.timing, "public/" + v.audio]) {
    if (!fs.existsSync(p)) throw new Error(key + ": missing " + p);
  }
  const wavs = fs.readdirSync("public/" + v.audio).filter((f) => f.endsWith(".wav")).length;
  console.log(key, "->", v.title, "|", wavs, "wav");
}
console.log("OK");
'
```

预期：
```
pi-durable -> PiDurable | 106 wav
python -> PythonRoadmap | 92 wav
math -> ChickenRabbit | 40 wav
OK
```

- [ ] **Step 3: Commit**

```bash
git add videos.json
git commit -F - <<'EOF'
feat: add a manifest of the project's videos

The TTS script and the upcoming TS registry both need each video's
narration, timing and audio paths, and one is plain JS while the other is
TypeScript, so the paths live in JSON that both can read.

pi-durable keeps its legacy bare filenames as an explicit exception:
renaming them would mean moving 106 tracked wavs for cosmetics.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 3: 共享渲染器 `Explainer.tsx`

**Files:**
- Create: `src/components/Explainer.tsx`

- [ ] **Step 1: 写 `src/components/Explainer.tsx`**

骨架照抄现有三份的共同部分。注意 `makeExplainer` 返回的组件必须**稳定**
（每支视频只调用一次，结果存起来），不能在渲染时现造。

```tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import type { SceneTiming, Timing } from "../types";
import { Stage } from "./Stage";

export type SceneBody = React.FC<{ scene: SceneTiming }>;
export type SceneBodies = Readonly<Record<string, SceneBody>>;

/**
 * Builds one video's composition component. Every scene sits at the absolute
 * frame its narration starts, so the audio timeline in its timing JSON is the
 * only source of pacing: regenerating the voice-over re-cuts the whole video.
 *
 * Call this once per video and keep the result — returning a fresh component
 * on every render would give Remotion a new component identity each frame.
 */
export const makeExplainer = (
	timing: Timing,
	brand: string,
	audioDir: string,
	bodies: SceneBodies,
): React.FC => {
	const Explainer: React.FC = () => {
		const { fps } = useVideoConfig();
		return (
			<AbsoluteFill style={{ background: COLORS.bgDeep }}>
				{timing.scenes.map((scene) => {
					const Body = bodies[scene.id];
					// defineVideo checks this at module load, so reaching here means the
					// registry and the timing went out of sync after that. Fail loudly:
					// returning null would take the scene's body, caption and narration
					// down together inside a still-"successful" render.
					if (Body === undefined) {
						throw new Error(`${brand}: no body registered for scene "${scene.id}"`);
					}
					return (
						<Sequence
							key={scene.id}
							from={scene.startFrame}
							durationInFrames={scene.durationInFrames}
							premountFor={fps}
						>
							<Stage scene={scene} brand={brand} audioDir={audioDir}>
								<Body scene={scene} />
							</Stage>
						</Sequence>
					);
				})}
			</AbsoluteFill>
		);
	};
	return Explainer;
};
```

- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS（还没人用它，只验类型）

- [ ] **Step 3: Commit**

```bash
git add src/components/Explainer.tsx
git commit -F - <<'EOF'
feat: extract the shared explainer skeleton

PiDurable, PythonRoadmap and ChickenRabbit each carried their own copy of
the same sixty lines, and the copies had already drifted in how they
handle a scene id with no component.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 4: registry `src/videos.ts`

**Files:**
- Create: `src/videos.ts`

- [ ] **Step 1: 写 `src/videos.ts`**

场景映射照抄本计划开头那张表，**不要凭记忆写**。

```ts
import manifest from "../videos.json";
import { makeExplainer, type SceneBodies } from "./components/Explainer";
import { S0Hook } from "./scenes/S0Hook";
import { S1Layers } from "./scenes/S1Layers";
import { S2Invariants } from "./scenes/S2Invariants";
import { S3Commit } from "./scenes/S3Commit";
import { S4Poison } from "./scenes/S4Poison";
import { S5States } from "./scenes/S5States";
import { S6Tasks } from "./scenes/S6Tasks";
import { S7Chord } from "./scenes/S7Chord";
import { S8Storage } from "./scenes/S8Storage";
import { S9Outro } from "./scenes/S9Outro";
import { M0Pose } from "./scenes-math/M0Pose";
import { M1Table } from "./scenes-math/M1Table";
import { M2Assume } from "./scenes-math/M2Assume";
import { M3Lift } from "./scenes-math/M3Lift";
import { M4Converge } from "./scenes-math/M4Converge";
import { M5Outro } from "./scenes-math/M5Outro";
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
import piTiming from "./timing.json";
import mathTiming from "./timing.math.json";
import pyTiming from "./timing.python.json";
import type { Timing } from "./types";

export type VideoDef = {
	readonly key: string;
	readonly title: string;
	readonly brand: string;
	readonly folder: string;
	readonly timing: Timing;
	readonly Component: React.FC;
};

/**
 * Registers one video, and checks the timing and the scene map against each
 * other at module load so a mismatch surfaces when Studio opens rather than
 * when playback reaches the broken scene.
 *
 * Both directions are checked on purpose: a renamed scene id leaves an
 * unrendered scene AND an orphaned component, and reporting only the first
 * would send you looking in the wrong place.
 */
const defineVideo = (
	key: keyof typeof manifest,
	timingJson: unknown,
	bodies: SceneBodies,
): VideoDef => {
	const entry = manifest[key];
	const timing = timingJson as Timing;
	const sceneIds = timing.scenes.map((scene) => scene.id);
	const bodyKeys = Object.keys(bodies);
	const missing = sceneIds.filter((id) => bodies[id] === undefined);
	const orphaned = bodyKeys.filter((id) => !sceneIds.includes(id));
	if (missing.length > 0 || orphaned.length > 0) {
		throw new Error(
			`videos.ts: "${key}" is out of sync with ${entry.timing}.` +
				(missing.length > 0 ? ` Scenes with no component: ${missing.join(", ")}.` : "") +
				(orphaned.length > 0 ? ` Components with no scene: ${orphaned.join(", ")}.` : "") +
				` Timing has: ${sceneIds.join(", ")}.`,
		);
	}
	return {
		key,
		title: entry.title,
		brand: entry.brand,
		folder: entry.folder,
		timing,
		Component: makeExplainer(timing, entry.brand, entry.audio, bodies),
	};
};

export const VIDEOS: readonly VideoDef[] = [
	defineVideo("pi-durable", piTiming, {
		s0: S0Hook,
		s1: S1Layers,
		s2: S2Invariants,
		s3: S3Commit,
		s4: S4Poison,
		s5: S5States,
		s6: S6Tasks,
		s7: S7Chord,
		s8: S8Storage,
		s9: S9Outro,
	}),
	defineVideo("python", pyTiming, {
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
	}),
	defineVideo("math", mathTiming, {
		s0: M0Pose,
		s1: M1Table,
		s2: M2Assume,
		s3: M3Lift,
		s4: M4Converge,
		s5: M5Outro,
	}),
];
```

- [ ] **Step 2: `npx tsc --noEmit`** — 预期 PASS

- [ ] **Step 3: 确认校验真的会触发（负向测试）**

把 `s0: M0Pose` 临时改成 `sX: M0Pose`，跑一次只加载 registry 的检查：

```bash
npx remotion compositions src/index.ts 2>&1 | tail -5
```

预期：**非零退出**，错误信息里同时出现 `Scenes with no component: s0` 和
`Components with no scene: sX`。

**改回 `s0: M0Pose`**，再跑一次，预期正常列出 composition 列表。

- [ ] **Step 4: Commit**

```bash
git add src/videos.ts
git commit -F - <<'EOF'
feat: register the three videos in one place

videos.json cannot hold static timing imports or component references, so
the registry adds those and checks them against each other at module load.
Both directions are checked: a renamed scene id leaves both an unrendered
scene and an orphaned component, and reporting only the first sends you
looking in the wrong place.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 5: `Root.tsx` 遍历 registry，删掉三个 composition 文件

**Files:**
- Modify: `src/Root.tsx`
- Delete: `src/PiDurable.tsx`、`src/PythonRoadmap.tsx`、`src/ChickenRabbit.tsx`

- [ ] **Step 1: 重写 `src/Root.tsx`**

fps 和宽高一律从 `video.timing` 读。`HelloWorld`/`Logo`/`Title` 原样保留。

```tsx
import "./index.css";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { VIDEOS, type VideoDef } from "./videos";

/** Videos grouped into the Studio sidebar folders they declare, in registry order. */
const byFolder = (): readonly (readonly [string, readonly VideoDef[]])[] => {
	const folders: string[] = [];
	for (const video of VIDEOS) {
		if (!folders.includes(video.folder)) folders.push(video.folder);
	}
	return folders.map(
		(folder) => [folder, VIDEOS.filter((video) => video.folder === folder)] as const,
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{byFolder().map(([folder, videos]) => (
				<Folder key={folder} name={folder}>
					{videos.map((video) => (
						<Composition
							key={video.title}
							id={video.title}
							component={video.Component}
							durationInFrames={video.timing.totalFrames}
							fps={video.timing.fps}
							width={video.timing.width}
							height={video.timing.height}
						/>
					))}
				</Folder>
			))}
			<Folder name="Elements">
				<Composition
					id="Logo"
					component={Logo}
					durationInFrames={150}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						logoColor1: "#91EAE4",
						logoColor2: "#86A8E7",
					}}
				/>
				<Composition
					id="Title"
					component={Title}
					durationInFrames={115}
					fps={30}
					width={1920}
					height={1080}
					defaultProps={{
						titleText: "Welcome to Remotion",
						titleColor: "#000000",
					}}
				/>
			</Folder>
			<Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: "Welcome to Remotion",
					titleColor: "#000000",
				}}
			/>
		</>
	);
};
```

- [ ] **Step 2: 删掉三个 composition 文件**

```bash
git rm src/PiDurable.tsx src/PythonRoadmap.tsx src/ChickenRabbit.tsx
```

- [ ] **Step 3: `npx tsc --noEmit`**

预期：PASS。`noUnusedLocals: true` 会抓出任何残留的死 import。
若报 `Cannot find module './PiDurable'`，说明还有别处在 import 它们 —— 查出来改掉。

- [ ] **Step 4: 确认三个 composition 都还在，且 fps/时长没变**

```bash
npx remotion compositions src/index.ts
```

预期：列出 `PiDurable`、`PythonRoadmap`、`ChickenRabbit`、`Logo`、`Title`、`HelloWorld`。
**三支视频的 fps 和帧数必须与改造前一致** —— 对照 timing JSON 里的 `fps` / `totalFrames` 核一遍。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -F - <<'EOF'
refactor: drive compositions from the registry

Root now walks VIDEOS and reads fps and dimensions from each video's
timing instead of hardcoding them. That removes a live inconsistency:
two of the three compositions were pinned at fps 30 in Root while the
third read it from timing, so a video at any other rate would have
rendered off-tempo for two of them.

The three per-video composition files are gone; their whole job was the
skeleton that now lives in makeExplainer.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 6: TTS 收视频 key；调色板搬家

**Files:**
- Modify: `scripts/tts.mjs`
- Create: `src/scenes-math/palette.ts`
- Modify: `src/theme.ts`
- Modify: `src/scenes-math/M0Pose.tsx` … `M5Outro.tsx`（6 个）

- [ ] **Step 1: `scripts/tts.mjs` 支持视频 key**

把现有解析位置参数那段（`const [narrationArg = …] = process.argv.slice(2);` 及其后面
三行路径赋值）替换成下面这段。三位置参数形式保留 —— 仓库里另一支视频的计划文档引用了它。

```js
// Either a key from videos.json — `node scripts/tts.mjs math` — or the three
// explicit paths. The key form is preferred; the positional form is kept
// because the python roadmap plan documents it.
const args = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(join(root, "videos.json"), "utf8"));
const known = Object.keys(manifest);

let narrationArg;
let timingArg;
let audioArg;

if (args.length === 1 && manifest[args[0]] !== undefined) {
	const entry = manifest[args[0]];
	narrationArg = entry.narration;
	timingArg = entry.timing;
	audioArg = join("public", entry.audio);
} else if (args.length === 3) {
	[narrationArg, timingArg, audioArg] = args;
} else {
	console.error(`Usage: node scripts/tts.mjs <video>        (one of: ${known.join(", ")})`);
	console.error("   or: node scripts/tts.mjs <narrationPath> <timingOutPath> <audioOutDir>");
	process.exit(1);
}
```

**保留**脚本里现有的路径安全防护（拒绝绝对路径、防止删到项目本身）—— 不要删掉它们。
若那些防护写在被替换的那段里面，把它们挪到这段之后，对 `narrationArg`/`timingArg`/`audioArg` 生效。

- [ ] **Step 2: 确认三种调用形式的行为**

```bash
node scripts/tts.mjs; echo "exit=$?"
```
预期：打印两行 usage，第一行含 `pi-durable, python, math`；`exit=1`。

```bash
node scripts/tts.mjs nosuchvideo; echo "exit=$?"
```
预期：同样的 usage，`exit=1`。**不能**把 `nosuchvideo` 当成路径去跑。

**不要**在这一步真的跑一次生成 —— 那会重算 wav，破坏 Task 1 的基线前提。
key 形式的真实验证放在 Task 7 之后（见该任务 Step 6）。

- [ ] **Step 3: 建 `src/scenes-math/palette.ts`**

把 `MATH_COLORS` 整块从 `src/theme.ts` 剪过来，内容一字不改：

```ts
/**
 * Warm palette for the maths explainer. Chickens and rabbits are told apart by
 * shape as well as hue, so the video still reads for colour-blind viewers.
 */
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

- [ ] **Step 4: 从 `src/theme.ts` 删掉 `MATH_COLORS`**

删掉那个导出连同它上面的注释块。`COLORS`、`FONT`、`MONO`、`W`/`H`/`PAD`、
`since`/`easeOut`/`easeInOut`/`clamp01` 全部保留不动。

- [ ] **Step 5: 改 6 个 math 场景的 import**

这 6 个文件目前从 `../theme` 取 `MATH_COLORS`。要把它从 theme 的 import 列表里摘掉，
再从 `./palette`（`M0Pose.tsx` 等在 `src/scenes-math/` 下）单独 import。

`src/scenes-math/components/Critters.tsx` 在下一层，它的 import 是 `../../theme`，
改成 `../palette`。

逐个文件处理，改完每个都确认 `MATH_COLORS` 不再出现在该文件的 `theme` import 里：

```bash
grep -n 'MATH_COLORS' src/scenes-math/*.tsx src/scenes-math/components/*.tsx | grep theme
```

预期：**无输出**。

- [ ] **Step 6: `npx tsc --noEmit`**

预期：PASS。`noUnusedLocals` 会抓出 theme import 里摘剩的空项。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -F - <<'EOF'
refactor: take a video key in the TTS script, move the maths palette

`node scripts/tts.mjs math` beats repeating three paths that have to
agree with videos.json. The positional form still works because the
python roadmap plan documents it.

MATH_COLORS moves next to the scenes that use it. theme.ts holds what
every video shares; a video wanting its own palette keeps it in its own
scene directory, which costs nothing and does not grow theme.ts once
there are ten videos.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 7: 逐帧等价判决

**这是整个改造唯一有意义的验收。** 前面每个任务 `tsc` 过只说明能编译。

**Files:** 无改动，纯验证。

- [ ] **Step 1: `npx tsc --noEmit`** — 预期 PASS

- [ ] **Step 2: 用 Task 1 的同一批帧号重渲**

走终端面板：

```bash
rm -rf out/after && mkdir -p out/after
while read -r id f1 f2 f3 f4 f5 f6; do
  for f in $f1 $f2 $f3 $f4 $f5 $f6; do
    npx remotion still src/index.ts $id out/after/$id-$f.png --frame=$f > /dev/null 2>&1 || echo "FAILED $id $f"
  done
done < out/baseline-frames.txt
echo AFTER_DONE
ls out/after | wc -l
```

预期：`AFTER_DONE`，`18`，无 `FAILED`。

- [ ] **Step 3: md5 比对 —— 必须逐一相同**

```bash
md5 -r out/after/*.png | sed 's|out/after/||' | sort > out/after.md5
diff out/baseline.md5 out/after.md5 && echo "IDENTICAL: 18/18 frames byte-for-byte"
```

预期：**`IDENTICAL: 18/18 frames byte-for-byte`**，diff 无输出。

**任何一帧不同就是回归，停下来查清楚再继续。** 常见原因：
- `videos.json` 的 `brand` 或 `audio` 写错了（画面右上角字样变了，或音频路径断了）
- `Root.tsx` 的 fps/宽高取错
- math 调色板搬家时改了某个色值

- [ ] **Step 4: 确认 composition 清单没变**

```bash
npx remotion compositions src/index.ts
```

预期：`PiDurable`、`PythonRoadmap`、`ChickenRabbit`、`Logo`、`Title`、`HelloWorld` 六个都在。

- [ ] **Step 5: 负向测试 —— 确认 registry 校验仍然有效**

把 `src/videos.ts` 里 `p12: P12Outro` 临时改成 `p99: P12Outro`：

```bash
npx remotion compositions src/index.ts 2>&1 | tail -4
```

预期：非零退出，信息里同时有 `Scenes with no component: p12` 和 `Components with no scene: p99`。

**改回 `p12: P12Outro`**，`npx tsc --noEmit` 确认恢复。

- [ ] **Step 6: 验证 TTS 的 key 形式真能跑通**

这会重新生成 math 的音频。**必须在 Step 3 的 md5 比对通过之后再做** —— 它会覆盖 wav 和 timing。

```bash
node scripts/tts.mjs math
git status --short src/timing.math.json public/audio-math
```

预期：生成 40 个 wav，总时长约 2m54s；`git status` **无输出**（`say` 是确定性的，
同样的旁白产出同样的字节）。若 timing 有 diff，说明 key 形式解析出的路径不对。

- [ ] **Step 7: 更新 spec 状态**

把 spec 开头的 `状态：已评审通过，待实现` 改成 `状态：已实现（2026-10-09）`。

- [ ] **Step 8: Commit**

```bash
git add docs/superpowers/specs/2026-10-09-video-registry-design.md
git commit -F - <<'EOF'
docs: mark the video registry as implemented

Verified by rendering six frames from each of the three videos before and
after the refactor: all 18 are byte-for-byte identical.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Task 8: 合并回主分支

**Files:** 无改动。

- [ ] **Step 1: 确认另一支在制视频的会话已收工**

```bash
git log --oneline -3 --format='%h %ad %s' --date=format:'%m-%d %H:%M' python-roadmap-video | cat
date '+%m-%d %H:%M'
```

本次**删除了 `src/PythonRoadmap.tsx`**。若那边在我开工后还改过它，合并会是实质冲突
（删除 vs 修改），需要人工判断 —— 届时停下来问，不要自己选一边。

- [ ] **Step 2: 把主分支合进本分支，在隔离环境里解冲突**

```bash
git merge python-roadmap-video --no-edit
```

若 `src/PythonRoadmap.tsx` 报 `deleted by us`：那边又改了它。**停下来问用户**。
若干净合并，继续。

- [ ] **Step 3: 合并后重新验证**

```bash
npx tsc --noEmit
```
预期 PASS。然后走终端面板重跑 Task 7 Step 2–3 的 18 帧 md5 比对，预期仍然 `IDENTICAL`。

- [ ] **Step 4: 退出 worktree 并快进**

用 `ExitWorktree`（`action: "keep"`）回到主 checkout，然后：

```bash
git merge --ff-only <本分支名>
git rev-parse --short python-roadmap-video <本分支名>
```

预期：两个 SHA 相同。

- [ ] **Step 5: 主 checkout 上终检**

```bash
npx tsc --noEmit
git status --short
```
预期：PASS；工作区干净。

走终端面板渲三支各一帧，确认都还活着：

```bash
npx remotion still src/index.ts PiDurable out/final-pi.png --frame=800 > /dev/null 2>&1; echo "pi=$?"
npx remotion still src/index.ts PythonRoadmap out/final-py.png --frame=300 > /dev/null 2>&1; echo "py=$?"
npx remotion still src/index.ts ChickenRabbit out/final-cr.png --frame=4300 > /dev/null 2>&1; echo "cr=$?"
```

预期：三个都是 `0`。

---

## 自检记录

对着 spec 逐节核过：

| spec 小节 | 对应任务 |
|---|---|
| `videos.json` 路径唯一真相 | Task 2（含每条路径的存在性校验） |
| `src/videos.ts` 加载时双向校验 | Task 4（Step 3 负向测试）、Task 7 Step 5 再验一次 |
| `Explainer.tsx` 共享渲染器 / 稳定组件引用 | Task 3（`makeExplainer` 每支视频只调一次，结果存进 `VideoDef.Component`） |
| `Root.tsx` 遍历 registry、fps 从 timing 读 | Task 5 |
| 删除三个 composition 文件 | Task 5 Step 2 |
| `scripts/tts.mjs` 收 key | Task 6 Step 1–2，Task 7 Step 6 真跑一次 |
| 调色板搬家 | Task 6 Step 3–5 |
| 验收：逐帧 md5 等价 | Task 1 出基线、Task 7 Step 2–3 判决、Task 8 Step 3 合并后再验 |
| 验收：负向测试 | Task 4 Step 3、Task 7 Step 5 |
| 风险：改造改变画面 | Task 1 在动代码**之前**出基线，这是整条链的前提 |
| 风险：与另一会话冲突 | Task 1 Step 1 隔离 worktree、Task 8 Step 1–2 显式处理删除 vs 修改 |
| 风险：title 写错 | Task 2 Step 1 注明必须一字不差，Task 5 Step 4 / Task 7 Step 4 用 `remotion compositions` 核 |
| 风险：es2022 API | 本计划代码只用 `Array.from`、`includes`、`filter`、索引访问 |
| 风险：组件引用不稳定 | Task 3 的注释写明了为什么不能在渲染时现造 |

命名一致性核对：`makeExplainer(timing, brand, audioDir, bodies)`（Task 3 定义，Task 4 调用，
四个参数顺序一致）、`SceneBodies`（Task 3 导出，Task 4 import）、`VideoDef` 的字段
`key`/`title`/`brand`/`folder`/`timing`/`Component`（Task 4 定义，Task 5 全部用到）、
`VIDEOS`（Task 4 导出，Task 5 import）、`videos.json` 的字段 `title`/`brand`/`folder`/
`narration`/`timing`/`audio`（Task 2 定义，Task 4 的 `defineVideo` 和 Task 6 的 tts.mjs 都按这些名字取）。

`audio` 的两种用法已对齐：`Stage` 的 `audioDir` 用 public 相对值（Task 4 传 `entry.audio`），
`tts.mjs` 前面拼 `public/`（Task 6 Step 1 的 `join("public", entry.audio)`）。
