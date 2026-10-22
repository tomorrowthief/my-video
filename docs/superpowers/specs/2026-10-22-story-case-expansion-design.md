# Story Case Expansion Design

Date: 2026-10-22

## Goal

补充四类案例，让每个主要故事分类至少有一支可播放的视频，并接入在制的神经网络讲解器：

1. **成语故事**《守株待兔》——"小禾的成语故事"第二集，复用既有小禾形象与美术体系
2. **寓言故事**《狐假虎威》——新分类首支视频，全 SVG 原创 artwork
3. **历史典故·三国**《望梅止渴》——激活预留的 `three-kingdoms` 系列，注明取材《世说新语》
4. **技术讲解**《神经网络前向传播》——把已实现的 `NetworkExplainer` 注册进网站（无声、纯视觉，30 秒 × 5 章）

同时把在制未提交的《偷梦的妖精》（dream-thief，已在 `web/videos.ts` 与 `web/catalog.ts` 注册）连同其依赖一起提交。

## Pipeline（沿用既有流程）

每支有声视频：

1. 讲稿 `narration.<key>.json`（scenes → paragraphs，say/show 逐段）
2. `videos.json` 注册（bailian TTS：qwen3-tts-flash）
3. 目标 `timing.json` 先放 fps/width/height 桩文件
4. `npm run tts:generate -- <key>` 生成音频到 staging，校验后 `-- <key> --apply` 换入 `public/<audio-dir>/` 并写出最终 timing
5. 生成 `captions.json`（段落字幕，来自实测时间轴）
6. 场景组件（Remotion Sequence 按时间轴排布）
7. `Root.tsx`（Studio 侧）与 `web/videos.ts` + `web/catalog.ts`（网站侧）注册
8. 更新 `web/catalog.test.mjs` 的 published 列表与 README 分类表

配音：守株待兔、狐假虎威用 Cherry（小禾/儿童向）；望梅止渴用 Ethan（更沉稳）。

## 美术

- **守株待兔**：复用 `characters-v1.png` 精灵图（小禾/农夫）、`StoryArt` 的调色与
  `Character/SceneTitle/Bubble` 等原子。为此把 `StoryFrame` 参数化：新增
  `StoryMetaContext`（timing、captions、系列名、集数、音频目录、总场景数），默认值
  即第一集现状，现有 8 个场景文件零改动。
- **狐假虎威 / 望梅止渴**：各自独立的 story kit（src/fable、src/history），全 SVG
  绘制（狐狸、老虎、山林；曹操、行军队伍、梅林），不复用 PNG 素材。

## Catalog 变更

- `STORY_SERIES` 新增 `{ id: "hill-fables", label: "山林寓言", storyType: "fable" }`
- 新目录条目：`idiom-stump`（idiom/xiaohe-idioms）、`fable-fox`（fable/hill-fables）、
  `history-plum`（history/three-kingdoms）、`nn-forward`（tech）
- 望梅止渴的简介与讲稿注明"取材《世说新语》，文学记载而非正史"

## Keys 与文件布局

| key | 讲稿 | timing | 音频目录 | 组件目录 | 配音 |
| --- | --- | --- | --- | --- | --- |
| idiom-stump | narration.idiom-stump.json | src/idiom-stump/timing.json | audio-idiom-stump | src/idiom-stump | Cherry |
| fable-fox | narration.fable-fox.json | src/fable/timing.json | audio-fable-fox | src/fable | Cherry |
| history-plum | narration.history-plum.json | src/history/timing.json | audio-history-plum | src/history | Ethan |
| nn-forward | —（无声） | src/nn/network-timing.json | — | src/nn/NetworkExplainer.tsx | — |

`nn-forward` 的 timing 为手工编写的 5 章结构（每章 180 帧，共 900 帧 @30fps），
段落为空数组——网站章节列表照常工作。

## Captions 脚本

`scripts/idiom-captions.mjs` 改为接受 `--timing <path> --out <path>` 参数（默认保持
现有行为），三个新视频各自生成 captions。

## 验收

- `npm run lint`（eslint + tsc）通过
- `node --experimental-strip-types --test web/catalog.test.mjs` 通过（published 列表更新后）
- 每支新视频在 `npm run dev` Studio 中可播放、音频对齐
- `npm run build` + web 构建产物包含新音频目录

## 不做的事

- 不新增 car 系列集数（已有独立 plan）
- 不为神话传说分类编视频（本轮范围外）
- 不提交 `ann-demo/`、`artifacts/`、`outputs/` 本地实验目录
