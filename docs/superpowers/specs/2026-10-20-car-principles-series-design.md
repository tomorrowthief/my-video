# 汽车原理系列：四支 3D 讲解视频设计

日期：2026-10-20
状态：已与用户确认

## 目标

在现有《汽车能量流动》（`car-energy`）之后，新增四支约 60 秒的汽车原理
3D 讲解视频：四冲程发动机、刹车系统、空气动力学、转向与悬挂。全部使用
程序化 Three.js 几何体（无外部模型/纹理），运动由 Remotion 帧号驱动，
配音沿用百炼 `qwen3-tts-flash / Ethan`，与 `car-energy` 组成统一的
「汽车原理」系列。

## 非目标

- 不改动 `car-energy` 的内容、旁白与时间轴（只做不改行为的共享抽取）。
- 不引入 GLTF/外部模型、实时动画循环或真实物理仿真。
- 不新增网站的 Tab 或系列结构：四支都归入现有 `tech` Tab 的
  「科学与工程」分类。
- 不自动发布网站；`web:build` 与 Wrangler 发布仍由用户执行。

## 目录结构

```
src/cars/shared/     相机运镜、灯光、地面、车身/玻璃/车轮几何、
                     字幕与标题 overlay、组合注册壳
src/cars/engine/     EngineVideo.tsx + timing.json
src/cars/brakes/     BrakesVideo.tsx + timing.json
src/cars/aero/       AeroVideo.tsx + timing.json
src/cars/steering/   SteeringVideo.tsx + timing.json
根目录                narration.car-engine.json 等 4 份讲稿
public/              audio-engine/ 等 4 个音频目录
```

`src/car/` 重构为引用 `src/cars/shared/`，行为与画面不变（重构前后
Studio 截图对比验证）。

## 注册与网站接入

- `videos.json` 每支新增一条：folder `Automotive`、brand `汽车原理`、
  `tts: { provider: "bailian", model: "qwen3-tts-flash", voice: "Ethan" }`、
  各自的 narration / timing / audio 路径。
- `src/Root.tsx`：四支并入现有 `Automotive` Folder（沿用
  `CarCompositions` 的组织方式，扩展为系列注册壳）。
- `web/videos.ts`：四支追加进浏览器可播放列表。
- `web/catalog.ts`：`VIDEO_CATALOG` 各加一条 `tab: "tech"`、
  label `科学与工程`，深链 `?video=car-engine` 等。
- `web/catalog.test.mjs`：为新键补充分类与 URL 边界用例。

## 四支视频的场景大纲（每支 ~60 秒、4-5 场景）

### car-engine 四冲程发动机

1. 剖开一个气缸：发动机把燃烧变成旋转。
2. 进气 + 压缩：活塞下行吸气，上行把混合气压紧。
3. 做功：火花塞点火，活塞被推下，曲轴旋转输出动力。
4. 排气：活塞上行排出废气；曲轴转两圈 = 一个完整循环。
5. 多缸轮流点火，动力输出平稳。

### car-brakes 刹车系统

1. 从踩下踏板开始：脚上的力去哪了。
2. 杠杆放大 + 液压传力：主缸 → 油管 → 分泵（帕斯卡原理）。
3. 卡钳夹住刹车盘：摩擦把动能变成热。
4. 热量散走；ABS 一句话收尾（防抱死点刹）。

### car-aero 空气动力学

1. 车在空气里"游泳"：空气看不见但真实存在。
2. 风阻的两个来源：正面压强 + 车尾湍流吸力。
3. 流线造型如何降低阻力（贴附气流、平滑车尾）。
4. 尾翼 = 倒过来的机翼，把速度变成下压力。

### car-steering 转向与悬挂

1. 转动方向盘，前轮拐弯。
2. 阿克曼转向：内外轮转角不同，各走各的转弯圆。
3. 悬挂：弹簧 + 减震筒，车轮贴地、车身不颠。
4. 收尾：转得准 + 坐得稳。

## 3D 实现要点

全部程序化几何，运动由帧号推导，无实时循环：

- **engine**：半透明气缸壁剖面（clippingPlanes）+ 活塞/连杆/曲轴
  （cylinder + box 铰接）+ 进排气门 + 点火粒子。曲轴相位角是唯一动画
  自变量，四冲程位置全部由它推导，保证机械一致性。
- **brakes**：踏板杠杆摆动、油管粒子流（复用现有能量粒子模式）、
  刹车盘旋转 + 卡钳夹紧高亮 + 热量粒子上升。
- **aero**：复用 shared 车身几何；`Points` 流线粒子沿程序化流场
  （驻点、贴附流、尾部湍流）；尾翼为倒置翼型挤出体。
- **steering**：俯视相机，前轮转向角 + 内外轮各自转弯圆轨迹线；
  悬挂用螺旋线弹簧 + 减震筒伸缩，过减速带演示形变。

## 音频与时间轴流程

每支视频完成后按既有管线生成配音：

```sh
npm run tts:generate -- <video-key> --dry-run  # 核对讲稿、音色、段落数
npm run tts:generate -- <video-key>            # 生成、转码、校验
npm run tts:generate -- <video-key> --apply    # 替换正式音频与时间轴
```

场景时长由实际 TTS 音频时长决定，`--apply` 重建 timing.json。
缓存、备份、内容哈希命名等机制全部沿用现有脚本，不修改 TTS 脚本本身。

## 实现顺序

1. shared 抽取：`src/car/` 改为引用 `src/cars/shared/`，截图回归验证。
2. car-engine（四冲程，机械联动最复杂，先做打样）。
3. car-brakes。
4. car-aero。
5. car-steering。

每支完成后：Remotion Studio 人工预览、`npm run lint`（eslint + tsc）、
`node --experimental-strip-types --test web/catalog.test.mjs` 全绿。

## 风险与对策

- **讲稿与画面同步**：沿用「先场景骨架、后讲稿、再 TTS 落时间轴」的
  顺序；讲稿按场景分段，`--dry-run` 先核对段落数。
- **3D 复杂度失控**：每支视频的机械/流场各自独立实现，只有骨架共享；
  单文件超过约 500 行时按零件拆分文件。
- **shared 抽取回归**：`car-energy` 重构前后截图逐一对比，任何像素级
  差异都要回到重构本身解释。
