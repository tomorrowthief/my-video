# Story Round 3: 草船借箭 / 蚕与螳螂 / 北风与太阳

Date: 2026-10-28

## Goal

补充三支有声故事视频，走完既有 8 步管线：

1. **历史典故·三国**《草船借箭》——「三国小故事」第二集，Ethan 配音，注明改编自《三国演义》（文学改编而非正史）
2. **寓言故事**《蚕与螳螂》——「山林寓言」第二集原创寓言，Cherry 配音，全 SVG 美术
3. **寓言故事（西方）**《北风与太阳》——新系列「伊索寓言」首集，Cherry 配音，激活西方故事来源

## Keys 与文件布局

| key | 讲稿 | timing | 音频目录 | 组件目录 | 配音 | 系列 / 集数 |
| --- | --- | --- | --- | --- | --- | --- |
| history-arrows | narration.history-arrows.json | src/history-arrows/timing.json | audio-history-arrows | src/history-arrows | Ethan | 三国小故事 · 第二集 |
| fable-silk | narration.fable-silk.json | src/fable-silk/timing.json | audio-fable-silk | src/fable-silk | Cherry | 山林寓言 · 第二集 |
| fable-wind | narration.fable-wind.json | src/fable-wind/timing.json | audio-fable-wind | src/fable-wind | Cherry | 伊索寓言 · 第一集 |

每支 8 个场景 × 2 段旁白。`videos.json` 的 folder：草船借箭沿用 `History`，两支寓言
沿用 `Fables`。目录名带系列前缀（`history-` / `fable-`）以区分同系列多集。

## Catalog 变更

- `STORY_SERIES` 新增 `{ id: "aesop-fables", label: "伊索寓言", storyType: "fable" }`
- 新条目：`history-arrows`（history/three-kingdoms）、`fable-silk`（fable/hill-fables）、
  `fable-wind`（fable/aesop-fables）
- `web/videos.ts` 追加三支，排在 `history-plum` 之后、`dream-thief` 之前——
  `idiom-seedling` 保持第一位，首页默认视频不变
- 草船借箭简介与讲稿注明「改编自《三国演义》」

## 美术

- **草船借箭**：`ArrowsArt.tsx` 自建江面、草船+稻草人、箭雨、大雾图层与诸葛亮（羽扇纶巾）；
  曹操复用 `src/history/HistoryArt.tsx` 的 `General`。框架沿用 `StoryFrame`/`StoryMetaContext`。
- **蚕与螳螂**：`SilkArt.tsx`——蚕（吐丝/结茧两态）、螳螂（大刀、扑空姿态）、桑枝、
  飘雪。
- **北风与太阳**：`WindArt.tsx`——北风（鼓腮云脸）、太阳、旅人（裹紧/解开两态）、
  山路与落叶。

## 验收

- `npm run lint` 通过
- `node --experimental-strip-types --test web/catalog.test.mjs`（published 列表更新后）通过
- 每支视频在 Studio 可播放、音频对齐；`remotion still` 抽帧核验画面

## 不做的事

- 不新增神话传说分类（仍在范围外）
- 不改动在制的 studio/server 目录
