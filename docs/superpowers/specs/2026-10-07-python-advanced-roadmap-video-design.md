# Python 进阶路线图视频 · 设计文档

日期：2026-10-07
项目：`my-video`（Remotion 视频）
状态：已确认，待实现

## 1. 目标

做一条 15 分钟左右的讲解视频，讲清楚 **Python 进阶有哪些知识点、每个知识点怎么学**。

它不是教程本身，是**路线图 + 方法**：给观众一张四层能力地图，每层点名最该先碰的知识点，并且每个知识点都给出可验证的练习动作，而不是「多看书多练」。

## 2. 受众

会 Python 基础语法（变量、函数、类、列表推导），但没系统碰过装饰器、生成器、数据模型、asyncio 的人。

他们的问题不是「不会写」，而是**不知道下一步该学什么、学到什么程度算会了**。视频要回答的正是这个。

## 3. 硬约束与取舍

15 分钟覆盖四大方向，**每个方向只能给骨架和学法，给不了深度**。这是设计前提，不是缺陷。

由此决定：
- 每个知识点场景控制在 70 秒上下，只讲「是什么 / 为什么这么设计 / 怎么练」
- 深度内容留作后续系列（本管线复刻一集的边际成本很低，结构可复用）
- 宁可少讲一个知识点，也不把一个知识点塞成流水账

## 4. 内容结构

13 个场景，约 900 秒。

| # | id | 标题 | 覆盖知识点 | 「怎么练」落点 |
|---|---|---|---|---|
| 00 | p00 | 开场：能跑 ≠ 会用 | 钩子——一段「看起来对」但有坑的代码 | — |
| 01 | p01 | 路线图 + 学法总纲 | 四层能力地图；通用四步 | 定基线 |
| 02 | p02 | 数据模型：一切都是协议 | `__dunder__`、`len()` 为什么不是方法、`with`/`__enter__`、运算符重载 | 给自定义类实现 3 个协议 |
| 03 | p03 | 装饰器与闭包 | 闭包 → 装饰器 → 带参装饰器 → 类装饰器 → `functools.wraps`/`lru_cache` | 手写一个 `@retry` |
| 04 | p04 | 迭代器与生成器 | `yield` 把函数变状态机、惰性求值、生成器表达式、`itertools` | 用生成器读大文件 |
| 05 | p05 | 类型系统 | `typing`、`TypeVar` 泛型、`Protocol`、`mypy`/`pyright` | 给现有项目加类型并跑通检查 |
| 06 | p06 | GIL 的真相与并发选型 | GIL 到底是什么、CPU-bound vs IO-bound、线程/进程/协程怎么选 | 同一任务用三种方式跑并对比 |
| 07 | p07 | asyncio 心智模型 | 事件循环、`await` 的语义、`Task`/`gather`、阻塞调用的坑 | 把同步 IO 改写成并发 |
| 08 | p08 | 性能：先测量再优化 | `cProfile`/`timeit`/内存、优化顺序、常见手段 | 剖析一个真实脚本 |
| 09 | p09 | 项目结构与依赖管理 | src layout、`pyproject.toml`、`uv`/`poetry`、虚拟环境 | 把散装脚本改成包 |
| 10 | p10 | 测试与质量 | `pytest`、fixture、参数化、覆盖率、`ruff`/`mypy`、pre-commit、CI | 给核心函数补测试并接 CI |
| 11 | p11 | 三条路线选型 | Web（FastAPI/Django）、数据（pandas/polars）、AI/Agent，各自的进阶顺序 | 按目标选一条 |
| 12 | p12 | 收尾：8 周计划 | 把 10 个知识点场景排进 8 周，每周一个可验证产出 | 拿走计划 |

章节归属：

- **语言内核**：p02–p05（4 场景）
- **并发与性能**：p06–p08（3 场景）
- **工程化**：p09–p10（2 场景）
- **生态方向**：p11（1 场景）
- **框架**：p00、p01、p12

### 4.1 每个内容场景的统一节奏

约 70 秒 / 6–8 句旁白，固定三段：

1. **痛点**（2 句）——只会基础写法时会怎么写，问题出在哪
2. **机制**（3 句）——一个具体对比或代码片段，讲清「为什么这么设计」
3. **怎么练**（2 句）——给出可验证的动作，落点在画面右侧的「怎么练」面板

这个三段式是全片的节奏骨架，观众看到第 3 个场景就知道每段能拿到什么。

### 4.2 通用学法（p01 提出，p12 收束）

四步，全片反复引用：

1. 读官方文档的对应章节（不是教程，是 docs）
2. 写一个最小复现，跑通并**故意弄坏它**
3. 读一个真实库的源码里用它的地方
4. 在一个真实项目里用上，留下可验证的产物

## 5. 视觉设计

沿用现有房子风格：深色背景、`COLORS` 主题、`FONT`/`MONO` 双字体、`Stage` 提供背景/页眉/字幕条/进度条/音频。

每个大章节一个**专属母题**，章节内场景复用同一母题组件：

| 章节 | 母题 | 形态 |
|---|---|---|
| 语言内核 | 代码对比 | 左右两栏：基础写法 vs 进阶写法，差异行高亮 |
| 并发与性能 | 时间轴 | 横向时间轴，展示串行/线程/协程的执行块分布 |
| 工程化 | 目录树 | 左侧目录树，右侧对应配置文件片段 |
| 生态方向 | 选型矩阵 | 三列卡片，按目标打勾 |

所有知识点场景右侧固定一个「怎么练」面板（复用 `Panel` + `Bullets`），保证每个场景都有可执行出口。

新增组件（放 `src/scenes-py/` 内共用文件）：

- `CodeCompare.tsx` —— 双栏代码对比，带差异行高亮
- `Timeline.tsx` —— 并发执行时间轴
- `TreeCompare.tsx` —— 目录树 + 配置片段
- `PracticeBox.tsx` —— 右侧「怎么练」面板，统一版式

## 6. 技术设计

### 6.1 现有代码的参数化（向后兼容）

两处硬编码需要解开，**改动后 `PiDurable` 的渲染结果必须一字不变**：

- `src/components/Stage.tsx:97` —— `SceneHeader` 硬编码了 `pi-durable`。加可选 prop `brand?: string`，默认 `"pi-durable"`。
- `src/components/Stage.tsx:175` —— `Narration` 硬编码了 `staticFile(\`audio/${file}\`)`。加可选 prop `audioDir?: string`，默认 `"audio"`。

`Stage` 把这两个 prop 透传给子组件。

### 6.2 TTS 脚本参数化

`scripts/tts.mjs` 目前写死读 `narration.json`、写 `src/timing.json`、输出 `public/audio/`。

改为接受三个可选位置参数，缺省时行为与现在完全一致：

```
node scripts/tts.mjs [narrationPath] [timingOutPath] [audioOutDir]
```

### 6.3 新增文件

```
narration.python.json              脚本（场景 + 旁白）
src/timing.python.json             TTS 生成，勿手改
public/audio-py/*.wav              TTS 生成
src/scenes-py/P0Hook.tsx
src/scenes-py/P1Roadmap.tsx
src/scenes-py/P2DataModel.tsx
src/scenes-py/P3Decorators.tsx
src/scenes-py/P4Generators.tsx
src/scenes-py/P5Typing.tsx
src/scenes-py/P6Gil.tsx
src/scenes-py/P7Asyncio.tsx
src/scenes-py/P8Profiling.tsx
src/scenes-py/P9Structure.tsx
src/scenes-py/P10Testing.tsx
src/scenes-py/P11Ecosystem.tsx
src/scenes-py/P12Outro.tsx
src/scenes-py/components/CodeCompare.tsx
src/scenes-py/components/Timeline.tsx
src/scenes-py/components/TreeCompare.tsx
src/scenes-py/components/PracticeBox.tsx
src/PythonRoadmap.tsx              合成入口
```

`src/Root.tsx` 新增一个 `Composition id="PythonRoadmap"`，放在现有 `Explainer` Folder 里；`PiDurable` 原样保留。

### 6.4 数据流

与现有视频一致，`timing.json` 是唯一真相：

```
narration.python.json
  → node scripts/tts.mjs（macOS say + afconvert）
  → public/audio-py/*.wav + src/timing.python.json
  → PythonRoadmap.tsx 按 startFrame 摆放场景
  → Stage 按 paragraph.startFrame 挂音频、写字幕
```

改旁白 → 重跑 TTS → 整条视频自动重新剪辑。这是现有管线的核心优势，不改。

### 6.5 配音

`Tingting`，rate `183`，与现有视频一致。`gapSeconds` / `leadInSeconds` / `tailSeconds` 沿用现值（0.32 / 0.55 / 1.05）。

## 7. 非破坏性保证

现有 pi-durable 视频的全部产物保留：`narration.json`、`src/timing.json`、`public/audio/`、`src/scenes/`、`src/PiDurable.tsx` 均不修改。

`Stage.tsx` / `tts.mjs` / `Root.tsx` 的改动是**加参数、加条目**，不删不改语义。验收时要实测 `PiDurable` 仍能正常预览与渲染。

## 8. 验收标准

1. `npm run dev` 打开 Studio，`PythonRoadmap` 可完整预览，13 个场景画面与旁白对齐
2. `node scripts/tts.mjs narration.python.json src/timing.python.json public/audio-py` 可重复执行，时长稳定
3. 总时长落在 13–17 分钟
4. `npx remotion render PythonRoadmap out/python-roadmap.mp4` 能出片
5. `PiDurable` 仍可预览与渲染，画面与改动前一致
6. `npm run lint`（eslint + tsc）通过
7. 每个内容场景都有可见的「怎么练」面板，内容是可验证的动作

## 9. 风险

| 风险 | 应对 |
|---|---|
| 13 个场景塞四大方向，容易变流水账 | 三段式节奏硬约束；每个知识点只留 1 个核心机制，其余舍弃 |
| TTS 时长不可控，总时长可能超 17 分钟 | 先写旁白跑 TTS 拿时长，再按实际时长裁剪句子，而不是先画画面 |
| 中文字幕与代码混排易溢出 | 代码行控制在 42 字符内；字幕条宽度现有 `maxWidth: 1520` 已验证 |
| 参数化改动碰坏现有视频 | 可选 prop + 默认值；改完立刻渲染 PiDurable 抽帧对比 |

## 10. 明确的非目标

- 不做代码实战教学的完整课程（那是后续系列）
- 不讲 Python 基础语法
- 不做多语言版本
- 不改现有 pi-durable 视频的任何内容