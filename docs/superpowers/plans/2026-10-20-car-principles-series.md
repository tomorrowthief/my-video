# 汽车原理系列（四支 3D 小视频）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增四支约 60 秒的汽车原理 3D 讲解视频（四冲程发动机、刹车系统、空气动力学、转向与悬挂），与现有 `car-energy` 共享抽出的 3D/2D 骨架，配音沿用百炼 `qwen3-tts-flash / Ethan`。

**Architecture:** 先把 `src/car/` 中可复用的 3D 骨架（相机、灯光、地面、车身/车轮几何、流动粒子）抽到 `src/cars/shared/three.tsx`、2D 版式壳抽到 `src/cars/shared/shell.tsx`，`car-energy` 重构为引用共享件且画面不变（用 `remotion still` 截图回归验证）。之后每支新视频按既有三件套模式（场景组件 + timing.json + narration.json + videos.json 注册）独立实现，接入 `web/` 目录与 catalog，最后走 TTS 管线生成配音并 `--apply` 落时间轴。

**Tech Stack:** Remotion 4、@remotion/three + three.js（程序化几何）、React 19、TypeScript、Vite（web）、百炼 Qwen-TTS（`scripts/tts-batch.mjs`，不改脚本本身）。

**Spec:** `docs/superpowers/specs/2026-10-20-car-principles-series-design.md`

**约定（全计划通用）:**

- 仓库根目录：`/Users/zhongling/mypro/my-video`（下文相对路径都基于它）。
- 代码缩进：`src/` 用 tab（与现有文件一致），`web/` 用 2 空格。提交前跑 `npx prettier --check <files>`，不符就 `npx prettier --write`。
- 每个 Task 结束必须 `npm run lint`（eslint + tsc）绿 + 提交一次 git，提交信息按仓库惯例 `feat: ...` / `refactor: ...`，结尾加 `Co-Authored-By: Claude Code <noreply@anthropic.com>`。
- 回归验证命令（重构 car-energy 时前后各跑一次，比较像素）：

```bash
mkdir -p out/regression
npx remotion still CarEnergyFlow out/regression/car-<frame>.png --frame=<frame>
```

取 frame = 60, 600, 1500, 2800 四帧。`npx remotion still` 每次全量渲染单帧，帧数与画面完全由代码决定，重构前后文件应逐字节一致（或用 `cmp` 比较；PNG 元数据不一致时用 `python3 -c` 对比像素）。

---

### Task 1: 抽取共享 3D 骨架 `src/cars/shared/three.tsx`

**Files:**
- Create: `src/cars/shared/three.tsx`
- Modify: `src/car/CarScene.tsx`

- [ ] **Step 1: 基准截图**

```bash
mkdir -p out/regression
for f in 60 600 1500 2800; do npx remotion still CarEnergyFlow out/regression/before-$f.png --frame=$f; done
```

Expected: 4 张 PNG 生成，无报错。

- [ ] **Step 2: 创建 `src/cars/shared/three.tsx`**

从 `src/car/CarScene.tsx` 原样搬运并泛化以下内容（代码主体逐字复制，只改标注的泛化点）：

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CatmullRomCurve3, ExtrudeGeometry, PerspectiveCamera, Shape, Vector3 } from "three";

/** 共享 3D 骨架：相机舞台、灯光地台、车身/车轮几何、沿线流动粒子。 */
export type Point = [number, number, number];

export const bodyGeometry = () => { /* CarScene.tsx:34-52 原样搬运 */ };
export const glassGeometry = () => { /* CarScene.tsx:54-62 原样搬运 */ };

export const Box = ({ position, size, color, emissive = "#000000", intensity = 0, opacity = 1 }) => {
  /* CarScene.tsx:80-108 原样搬运 */
};

/** 泛化点：regen 布尔换成 ringColor，默认 "#d0e1ed"。 */
export const Wheel = ({ x, z, angle, ringColor = "#d0e1ed" }: {
  x: number; z: number; angle: number; ringColor?: string;
}) => {
  /* CarScene.tsx:110-148 搬运；原 `regen && x > 0 ? REGEN_COLOR : "#d0e1ed"` 由调用方传入 ringColor */
};

/** CarScene.tsx:372-383 的灯 + 地台（ambientLight、两个 directionalLight、pointLight、地面圆、gridHelper）。 */
export const Rig = () => { /* 原样搬运，包成无 props 组件 */ };

/** CarScene.tsx:427-503 的车身组（body/glass/A/B 柱/前后灯），唯一 prop 是 explode。 */
export const CarBody = ({ explode }: { explode: number }) => { /* 原样搬运 */ };

/** CarScene.tsx:279-319 的 Flow（管道 + 沿线粒子），原样搬运。 */
export const Flow = ({ points, color, seconds, reverse, active }: {
  points: Point[]; color: string; seconds: number; reverse: boolean; active: boolean;
}) => { /* 原样搬运 */ };

/** 舞台壳：AbsoluteFill + ThreeCanvas + 投影标注 SVG（CarScene.tsx:568-647 的结构）。 */
export const CanvasStage = ({
  left, top, width, height, cameraPosition, lookAt, labels, labelsOpacity, labelColor, children,
}: {
  left: number; top: number; width: number; height: number;
  cameraPosition: Point; lookAt: Point;
  labels: { title: string; position: Point; offset: [number, number]; active: boolean }[];
  labelsOpacity: number; labelColor: string; children: React.ReactNode;
}) => {
  const camera = new PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(...cameraPosition);
  camera.lookAt(...lookAt);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return (
    <AbsoluteFill style={{ left, top, width, height }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 35, position: cameraPosition, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }} dpr={1}>
        {children}
      </ThreeCanvas>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: labelsOpacity }}>
        {labels.map((label) => {
          const p = new Vector3(...label.position).project(camera);
          const x = ((p.x + 1) * width) / 2;
          const y = ((1 - p.y) * height) / 2;
          const lx = x + label.offset[0];
          const ly = y + label.offset[1];
          return (
            <g key={label.title} opacity={label.active ? 1 : 0.5}>
              <polyline points={`${x},${y} ${lx},${ly} ${lx + (label.offset[0] > 0 ? 36 : -36)},${ly}`} fill="none" stroke={label.active ? labelColor : "#607b90"} strokeWidth={1.5} />
              <circle cx={x} cy={y} r={4} fill={label.active ? labelColor : "#8ba4b8"} />
              <text x={lx} y={ly - 12} fill={label.active ? "#e5f8fa" : "#90a9bc"} fontSize={23} fontFamily="PingFang SC, sans-serif" textAnchor={label.offset[0] > 0 ? "start" : "end"}>
                {label.title}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: 改写 `src/car/CarScene.tsx` 引用共享件**

删除已搬走的定义，改为 `import { Box, CanvasStage, CarBody, Flow, Rig, Wheel, bodyGeometry, glassGeometry, type Point } from "../cars/shared/three"`。保留 EV 专属件（`Battery`、`Inverter`、`Motor`、路径常量、`LABELS`、`CarModel`、`CarScene`、`cameraAt`、`CarPhase`、`DRIVE_COLOR`/`REGEN_COLOR`）。适配点：

- `CarScene` 末尾的 AbsoluteFill/ThreeCanvas/SVG 块改用 `CanvasStage`：`left={610} top={126} width={1240} height={700}`，`cameraPosition={cameraAt(frame / fps)}`，`lookAt={[0, 0.65, 0]}`，`labels` 由 `LABELS` 映射（`active` 判定逻辑保持 `phase === label.phase || phase === "regen" || phase === "recap"` 原样），`labelColor={color}`。
- `CarModel` 里的灯 + 地面 + grid 块替换为 `<Rig />`。
- `Wheel` 调用点传 `ringColor={regen && x > 0 ? REGEN_COLOR : "#d0e1ed"}`。

- [ ] **Step 4: 截图回归验证**

```bash
for f in 60 600 1500 2800; do npx remotion still CarEnergyFlow out/regression/after-$f.png --frame=$f; done
for f in 60 600 1500 2800; do cmp out/regression/before-$f.png out/regression/after-$f.png && echo "$f OK"; done
```

Expected: 4 帧全部一致。若 `cmp` 因 PNG 元数据失败，用像素对比：

```bash
python3 -c "
from PIL import Image
import sys
for f in ['60','600','1500','2800']:
    a = Image.open(f'out/regression/before-{f}.png').convert('RGBA')
    b = Image.open(f'out/regression/after-{f}.png').convert('RGBA')
    diff = sum(1 for pa, pb in zip(a.getdata(), b.getdata()) if pa != pb)
    print(f, diff)
"
```

Expected: 每帧 diff = 0。任何非 0 都回到 Step 3 修到为 0。

- [ ] **Step 5: lint + 提交**

```bash
npm run lint
git add src/cars/shared/three.tsx src/car/CarScene.tsx
git commit -m "refactor: extract the shared 3D kit from the car scene

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2: 抽取 2D 版式壳 `src/cars/shared/shell.tsx` 并集中注册

**Files:**
- Create: `src/cars/shared/shell.tsx`、`src/cars/index.tsx`
- Modify: `src/car/CarEnergyFlow.tsx`、`src/Root.tsx`

- [ ] **Step 1: 创建 `src/cars/shared/shell.tsx`**

把 `CarEnergyFlow.tsx:203-473` 中与具体视频无关的版式（背景、页眉、进度点、场景标题块、字幕、进度条、旁白 Audio Sequence、入场/出场淡入）搬进来，做成泛型壳：

```tsx
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Timing } from "../../types";

export const CAR_FONT = '"PingFang SC", "Microsoft YaHei", sans-serif';
export type SceneCopy = { title: string; explanation: string; tag: string };

export const CarVideoShell = <T extends string>({
  timing, audioDir, brand, heading, copy, accent, renderCanvas, panel, footerNote, canvasLabel,
}: {
  timing: Timing;
  audioDir: string;
  brand: string;
  heading: string;
  copy: Record<T, SceneCopy>;
  accent: (phase: T) => string;
  renderCanvas: (frame: number, phase: T, sceneIndex: number) => React.ReactNode;
  panel?: (phase: T, seconds: number) => React.ReactNode;
  footerNote: string;
  canvasLabel: string;
}) => {
  /* 主体 = CarEnergyFlow.tsx:226-473 的组件体，逐字搬运并做如下替换：
     - COPY[phase] → copy[phase]（SceneCopy 少了 focus 字段，focus 逻辑留给 panel 调用方）
     - "汽车原理 / 电驱系统" → brand；"能量，如何驱动一辆车？" → heading
     - <CarScene ... /> → {renderCanvas(frame, phase, sceneIndex)}
     - "三维结构 / 能量方向示意" → canvasLabel
     - <EnergyMap ... /> → {panel?.(phase, frame / fps)}
     - "单电机前驱示意 · 布局因车型而异" → footerNote
     - color 的取法 → accent(phase)（car-energy 传 (p) => p === "regen" ? REGEN_COLOR : DRIVE_COLOR）
     - <Narration /> 内 audioDir：audio-car → audioDir
     - explode 插值块（249-259 行）从壳中删除，由 car-energy 的 renderCanvas 闭包自己算 */
};
```

`Narration` 子组件一并搬入 shell（`staticFile(\`${audioDir}/${p.file}\`)`）。

- [ ] **Step 2: 改写 `src/car/CarEnergyFlow.tsx`**

保留 `COPY`、`EnergyMap`、`timing` 引入；组件体改为：

```tsx
export const CarEnergyFlow = () => (
  <CarVideoShell
    timing={timing}
    audioDir="audio-car"
    brand="汽车原理 / 电驱系统"
    heading="能量，如何驱动一辆车？"
    copy={COPY}
    accent={(p) => (p === "regen" ? REGEN_COLOR : DRIVE_COLOR)}
    renderCanvas={(frame, phase) => {
      // explode 插值原样搬过来（introEnd / recapStart 从 timing.scenes 取）
      return <CarScene frame={frame} phase={phase} explode={explode} />;
    }}
    panel={(phase, seconds) => <EnergyMap phase={phase} seconds={seconds} />}
    footerNote="单电机前驱示意 · 布局因车型而异"
    canvasLabel="三维结构 / 能量方向示意"
  />
);
```

`COPY` 里的 `focus` 字段保留在 EnergyMap 内部使用（`COPY[phase].focus` 继续从 car-energy 本地副本读）。`CarCompositions` 从本文件删除。

- [ ] **Step 3: 创建 `src/cars/index.tsx` 并改 `src/Root.tsx`**

```tsx
// src/cars/index.tsx
import { Composition, Folder } from "remotion";
import { CarEnergyFlow } from "../car/CarEnergyFlow";
import timing from "../car/timing.json";

/** 汽车系列全部 composition。新增视频在这里注册一行。 */
export const CarCompositions = () => (
  <Folder name="Automotive">
    <Composition id="CarEnergyFlow" component={CarEnergyFlow} width={1920} height={1080} fps={30} durationInFrames={timing.totalFrames} />
  </Folder>
);
```

`src/Root.tsx`: `import { CarCompositions } from "./car/CarEnergyFlow"` 改为 `from "./cars"`。

- [ ] **Step 4: 回归 + lint + 提交**

```bash
for f in 60 600 1500 2800; do npx remotion still CarEnergyFlow out/regression/task2-$f.png --frame=$f; cmp out/regression/after-$f.png out/regression/task2-$f.png && echo "$f OK"; done
npm run lint
node --experimental-strip-types --test web/catalog.test.mjs
git add src/cars/shared/shell.tsx src/cars/index.tsx src/car/CarEnergyFlow.tsx src/Root.tsx
git commit -m "refactor: move the car chrome into a shared shell and registry

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

Expected: 4 帧 OK、lint 绿、catalog 测试全过。

---

### Task 3: 四冲程发动机视频（画面 + 注册，不配音）

**Files:**
- Create: `narration.car-engine.json`、`src/cars/engine/EngineScene.tsx`、`src/cars/engine/EngineVideo.tsx`、`src/cars/engine/timing.json`
- Modify: `videos.json`、`src/cars/index.tsx`、`web/videos.ts`、`web/catalog.ts`、`web/catalog.test.mjs`

- [ ] **Step 1: 写讲稿 `narration.car-engine.json`**

```json
{
	"gapSeconds": 0.3,
	"leadInSeconds": 0.6,
	"tailSeconds": 1.1,
	"scenes": [
		{
			"id": "intro",
			"index": "01",
			"title": "打开引擎",
			"heading": "发动机，怎样把燃烧变成旋转？",
			"visual": "overview",
			"paragraphs": [
				{ "say": "发动机每一秒都在点火，却平稳地推动汽车前进，它是怎么做到的？", "show": "每一秒都在点火，为什么还这么平稳？" },
				{ "say": "剖开一个气缸，看燃烧怎样变成旋转。", "show": "剖开一个气缸，看燃烧变成旋转" }
			]
		},
		{
			"id": "intake",
			"index": "02",
			"title": "进气与压缩",
			"heading": "先吸气，再压紧",
			"visual": "cutaway",
			"paragraphs": [
				{ "say": "活塞下行，气门打开，把空气和汽油吸进气缸。", "show": "活塞下行，吸入空气与汽油" },
				{ "say": "活塞上行，气门关闭，混合气被压得又小又密，为点火做好准备。", "show": "活塞上行，把混合气压紧" }
			]
		},
		{
			"id": "power",
			"index": "03",
			"title": "做功冲程",
			"heading": "点火，被推着走",
			"visual": "cutaway",
			"paragraphs": [
				{ "say": "火花塞点火，混合气瞬间燃烧膨胀，把活塞狠狠推下去。", "show": "点火燃烧，推下活塞" },
				{ "say": "连杆把活塞的直线运动，变成曲轴的旋转，动力就来自这一冲程。", "show": "直线运动，变成旋转" }
			]
		},
		{
			"id": "exhaust",
			"index": "04",
			"title": "排气冲程",
			"heading": "循环回到起点",
			"visual": "cutaway",
			"paragraphs": [
				{ "say": "活塞再次上行，排气门打开，把废气排出去。", "show": "活塞上行，排出废气" },
				{ "say": "曲轴转两圈，完成四个冲程，一个循环结束，下一个立刻开始。", "show": "曲轴转两圈，一个完整循环" }
			]
		},
		{
			"id": "multi",
			"index": "05",
			"title": "多缸协作",
			"heading": "轮流点火，平稳输出",
			"visual": "multi",
			"paragraphs": [
				{ "say": "单缸只有四分之一的时间在做功，所以发动机用多个气缸轮流点火。", "show": "多缸轮流点火" },
				{ "say": "做功互相衔接，动力连绵不断，这就是引擎平稳的秘诀。", "show": "做功衔接，动力平稳" }
			]
		}
	]
}
```

- [ ] **Step 2: `videos.json` 加条目（`car-energy` 条目之后）**

```json
"car-engine": {
	"title": "EngineFourStroke",
	"brand": "汽车原理",
	"folder": "Automotive",
	"narration": "narration.car-engine.json",
	"timing": "src/cars/engine/timing.json",
	"audio": "audio-engine",
	"tts": { "provider": "bailian", "model": "qwen3-tts-flash", "voice": "Ethan" }
},
```

- [ ] **Step 3: 生成种子 timing（TTS 前的预览时间轴，段落按 3.5s 估）**

```bash
node -e '
const fs = require("fs");
const n = JSON.parse(fs.readFileSync("narration.car-engine.json", "utf8"));
let total = 0;
const scenes = n.scenes.map((s) => {
  let cursor = Math.round(0.6 * 30);
  const paragraphs = s.paragraphs.map((p, i) => {
    const d = 105;
    const r = { index: i, file: "", text: p.show ?? p.say, startFrame: cursor, durationInFrames: d, durationSeconds: d / 30 };
    cursor += d + 9;
    return r;
  });
  const duration = cursor - 9 + 33;
  const r = { id: s.id, index: s.index, title: s.title, heading: s.heading, visual: s.visual, startFrame: total, durationInFrames: duration, durationSeconds: duration / 30, paragraphs };
  total += duration;
  return r;
});
fs.writeFileSync("src/cars/engine/timing.json", JSON.stringify({ fps: 30, width: 1920, height: 1080, provider: "bailian", model: "qwen3-tts-flash", voice: "Ethan", totalFrames: total, totalSeconds: total / 30, scenes }, null, 2) + "\n");
console.log("seed timing:", total, "frames");
'
```

Expected: `src/cars/engine/timing.json` 生成，`file` 为空串（shell 的 Narration 对空 `file` 不渲染 Audio，Studio 可无声预览画面）。

- [ ] **Step 4: 写 `src/cars/engine/EngineScene.tsx`**

```tsx
import { useMemo } from "react";
import { interpolate } from "remotion";
import { PerspectiveCamera, Vector3 } from "three";
import { Box, CanvasStage, type Point } from "../shared/three";

export type EnginePhase = "intro" | "intake" | "power" | "exhaust" | "multi";
export const FIRE_COLOR = "#ff8a4d";
const AIR_COLOR = "#57c7f0";
const EXHAUST_COLOR = "#9aa7b5";

const CRANK_R = 0.42; // 曲柄半径
const ROD_L = 1.3; // 连杆长度
const CYL_R = 0.44; // 气缸半径
/** 曲轴角 θ → 活塞销高度（y），曲轴中心在 y=0。 */
const pistonY = (theta: number) =>
	CRANK_R * Math.cos(theta) + Math.sqrt(ROD_L ** 2 - (CRANK_R * Math.sin(theta)) ** 2);

const W = 1240;
const H = 700;

const cameraAt = (phase: EnginePhase, seconds: number): Point => {
	const orbit = 0.62 + Math.sin(seconds * 0.05) * 0.05;
	if (phase === "multi") return [Math.cos(orbit) * 6.4, 4.6, Math.sin(orbit) * 6.4];
	return [Math.cos(orbit) * 5.2, 2.9, Math.sin(orbit) * 5.2];
};

/** 气门：进气侧 0、排气侧 1。lift ∈ [0,1] 下压开度。 */
const Valve = ({ side, lift }: { side: -1 | 1; lift: number }) => (
	<group position={[side * 0.2, 2.62 - lift * 0.16, 0]}>
		<mesh>
			<cylinderGeometry args={[0.03, 0.03, 0.34, 10]} />
			<meshStandardMaterial color="#c3d3e0" metalness={0.85} roughness={0.3} />
		</mesh>
		<mesh position={[0, -0.2, 0]} rotation={[side > 0 ? Math.PI : 0, 0, 0]}>
			<coneGeometry args={[0.16, 0.09, 16]} />
			<meshStandardMaterial color="#aebfd0" metalness={0.8} roughness={0.35} />
		</mesh>
	</group>
);

/** 单缸剖视：曲轴 + 连杆 + 活塞 + 半透明缸壁 + 气门 + 火花塞。 */
const Cylinder = ({
	theta, intakeLift, exhaustLift, spark, wallOpacity = 0.22,
}: {
	theta: number; intakeLift: number; exhaustLift: number; spark: number; wallOpacity?: number;
}) => {
	const py = pistonY(theta);
	const pin = new Vector3(0, py, 0); // 活塞销
	const crankPin = new Vector3(CRANK_R * Math.sin(theta), -CRANK_R * Math.cos(theta), 0);
	const mid = pin.clone().add(crankPin).multiplyScalar(0.5);
	const rodLen = pin.distanceTo(crankPin);
	const rodAngle = Math.atan2(pin.x - crankPin.x, pin.y - crankPin.y);
	return (
		<group>
			{/* 缸壁（半透明，看得见内部） */}
			<mesh position={[0, 1.55, 0]}>
				<cylinderGeometry args={[CYL_R, CYL_R, 1.9, 40, 1, true]} />
				<meshStandardMaterial color="#7ba3bd" transparent opacity={wallOpacity} depthWrite={false} metalness={0.5} roughness={0.25} side={2} />
			</mesh>
			{/* 活塞 */}
			<mesh position={[0, py, 0]}>
				<cylinderGeometry args={[CYL_R * 0.94, CYL_R * 0.94, 0.3, 32]} />
				<meshStandardMaterial color="#d9e8f2" metalness={0.85} roughness={0.28} />
			</mesh>
			{/* 活塞环 */}
			{[-0.06, 0.02].map((dy) => (
				<mesh key={dy} position={[0, py + dy, 0]}>
					<torusGeometry args={[CYL_R * 0.95, 0.014, 8, 32]} />
					<meshStandardMaterial color="#5c6d7d" metalness={0.7} roughness={0.4} />
				</mesh>
			))}
			{/* 连杆 */}
			<mesh position={mid.toArray()} rotation={[0, 0, -rodAngle]}>
				<boxGeometry args={[0.13, rodLen, 0.1]} />
				<meshStandardMaterial color="#9fb5c6" metalness={0.7} roughness={0.35} />
			</mesh>
			{/* 曲轴：主轴 + 曲柄臂 + 曲柄销 */}
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[0.09, 0.09, 2.6, 16]} />
				<meshStandardMaterial color="#b8cbd8" metalness={0.85} roughness={0.3} />
			</mesh>
			<group rotation={[0, 0, -theta]}>
				<mesh position={[CRANK_R * Math.sin(0), -CRANK_R * Math.cos(0), 0]}>
					<cylinderGeometry args={[0.07, 0.07, 0.5, 12]} />
					<meshStandardMaterial color="#8fa7ba" metalness={0.8} roughness={0.3} />
				</mesh>
				{[-0.26, 0.26].map((z) => (
					<mesh key={z} position={[0, -CRANK_R / 2, z]}>
						<boxGeometry args={[0.3, CRANK_R * 2, 0.09]} />
						<meshStandardMaterial color="#7d94a8" metalness={0.75} roughness={0.35} />
					</mesh>
				))}
			</group>
			{/* 飞轮 */}
			<mesh position={[0, 0, -1.4]} rotation={[0, Math.PI / 2, 0]}>
				<cylinderGeometry args={[0.55, 0.55, 0.1, 40]} />
				<meshStandardMaterial color="#6f8a9e" metalness={0.8} roughness={0.35} />
			</mesh>
			{/* 缸盖 + 气门 + 火花塞 */}
			<mesh position={[0, 2.58, 0]}>
				<boxGeometry args={[CYL_R * 2.4, 0.22, CYL_R * 2.4]} />
				<meshStandardMaterial color="#54748c" metalness={0.6} roughness={0.4} />
			</mesh>
			<Valve side={-1} lift={intakeLift} />
			<Valve side={1} lift={exhaustLift} />
			<mesh position={[0, 2.78, 0]}>
				<cylinderGeometry args={[0.045, 0.045, 0.22, 10]} />
				<meshStandardMaterial color="#e8c98a" metalness={0.9} roughness={0.2} />
			</mesh>
			{spark > 0 && (
				<mesh position={[0, 2.42, 0]}>
					<sphereGeometry args={[0.3 * spark, 12, 12]} />
					<meshBasicMaterial color={FIRE_COLOR} transparent opacity={0.9 * spark} />
				</mesh>
			)}
		</group>
	);
};

/** 曲轴角规划：intro 连续慢转；intake 走 0→2π；power 2π→3π；exhaust 3π→4π；multi 连续快转。 */
export const EngineScene = ({
	frame, phase, sceneProgress,
}: {
	frame: number; phase: EnginePhase; sceneProgress: number;
}) => {
	const p = Math.max(0, Math.min(1, sceneProgress));
	const theta = useMemo(() => {
		if (phase === "intake") return p * Math.PI * 2;
		if (phase === "power") return Math.PI * 2 + p * Math.PI;
		if (phase === "exhaust") return Math.PI * 3 + p * Math.PI;
		return frame * 0.06;
	}, [phase, p, frame]);
	const cycle = theta % (Math.PI * 4);
	const intakeLift = phase === "intake" ? interpolate(Math.sin(Math.min(cycle, Math.PI) / Math.PI * Math.PI), [0, Math.PI / 2, Math.PI], [0, 1, 0]) : 0;
	const exhaustLift = phase === "exhaust" ? interpolate(Math.sin((cycle - Math.PI * 3)), [0, Math.PI / 2, Math.PI], [0, 1, 0]) : 0;
	const spark = phase === "power" ? interpolate(p, [0, 0.06, 0.3], [1, 1, 0]) : 0;
	return (
		<CanvasStage
			left={610} top={126} width={W} height={H}
			cameraPosition={cameraAt(phase, frame / 30)} lookAt={[0, 1.3, 0]}
			labels={[]} labelsOpacity={0} labelColor={FIRE_COLOR}
		>
			<ambientLight intensity={1.1} />
			<directionalLight position={[3, 8, 5]} intensity={3.5} color="#ffe8d8" />
			<directionalLight position={[-6, 3, -4]} intensity={2} color="#59c9c2" />
			{phase === "multi" ? (
				<group>
					{[-1.5, -0.5, 0.5, 1.5].map((x, i) => {
						const local = frame * 0.09 + i * Math.PI;
						const inPower = (local % (Math.PI * 4)) >= Math.PI * 2 && (local % (Math.PI * 4)) < Math.PI * 3;
						return (
							<group key={x} position={[x, 0, 0]} scale={0.62}>
								<Cylinder theta={local} intakeLift={0} exhaustLift={0} spark={inPower ? 0.8 : 0} />
								{inPower && (
									<mesh position={[0, 2.2, 0]}>
										<sphereGeometry args={[0.5, 12, 12]} />
										<meshBasicMaterial color={FIRE_COLOR} transparent opacity={0.25} />
									</mesh>
								)}
							</group>
						);
					})}
				</group>
			) : (
				<Cylinder theta={theta} intakeLift={intakeLift} exhaustLift={exhaustLift} spark={spark} wallOpacity={phase === "intro" ? 0.34 : 0.18} />
			)}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
				<circleGeometry args={[4.2, 64]} />
				<meshStandardMaterial color="#1d2b1f" roughness={0.8} />
			</mesh>
		</CanvasStage>
	);
};
```

注：渲染后进 Studio 目检，允许微调常量（缸径、相机距离、转速），但**不得改动活塞运动学公式**（`pistonY` 与四冲程 θ 区间是内容正确性的核心）。`side={2}` 是 `THREE.DoubleSide` 的字面量；若 tsc 报类型错，改用 `import { DoubleSide } from "three"` 再 `side={DoubleSide}`。

- [ ] **Step 5: 写 `src/cars/engine/EngineVideo.tsx`**

```tsx
import { CarVideoShell } from "../shared/shell";
import { EngineScene, FIRE_COLOR, type EnginePhase } from "./EngineScene";
import timingData from "./timing.json";
import type { Timing } from "../../types";

const timing = timingData as Timing;
const COPY: Record<EnginePhase, { title: string; explanation: string; tag: string }> = {
	intro: {
		title: "四冲程发动机\n把燃烧变成旋转",
		explanation: "每一秒都在点火爆炸，\n输出却平稳绵密。秘密在一个循环里。",
		tag: "燃烧 → 旋转",
	},
	intake: {
		title: "进气与压缩\n先吸满，再压紧",
		explanation: "活塞下行吸气，上行压缩，\n混合气又小又密，一点就着。",
		tag: "吸入 → 压缩",
	},
	power: {
		title: "做功冲程\n动力来自这里",
		explanation: "火花点火，燃气膨胀推下活塞，\n连杆把直线变成曲轴的旋转。",
		tag: "膨胀 → 转矩",
	},
	exhaust: {
		title: "排气冲程\n循环回到起点",
		explanation: "废气排出，曲轴转了两圈，\n四个冲程刚好走完一循环。",
		tag: "曲轴两圈 = 一个循环",
	},
	multi: {
		title: "多缸协作\n轮流点火",
		explanation: "四缸相位错开，\n总有一个缸在做功，动力不断档。",
		tag: "错相 → 平稳",
	},
};

export const EngineFourStroke = () => (
	<CarVideoShell
		timing={timing}
		audioDir="audio-engine"
		brand="汽车原理 / 内燃机"
		heading="发动机，怎样把燃烧变成旋转？"
		copy={COPY}
		accent={() => FIRE_COLOR}
		renderCanvas={(frame, phase, sceneIndex) => {
			const scene = timing.scenes[sceneIndex];
			const local = frame - scene.startFrame;
			const progress = local / Math.max(1, scene.durationInFrames);
			return <EngineScene frame={local} phase={phase} sceneProgress={progress} />;
		}}
		footerNote="单缸与四缸示意 · 结构经简化"
		canvasLabel="三维剖视 / 运动示意"
	/>
);
```

`src/cars/index.tsx` 注册：

```tsx
import { EngineFourStroke } from "./engine/EngineVideo";
import engineTiming from "./engine/timing.json";
// Folder 内新增：
<Composition id="EngineFourStroke" component={EngineFourStroke} width={1920} height={1080} fps={30} durationInFrames={engineTiming.totalFrames} />
```

- [ ] **Step 6: 接入 web（三处）**

`web/videos.ts` 追加（模式照抄 `car-energy` 条目）：

```ts
import { EngineFourStroke } from "../src/cars/engine/EngineVideo";
import engineTiming from "../src/cars/engine/timing.json";
// VIDEOS 数组追加：
{
  key: "car-engine",
  title: manifest["car-engine"].title,
  brand: manifest["car-engine"].brand,
  folder: manifest["car-engine"].folder,
  timing: engineTiming,
  Component: EngineFourStroke,
},
```

`web/catalog.ts` 的 `VIDEO_CATALOG` 追加：

```ts
"car-engine": {
  title: "四冲程发动机",
  label: "科学与工程",
  tab: "tech",
  description: "剖开一个气缸，看进气、压缩、做功、排气四个冲程怎样把燃烧变成旋转。",
  symbol: "⟳",
},
```

`web/catalog.test.mjs`：`published` 数组加 `"car-engine"`；第 68 个测试里 tech 断言改为 `["pi-durable", "python", "car-energy", "car-engine"]`。

- [ ] **Step 7: 验证 + 提交**

```bash
npm run lint
node --experimental-strip-types --test web/catalog.test.mjs
npx remotion still EngineFourStroke out/regression/engine.png --frame=300
```

Studio 目检 `npm run dev` 打开 EngineFourStroke：活塞上下、气门开合与场景文案对应。确认后：

```bash
git add narration.car-engine.json videos.json src/cars/engine src/cars/index.tsx web/videos.ts web/catalog.ts web/catalog.test.mjs
git commit -m "feat: build the four-stroke engine explainer

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 4: 发动机配音（TTS 生成 + apply）

**Files:**
- Create: `public/audio-engine/`（占位目录，apply 交换需要它存在）
- Modify: `src/cars/engine/timing.json`、`public/audio-engine/*`（由脚本写入）

- [ ] **Step 1: 建占位目录并核对 dry-run**

```bash
mkdir -p public/audio-engine && touch public/audio-engine/.gitkeep
npm run tts:generate -- car-engine --dry-run
```

Expected 输出：`car-engine: Ethan, 10 clips`（5 场景 × 2 段）。段落数不对就回 Task 3 改讲稿。

- [ ] **Step 2: 真实生成**

```bash
npm run tts:generate -- car-engine
```

Expected：逐条打印 `[n/10] car-engine/... Ethan x.xx s`，结尾 `Validated car-engine: 10 clips, Ethan, ~60 s`（总时长在 55-70s 之间；超界就回讲稿增删一句话后重跑，已生成的段落走缓存不重复计费）。

- [ ] **Step 3: apply**

```bash
npm run tts:generate -- car-engine --apply
```

Expected：`Applied 1 videos. Original assets preserved in ...`。`src/cars/engine/timing.json` 被真实时长重建，`public/audio-engine/` 内是 m4a+wav。

- [ ] **Step 4: 验听验证 + 提交**

```bash
npx remotion still EngineFourStroke out/regression/engine-applied.png --frame=50
npm run lint
git add public/audio-engine src/cars/engine/timing.json
git commit -m "feat: ship the engine narration as AAC

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

Studio 里完整播放一遍：字幕与音频同步、末尾不截断。

---

### Task 5: 刹车系统视频（画面 + 注册）

**Files:**
- Create: `narration.car-brakes.json`、`src/cars/brakes/BrakesScene.tsx`、`src/cars/brakes/BrakesVideo.tsx`、`src/cars/brakes/timing.json`
- Modify: `videos.json`、`src/cars/index.tsx`、`web/videos.ts`、`web/catalog.ts`、`web/catalog.test.mjs`

- [ ] **Step 1: 讲稿 `narration.car-brakes.json`**

```json
{
	"gapSeconds": 0.3,
	"leadInSeconds": 0.6,
	"tailSeconds": 1.1,
	"scenes": [
		{
			"id": "intro",
			"index": "01",
			"title": "踩下踏板",
			"heading": "一脚刹车，力去了哪里？",
			"visual": "overview",
			"paragraphs": [
				{ "say": "车速一百公里，踩下踏板，几秒钟就稳稳停住。刹车是怎么做到的？", "show": "一脚刹车，怎样让车停住？" },
				{ "say": "从踏板到车轮，跟着这脚刹车走一遍。", "show": "从踏板到车轮走一遍" }
			]
		},
		{
			"id": "hydraulic",
			"index": "02",
			"title": "杠杆与液压",
			"heading": "把脚力放大",
			"visual": "hydraulic",
			"paragraphs": [
				{ "say": "踏板本身是杠杆，把脚力放大好几倍，推动主缸里的活塞。", "show": "踏板杠杆，放大脚力" },
				{ "say": "油管把压力原封不动地传到每个车轮，这就是帕斯卡原理。", "show": "液压把压力传到车轮" }
			]
		},
		{
			"id": "friction",
			"index": "03",
			"title": "摩擦生热",
			"heading": "动能变成了热",
			"visual": "friction",
			"paragraphs": [
				{ "say": "卡钳夹住随车轮旋转的刹车盘，摩擦力让车轮慢下来。", "show": "卡钳夹盘，摩擦减速" },
				{ "say": "车辆的动能并没有消失，而是变成了热，散进空气里。", "show": "动能 → 热" }
			]
		},
		{
			"id": "abs",
			"index": "04",
			"title": "防抱死",
			"heading": "点刹的智慧",
			"visual": "abs",
			"paragraphs": [
				{ "say": "刹得太死，车轮抱死就会打滑。ABS 快速点刹，让车轮保持转动。", "show": "ABS 点刹，车轮不抱死" },
				{ "say": "又快又稳。下次刹车时，你会想起这条从踏板到车轮的路径。", "show": "又快，又稳" }
			]
		}
	]
}
```

- [ ] **Step 2: `videos.json` 追加**

```json
"car-brakes": {
	"title": "BrakeSystem",
	"brand": "汽车原理",
	"folder": "Automotive",
	"narration": "narration.car-brakes.json",
	"timing": "src/cars/brakes/timing.json",
	"audio": "audio-brakes",
	"tts": { "provider": "bailian", "model": "qwen3-tts-flash", "voice": "Ethan" }
},
```

- [ ] **Step 3: 种子 timing（同 Task 3 Step 3，替换路径与文件名）**

```bash
node -e '同 Task 3 Step 3 的脚本，读 narration.car-brakes.json，写 src/cars/brakes/timing.json'
```

Expected: 4 场景 8 段种子时间轴。

- [ ] **Step 4: 写 `src/cars/brakes/BrakesScene.tsx`**

```tsx
import { interpolate } from "remotion";
import { Box, CanvasStage, Flow, type Point } from "../shared/three";

export type BrakePhase = "intro" | "hydraulic" | "friction" | "abs";
export const BRAKE_COLOR = "#ff6a5e";
const FLUID_COLOR = "#ffb86a";

const W = 1240;
const H = 700;

/** 制动压力随场景推进上升；abs 相位改成 6Hz 方波点刹。 */
const pressureAt = (phase: BrakePhase, p: number) => {
	const ramp = interpolate(p, [0.15, 0.55, 1], [0, 1, 0.85]);
	if (phase === "abs") return ramp * (Math.sin(p * 60) > 0 ? 1 : 0.25);
	if (phase === "intro") return 0;
	return ramp;
};

/** 踏板总成：绕支点转动的杠杆 + 推杆。 */
const Pedal = ({ pressure }: { pressure: number }) => {
	const tilt = pressure * 0.34;
	return (
		<group position={[-3.2, 1.6, 0]}>
			<group rotation={[0, 0, -tilt]}>
				<Box position={[0, -0.55, 0]} size={[0.12, 1.1, 0.16]} color="#3f586d" />
				<Box position={[0.1, -1.02, 0]} size={[0.24, 0.07, 0.4]} color="#22303d" />
				<Box position={[0.06, 0.04, 0]} size={[0.5, 0.08, 0.12]} color="#7d95a8" />
			</group>
			<Box position={[-0.06, 1.06, 0]} size={[0.1, 0.1, 0.1]} color="#8ba4b8" />
		</group>
	);
};

/** 主缸：活塞随压力左移。 */
const MasterCylinder = ({ pressure }: { pressure: number }) => (
	<group position={[-2.2, 1.7, 0]}>
		<Box position={[0, 0, 0]} size={[1.15, 0.42, 0.42]} color="#4a6b82" />
		<Box position={[-0.42 + pressure * 0.34, 0, 0]} size={[0.16, 0.34, 0.34]} color="#c9d9e6" emissive={FLUID_COLOR} intensity={pressure * 0.6} />
	</group>
);

/** 车轮特写：轮毂 + 刹车盘 + 卡钳 + 热粒子。 */
const BrakedWheel = ({
	pressure, wheelAngle, heat, seconds,
}: {
	pressure: number; wheelAngle: number; heat: number; seconds: number;
}) => (
	<group position={[1.6, 0.95, 0]} rotation={[0, 0, 0]}>
		{/* 刹车盘：随车轮转 */}
		<group rotation={[0, Math.PI / 2, 0]}>
			<mesh rotation={[0, wheelAngle, 0]}>
				<cylinderGeometry args={[1.05, 1.05, 0.09, 48]} />
				<meshStandardMaterial color="#8f9aa6" metalness={0.9} roughness={0.32} emissive={BRAKE_COLOR} emissiveIntensity={heat * 0.9} />
			</mesh>
			{/* 通风孔 */}
			{Array.from({ length: 12 }, (_, i) => (
				<mesh key={i} rotation={[0, wheelAngle + (i / 12) * Math.PI * 2, 0]} position={[Math.cos(0) * 0.78, 0, 0]}>
					<cylinderGeometry args={[0.05, 0.05, 0.11, 8]} />
					<meshStandardMaterial color="#3c4a56" />
				</mesh>
			))}
		</group>
		{/* 卡钳：夹紧发光 */}
		<group position={[0, 0.35, 1.12]}>
			<Box position={[0, 0.3, 0]} size={[0.5, 0.8, 0.3]} color="#c74a40" emissive={BRAKE_COLOR} intensity={pressure * 1.6} />
			<Box position={[0, -0.3, 0]} size={[0.5, 0.8, 0.3]} color="#c74a40" emissive={BRAKE_COLOR} intensity={pressure * 1.6} />
			{/* 摩擦片 */}
			<Box position={[0, 0.3, -0.18]} size={[0.34, 0.66, 0.08]} color="#2b2f36" emissive={BRAKE_COLOR} intensity={heat * 1.2} />
			<Box position={[0, -0.3, -0.18]} size={[0.34, 0.66, 0.08]} color="#2b2f36" emissive={BRAKE_COLOR} intensity={heat * 1.2} />
		</group>
		{/* 热粒子：从盘面向上飘散 */}
		{heat > 0.05 &&
			Array.from({ length: 14 }, (_, i) => {
				const t = (seconds * 0.5 + i / 14) % 1;
				return (
					<mesh key={i} position={[Math.sin(i * 2.7) * 0.5 + t * 0.3, 0.4 + t * 2.2, 1.1 + Math.cos(i * 1.9) * 0.4]}>
						<sphereGeometry args={[0.05 * (1 - t * 0.6), 8, 8]} />
						<meshBasicMaterial color={BRAKE_COLOR} transparent opacity={heat * (1 - t) * 0.85} />
					</mesh>
				);
			})}
	</group>
);

const LINE: Point[] = [
	[-1.62, 1.7, 0],
	[-1.0, 1.7, 0.2],
	[0.1, 1.5, 0.5],
	[1.1, 1.15, 0.8],
	[1.6, 1.0, 1.0],
];

export const BrakesScene = ({
	frame, phase, sceneProgress, wheelSpeed,
}: {
	frame: number; phase: BrakePhase; sceneProgress: number; wheelSpeed: number;
}) => {
	const pressure = pressureAt(phase, sceneProgress);
	const seconds = frame / 30;
	const heat = phase === "friction" || phase === "abs" ? Math.min(1, sceneProgress * 1.4) : 0;
	const wheelAngle = -seconds * wheelSpeed;
	return (
		<CanvasStage
			left={610} top={126} width={W} height={H}
			cameraPosition={[Math.cos(0.62) * 7.4, 3.4, Math.sin(0.62) * 7.4]} lookAt={[-0.4, 1.3, 0]}
			labels={[]} labelsOpacity={0} labelColor={BRAKE_COLOR}
		>
			<ambientLight intensity={1.1} />
			<directionalLight position={[3, 8, 5]} intensity={3.5} color="#ffd8d0" />
			<directionalLight position={[-6, 3, -4]} intensity={2} color="#59c9c2" />
			<Pedal pressure={pressure} />
			<MasterCylinder pressure={pressure} />
			<Flow points={LINE} color={FLUID_COLOR} seconds={seconds} reverse={false} active={pressure > 0.05} />
			<BrakedWheel pressure={pressure} wheelAngle={wheelAngle} heat={heat} seconds={seconds} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, -0.1, 0]}>
				<circleGeometry args={[4.6, 64]} />
				<meshStandardMaterial color="#1c1a20" roughness={0.8} />
			</mesh>
		</CanvasStage>
	);
};
```

`wheelSpeed` 由 Video 层算：intro 恒速 4.0；hydraulic 4.0；friction 随 pressure 从 4 衰减到 0.5；abs 3.5 → 1.5（永不归零）。

- [ ] **Step 5: 写 `src/cars/brakes/BrakesVideo.tsx`**

结构完全同 Task 3 Step 5 的 `EngineVideo.tsx`：`COPY` 四条（标题/解释/标签按讲稿对应写：`踩下踏板 / 力去了哪里`、`杠杆与液压 / 脚力 × 数倍`、`摩擦生热 / 动能 → 热`、`防抱死 / 点刹不抱死`），`accent={() => BRAKE_COLOR}`，`brand="汽车原理 / 制动系统"`，`heading="一脚刹车，力去了哪里？"`，`footerNote="盘式制动示意 · 实车另有鼓式结构"`，`canvasLabel="三维结构 / 液压与摩擦示意"`，`renderCanvas` 里算 `wheelSpeed` 传给 `BrakesScene`。`src/cars/index.tsx` 注册 `BrakeSystem`。`web/videos.ts`、`web/catalog.ts`（title `刹车系统`，description `从踩下踏板到卡钳夹盘，看脚下的力怎样被放大，动能又变成了什么。`，symbol `⊘`）、`web/catalog.test.mjs`（published 加 `"car-brakes"`，tech 断言加到末尾）三处照 Task 3 Step 6 模式接入。

- [ ] **Step 6: 验证 + 提交**

```bash
npm run lint && node --experimental-strip-types --test web/catalog.test.mjs
npx remotion still BrakeSystem out/regression/brakes.png --frame=400
git add narration.car-brakes.json videos.json src/cars/brakes src/cars/index.tsx web/videos.ts web/catalog.ts web/catalog.test.mjs
git commit -m "feat: build the brake system explainer

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

Studio 目检：踏板下压、油管粒子流向车轮、卡钳随压力发红、盘减速。

---

### Task 6: 刹车配音（同 Task 4 流程，key 换 `car-brakes`）

- [ ] `mkdir -p public/audio-brakes && touch public/audio-brakes/.gitkeep`
- [ ] `npm run tts:generate -- car-brakes --dry-run`，Expected `car-brakes: Ethan, 8 clips`
- [ ] `npm run tts:generate -- car-brakes`，Expected 总时长 50-65s
- [ ] `npm run tts:generate -- car-brakes --apply`
- [ ] `git add public/audio-brakes src/cars/brakes/timing.json && git commit -m "feat: ship the brake narration as AAC ..."`

---

### Task 7: 空气动力学视频（画面 + 注册）

**Files:**
- Create: `narration.car-aero.json`、`src/cars/aero/AeroScene.tsx`、`src/cars/aero/AeroVideo.tsx`、`src/cars/aero/timing.json`
- Modify: `videos.json`、`src/cars/index.tsx`、`web/videos.ts`、`web/catalog.ts`、`web/catalog.test.mjs`

- [ ] **Step 1: 讲稿 `narration.car-aero.json`**

```json
{
	"gapSeconds": 0.3,
	"leadInSeconds": 0.6,
	"tailSeconds": 1.1,
	"scenes": [
		{
			"id": "intro",
			"index": "01",
			"title": "在空气里游泳",
			"heading": "看不见的阻力",
			"visual": "overview",
			"paragraphs": [
				{ "say": "空气看不见摸不着，但车速上了三百米，它就是最硬的墙。", "show": "空气看不见，却是墙" },
				{ "say": "把风点亮，看看车是怎样在空气里游动的。", "show": "把风点亮，看车怎么游" }
			]
		},
		{
			"id": "drag",
			"index": "02",
			"title": "阻力从哪来",
			"heading": "前推，后吸",
			"visual": "drag",
			"paragraphs": [
				{ "say": "车头把空气猛地推开，正面顶着高压，这是第一种阻力。", "show": "车头：高压推着车" },
				{ "say": "车尾来不及合拢，留下低压的湍流，像一只手在后面拽住车。", "show": "车尾：低压拽着车" }
			]
		},
		{
			"id": "shape",
			"index": "03",
			"title": "流线造型",
			"heading": "让风贴着走",
			"visual": "shape",
			"paragraphs": [
				{ "say": "圆润的车头减少正面冲击，平滑的车尾让气流顺势合拢。", "show": "圆头圆尾，风更顺" },
				{ "say": "流线越顺，风阻越小，同样一箱油，跑得更远。", "show": "风阻小，跑得远" }
			]
		},
		{
			"id": "wing",
			"index": "04",
			"title": "尾翼与下压力",
			"heading": "倒过来的机翼",
			"visual": "wing",
			"paragraphs": [
				{ "say": "尾翼的剖面和机翼相反，气流一过，就把车往地上压。", "show": "反剖面：往下压" },
				{ "say": "速度越快压得越紧，高速过弯就更稳。", "show": "速度越快，压得越紧" }
			]
		}
	]
}
```

- [ ] **Step 2: `videos.json` 追加（title `AeroDynamics`，timing `src/cars/aero/timing.json`，audio `audio-aero`，tts 同前）。**
- [ ] **Step 3: 种子 timing（同前，4 场景 8 段）。**

- [ ] **Step 4: 写 `src/cars/aero/AeroScene.tsx`**

核心：复用 `CarBody`，加流线粒子场 + 尾翼。

```tsx
import { useMemo } from "react";
import { interpolate } from "remotion";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { Box, CanvasStage, CarBody, Rig, Wheel, type Point } from "../shared/three";

export type AeroPhase = "intro" | "drag" | "shape" | "wing";
export const AERO_COLOR = "#6fd3ff";
const WAKE_COLOR = "#ff8a4d";
const W = 1240;
const H = 700;

/** 一条流线粒子链：沿 x 从车前流向车后，绕过车身，进尾流区加湍流抖动。 */
const StreamLine = ({
	lane, phase, seconds, active,
}: {
	lane: { y: number; z: number; over: number }; phase: AeroPhase; seconds: number; active: boolean;
}) => {
	const beads = 7;
	return (
		<group>
			{Array.from({ length: beads }, (_, i) => {
				const t = (seconds * 0.28 + i / beads) % 1;
				const x = 5.2 - t * 10.4;
				// 车身区域（|x| < 2.8）：向上/侧绕流；车后（x < -2.8）进入尾流
				const overBody = Math.abs(x) < 2.8 ? 1 - Math.abs(x) / 2.8 : 0;
				const y = lane.y + overBody * (1.35 - lane.y) * lane.over;
				const wake = x < -2.8;
				const jitter = phase === "drag" && wake ? Math.sin(seconds * 9 + lane.y * 8) * 0.28 * Math.min(1, (-x - 2.8) / 2) : 0;
				const color = phase === "drag" && x > 1.8 ? AERO_COLOR : wake && phase === "drag" ? WAKE_COLOR : AERO_COLOR;
				const z = lane.z + overBody * Math.sign(lane.z || 1) * 0.55 + jitter * 0.3;
				return (
					<mesh key={i} position={[x, y + jitter, z]}>
						<sphereGeometry args={[0.055, 8, 8]} />
						<meshBasicMaterial color={color} transparent opacity={active ? 0.85 : 0.25} />
					</mesh>
				);
			})}
		</group>
	);
};

/** 倒置翼型：剖面下弯，气流过后产生下压力。 */
const Wing = ({ lift }: { lift: number }) => {
	const s = useMemo(() => {
		const shape = new (require("three").Shape)();
		shape.moveTo(-0.75, 0);
		shape.quadraticCurveTo(0, -0.3, 0.75, 0); // 下表面弯曲
		shape.quadraticCurveTo(0, -0.08, -0.75, 0); // 上表面较平
		return shape;
	}, []);
	// 用 extrude 的等价写法（不要 require，直接 import Shape）
	return (
		<group position={[-2.35, 1.35, 0]}>
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<extrudeGeometry args={[s, { depth: 1.6, bevelEnabled: false }]} />
				<meshStandardMaterial color="#20313f" metalness={0.6} roughness={0.3} />
			</mesh>
			{/* 下压力箭头：长度随速度 */}
			{[-0.5, 0.5].map((z) => (
				<group key={z} position={[0.1, -0.45, z]}>
					<mesh rotation={[0, 0, 0]}>
						<cylinderGeometry args={[0.03, 0.03, lift * 1.2, 8]} />
						<meshBasicMaterial color={WAKE_COLOR} />
					</mesh>
					<mesh position={[0, -lift * 0.6 - 0.08, 0]} rotation={[Math.PI, 0, 0]}>
						<coneGeometry args={[0.09, 0.2, 10]} />
						<meshBasicMaterial color={WAKE_COLOR} />
					</mesh>
				</group>
			))}
		</group>
	);
};

export const AeroScene = ({ frame, phase, sceneProgress }: { frame: number; phase: AeroPhase; sceneProgress: number }) => {
	const seconds = frame / 30;
	const lanes = useMemo(
		() =>
			[
				{ y: 0.5, z: 0, over: 1 },
				{ y: 0.3, z: 0.5, over: 0.6 },
				{ y: 0.3, z: -0.5, over: 0.6 },
				{ y: 1.4, z: 0.3, over: 0.15 },
				{ y: 1.4, z: -0.3, over: 0.15 },
				{ y: 0.2, z: 1.1, over: 0 },
				{ y: 0.2, z: -1.1, over: 0 },
			] as const,
		[],
	);
	const showWing = phase === "wing" || phase === "intro";
	const lift = interpolate(sceneProgress, [0, 0.3, 1], [0.3, 1, 1]);
	return (
		<CanvasStage
			left={610} top={126} width={W} height={H}
			cameraPosition={[Math.cos(0.55 + Math.sin(seconds * 0.05) * 0.08) * 8.8, 4.2, Math.sin(0.55 + Math.sin(seconds * 0.05) * 0.08) * 8.8]}
			lookAt={[0, 0.9, 0]}
			labels={[]} labelsOpacity={0} labelColor={AERO_COLOR}
		>
			<Rig />
			<CarBody explode={0} />
			{[-1.69, 1.67].flatMap((x) => [-0.98, 0.98].map((z) => <Wheel key={`${x}-${z}`} x={x} z={z} angle={-seconds * 0.8} />))}
			{showWing && <Wing lift={phase === "wing" ? lift : 0.4} />}
			{lanes.map((lane, i) => (
				<StreamLine key={i} lane={lane} phase={phase} seconds={seconds} active />
			))}
			{/* 车头高压标记（drag 场景） */}
			{phase === "drag" && (
				<group position={[2.9, 0.7, 0]}>
					<mesh>
						<sphereGeometry args={[0.5 + Math.sin(seconds * 3) * 0.05, 16, 16]} />
						<meshBasicMaterial color={WAKE_COLOR} transparent opacity={0.3} />
					</mesh>
				</group>
			)}
		</CanvasStage>
	);
};
```

注：`Wing` 里的 `require` 写法是示意，实现时 `import { ExtrudeGeometry, Shape } from "three"` 并用 `new ExtrudeGeometry(...)` 包在 `useMemo` 里（参照 `src/car/CarScene.tsx:34-52` 的 `bodyGeometry` 写法）。目检时确认：intro/shape 全车蓝色顺流；drag 场景车头红球 + 尾流橙色抖动；wing 场景尾翼 + 红色下压箭头随时间变长。

- [ ] **Step 5: `src/cars/aero/AeroVideo.tsx` + 三处接入**

同 Task 3 Step 5/6 模式。`COPY` 四条：`在空气里游泳 / 看不见的墙`、`阻力两来源 / 前推后吸`、`流线造型 / 让风贴着走`、`尾翼下压力 / 倒过来的机翼`。`accent`：`drag` 场景返回 `WAKE_COLOR`，其余 `AERO_COLOR`。`brand="汽车原理 / 空气动力学"`，`heading="看不见的空气，怎样拖住一辆车？"`，`footerNote="流线为示意，非真实流场"`，`canvasLabel="三维流场示意"`。catalog：title `空气动力学`，description `把风点亮：看风阻从哪里来，流线造型和尾翼各在做什么。`，symbol `≋`。注册 id `AeroDynamics`。

- [ ] **Step 6: 验证 + 提交**

```bash
npm run lint && node --experimental-strip-types --test web/catalog.test.mjs
npx remotion still AeroDynamics out/regression/aero.png --frame=400
git add narration.car-aero.json videos.json src/cars/aero src/cars/index.tsx web/videos.ts web/catalog.ts web/catalog.test.mjs
git commit -m "feat: build the aerodynamics explainer

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 8: 空气动力学配音（同 Task 4 流程，key 换 `car-aero`，8 clips，占位目录 `public/audio-aero`）

- [ ] dry-run → generate（50-65s）→ apply → `git add public/audio-aero src/cars/aero/timing.json` → commit `feat: ship the aero narration as AAC`

---

### Task 9: 转向与悬挂视频（画面 + 注册）

**Files:**
- Create: `narration.car-steering.json`、`src/cars/steering/SteeringScene.tsx`、`src/cars/steering/SteeringVideo.tsx`、`src/cars/steering/timing.json`
- Modify: `videos.json`、`src/cars/index.tsx`、`web/videos.ts`、`web/catalog.ts`、`web/catalog.test.mjs`

- [ ] **Step 1: 讲稿 `narration.car-steering.json`**

```json
{
	"gapSeconds": 0.3,
	"leadInSeconds": 0.6,
	"tailSeconds": 1.1,
	"scenes": [
		{
			"id": "intro",
			"index": "01",
			"title": "转动方向盘",
			"heading": "方向盘与车轮",
			"visual": "top",
			"paragraphs": [
				{ "say": "轻轻一转方向盘，前轮就拐了弯。这中间发生了什么？", "show": "一转方向盘，前轮就拐弯" },
				{ "say": "从头顶往下看，转向系统怎样指挥四个车轮。", "show": "俯视一辆正在转弯的车" }
			]
		},
		{
			"id": "ackermann",
			"index": "02",
			"title": "阿克曼转向",
			"heading": "各走各的圆",
			"visual": "top",
			"paragraphs": [
				{ "say": "转弯时内侧车轮走的圆小，外侧的大，两者角度必须不同。", "show": "内圆小，外圆大" },
				{ "say": "阿克曼转向让内外前轮各转各的角度，轮胎不打架，转弯才顺滑。", "show": "各转各角，转弯顺滑" }
			]
		},
		{
			"id": "suspension",
			"index": "03",
			"title": "弹簧与减震",
			"heading": "稳与颠的平衡",
			"visual": "side",
			"paragraphs": [
				{ "say": "车轮贴住地面，车身保持平稳，靠的是弹簧加减震筒。", "show": "车轮贴地，车身平稳" },
				{ "say": "过减速带时，弹簧吸收冲击，减震筒把晃动摁住，一次就停。", "show": "吸一次震，晃一下就停" }
			]
		},
		{
			"id": "wrap",
			"index": "04",
			"title": "准与稳",
			"heading": "转向 × 悬挂",
			"visual": "top",
			"paragraphs": [
				{ "say": "转向决定车往哪走，悬挂决定坐着舒不舒服。", "show": "转向管方向，悬挂管舒适" },
				{ "say": "下次过弯，感受一下这套系统在脚下的默契配合。", "show": "下次过弯，感受它们" }
			]
		}
	]
}
```

- [ ] **Step 2: `videos.json` 追加（title `SteeringSuspension`，timing `src/cars/steering/timing.json`，audio `audio-steering`，tts 同前）。**
- [ ] **Step 3: 种子 timing（同前，4 场景 8 段）。**

- [ ] **Step 4: 写 `src/cars/steering/SteeringScene.tsx`**

```tsx
import { useMemo } from "react";
import { interpolate } from "remotion";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { Box, CanvasStage, type Point } from "../shared/three";

export type SteeringPhase = "intro" | "ackermann" | "suspension" | "wrap";
export const STEER_COLOR = "#7dd8ff";
const W = 1240;
const H = 700;
const WHEELBASE = 2.9; // 轴距（近似沿用车身几何的比例）

const topCamera: Point = [0.01, 11.5, 0.01];
const sideCamera: Point = [0.5, 2.6, 8.6];

/** 俯视：车身轮廓（压扁的车身几何）+ 四轮 + 转向角。 */
const TopCar = ({ steer }: { steer: number }) => (
	<group rotation={[Math.PI / 2, 0, Math.PI / 2]}>
		{/* 车身俯视轮廓：一块圆角长板 + 座舱 */}
		<Box position={[0, 0, 0.05]} size={[1.7, 4.9, 0.1]} color="#c8e0ed" />
		<Box position={[0, 0.2, 0.1]} size={[1.4, 2.3, 0.06]} color="#133d55" />
		{[-1.45, 1.45].flatMap((y) => [-0.95, 0.95].map((x) => (
			<group key={`${y}-${x}`} position={[x, y, 0.08]} rotation={[0, 0, y > 0 ? -steer : 0]}>
				<Box position={[0, 0, 0]} size={[0.32, 0.72, 0.14]} color="#151c25" />
			</group>
		)))}
	</group>
);

/** 转弯圆：以内侧后轴延长线为圆心的两段圆弧。 */
const TurningCircles = ({ steer, color }: { steer: number; color: string }) => {
	const inner = WHEELBASE / Math.tan(Math.max(0.12, steer));
	const outer = Math.hypot(inner, 1.9);
	const center = -inner - 0.95; // 圆心在后轴延长线上（x 负方向）
	return (
		<group rotation={[-Math.PI / 2, 0, 0]} position={[center, 0.02, 0]}>
			{[
				{ r: inner, c: color },
				{ r: outer, c: "#5d7a91" },
			].map((ring) => (
				<mesh key={ring.r} rotation={[0, 0, 0]}>
					<torusGeometry args={[ring.r, 0.03, 8, 64, Math.PI * 1.1]} />
					<meshBasicMaterial color={ring.c} transparent opacity={0.7} />
				</mesh>
			))}
		</group>
	);
};

/** 侧视悬挂：螺旋弹簧 + 减震筒 + 车身质量块，过减速带演示。 */
const SuspensionSide = ({ seconds, color }: { seconds: number; color: string }) => {
	const bumpX = 3.4 - (seconds * 2.4) % 7.5; // 减速带从右向左扫过（车静止、地动）
	const nearBump = Math.exp(-Math.abs(bumpX - 0.2) * 1.6);
	const wheelY = 0.43 + nearBump * 0.5; // 车轮被顶起
	const bodyY = 1.55 + nearBump * 0.12 - Math.sin(seconds * 7) * nearBump * 0.08; // 车身被滤掉大半
	const springLen = Math.max(0.35, bodyY - wheelY - 0.25);
	// 螺旋弹簧：随压缩变短变密
	const springCurve = useMemo(() => {
		const pts: Vector3[] = [];
		for (let i = 0; i <= 60; i++) {
			const t = i / 60;
			const a = t * Math.PI * 2 * 6;
			pts.push(new Vector3(0.22 * Math.cos(a), t * springLen, 0.22 * Math.sin(a)));
		}
		return new CatmullRomCurve3(pts);
	}, [springLen]);
	return (
		<group>
			{/* 地面 + 减速带 */}
			<Box position={[0, 0, 0]} size={[12, 0.08, 3]} color="#1d2b38" />
			<Box position={[bumpX, 0.16, 0]} size={[0.85, 0.3, 3]} color="#e3b34c" />
			{/* 车轮 */}
			<group position={[0.2, wheelY, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<mesh>
					<torusGeometry args={[0.42, 0.16, 12, 40]} />
					<meshStandardMaterial color="#151c25" roughness={0.85} />
				</mesh>
				<mesh>
					<cylinderGeometry args={[0.3, 0.3, 0.22, 32]} />
					<meshStandardMaterial color="#a6b8c9" metalness={0.8} roughness={0.28} />
				</mesh>
			</group>
			{/* 减震筒 */}
			<group position={[0.2, (wheelY + bodyY) / 2 + 0.05, 0]}>
				<Box position={[0, 0, 0]} size={[0.16, bodyY - wheelY - 0.3, 0.16]} color="#5c7186" metalness={0.7} roughness={0.3} />
			</group>
			{/* 弹簧 */}
			<mesh geometry={useMemo(() => new TubeGeometry(springCurve, 90, 0.035, 8, false), [springCurve])} position={[0.55, wheelY + 0.28, 0]}>
				<meshStandardMaterial color={color} metalness={0.75} roughness={0.3} emissive={color} emissiveIntensity={nearBump * 0.8} />
			</mesh>
			{/* 车身质量块 */}
			<Box position={[0, bodyY, 0]} size={[3.4, 0.7, 1.9]} color="#c8e0ed" />
			<Box position={[-0.4, bodyY + 0.38, 0]} size={[1.7, 0.09, 1.85]} color="#133d55" />
		</group>
	);
};

export const SteeringScene = ({
	frame, phase, sceneProgress,
}: {
	frame: number; phase: SteeringPhase; sceneProgress: number;
}) => {
	const seconds = frame / 30;
	const steer = interpolate(sceneProgress, [0.12, 0.5, 1], [0, 0.42, 0.42]);
	const top = phase !== "suspension";
	return (
		<CanvasStage
			left={610} top={126} width={W} height={H}
			cameraPosition={top ? topCamera : sideCamera}
			lookAt={top ? [0, 0, 0] : [0, 1.2, 0]}
			labels={[]} labelsOpacity={0} labelColor={STEER_COLOR}
		>
			<ambientLight intensity={1.2} />
			<directionalLight position={[4, 9, 5]} intensity={3.2} color="#d8ecff" />
			{top ? (
				<group>
					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
						<circleGeometry args={[7, 64]} />
						<meshStandardMaterial color="#172638" roughness={0.75} />
					</mesh>
					<TopCar steer={steer} />
					{phase === "ackermann" || phase === "wrap" ? <TurningCircles steer={steer} color={STEER_COLOR} /> : null}
				</group>
			) : (
				<SuspensionSide seconds={seconds} color={STEER_COLOR} />
			)}
		</CanvasStage>
	);
};
```

目检重点：俯视时前轮随 steer 偏转、内外两个转弯圆清晰；`suspension` 场景减速带扫过时车轮抬升明显、车身起伏小、弹簧明显压缩再回弹。注意俯视相机 `topCamera` 的 `[0.01, 11.5, 0.01]` 避免与 `[0,1,0]` 的 lookAt 共线奇异；`TopCar` 里 group 先绕 x 转再绕 z 转的坐标系转换需要试一下符号，目标是俯视时长边沿屏幕水平。

- [ ] **Step 5: `src/cars/steering/SteeringVideo.tsx` + 三处接入**

同前模式。`COPY`：`转动方向盘 / 前轮为什么拐弯`、`阿克曼转向 / 各走各的圆`、`弹簧与减震 / 颠与稳的平衡`、`准与稳 / 转向 × 悬挂`。`brand="汽车原理 / 转向与悬挂"`，`heading="打方向的车轮，为什么这么听话？"`，`footerNote="几何经简化 · 实车转向梯形更复杂"`，`canvasLabel="俯视几何 / 侧视演示"`。catalog：title `转向与悬挂`，description `俯视转弯的几何，再凑近看弹簧与减震筒怎样让车身稳住。`，symbol `∩`。注册 id `SteeringSuspension`。

- [ ] **Step 6: 验证 + 提交**

```bash
npm run lint && node --experimental-strip-types --test web/catalog.test.mjs
npx remotion still SteeringSuspension out/regression/steering.png --frame=400
git add narration.car-steering.json videos.json src/cars/steering src/cars/index.tsx web/videos.ts web/catalog.ts web/catalog.test.mjs
git commit -m "feat: build the steering and suspension explainer

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 10: 转向与悬挂配音（同 Task 4 流程，key 换 `car-steering`，8 clips，占位目录 `public/audio-steering`）

- [ ] dry-run → generate（50-65s）→ apply → `git add public/audio-steering src/cars/steering/timing.json` → commit `feat: ship the steering narration as AAC`

---

### Task 11: 收尾——README、全量验证、web 构建

**Files:**
- Modify: `README.md`、`src/car/README.md`（可选新增各视频小节）

- [ ] **Step 1: README 更新**

`README.md` 的分类表格「技术」一行补上四支新视频（`四冲程发动机、刹车系统、空气动力学、转向与悬挂`），深链列表追加：

```
- 四冲程发动机：`?video=car-engine`
- 刹车系统：`?video=car-brakes`
- 空气动力学：`?video=car-aero`
- 转向与悬挂：`?video=car-steering`
```

「批量生成和替换配音」一节的 `all` 说明更新为「目前包含 math、car-energy、idiom-seedling 及四支汽车原理视频」。`src/car/README.md` 末尾加一节指向 `src/cars/` 的四支新视频。

- [ ] **Step 2: 全量验证**

```bash
npm run lint
node --experimental-strip-types --test web/catalog.test.mjs
npm run web:build
ls web/dist/audio-engine web/dist/audio-brakes web/dist/audio-aero web/dist/audio-steering | head
```

Expected：lint 绿、测试全过、`web/dist` 里能找到四个新音频目录且只有 `.m4a`（vite 过滤器会剔除 `.wav`）。逐支 Studio 播放完整视频确认音画同步。

- [ ] **Step 3: 提交**

```bash
git add README.md src/car/README.md
git commit -m "docs: document the car principles series

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

（发布 `web/dist` 到 Cloudflare Pages 由用户自行执行 `npx wrangler pages deploy`，不在本计划内。）

---

## Self-Review 记录

- **Spec 覆盖**：四支视频（Task 3-10）、shared 抽取（Task 1-2）、注册/catalog/web 接入（每支视频 Step 5-6）、TTS 管线（Task 4/6/8/10）、README（Task 11）、回归验证（Task 1-2 截图对比）——spec 各节均有对应任务。
- **类型一致性**：`CanvasStage`/`CarVideoShell` 的 props 签名在 Task 1/2 定义、Task 3/5/7/9 使用一致；`EnginePhase` 等四组 Phase 类型与各自 COPY Record 的键一致。
- **已知风险**：3D 视觉细节（比例、相机角度）计划中的常量是第一稿，各视频的 Studio 目检步骤就是为此设的兜底；机械正确性（pistonY 运动学、Ackermann 半径公式、帕斯卡/ABS 表现）以代码为准不许目检时改掉。
