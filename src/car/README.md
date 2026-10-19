# 汽车能量流动：Three.js 本地演示

在项目根目录运行 `npm run dev -- --port=3210`，然后打开：

http://localhost:3210/CarEnergyFlow

这支约 95 秒的中文讲解，以简化的单电机前驱纯电汽车为例，演示：整车拆解、动力电池、逆变器、电机与传动、再生制动、能量流总结。

- `CarScene.tsx`：Three.js 程序化模型、灯光、相机、投影标注和能量粒子。
- `CarEnergyFlow.tsx`：视频注册、讲解文字、二维能量流动图、字幕和音频时间轴。
- `timing.json`：根据实际 TTS 时长生成的时间轴。
- 根目录 `narration.car.json`：中文旁白脚本。
- 根目录 `public/audio-car/`：百炼北京 `qwen3-tts-flash / Ethan` 配音。

Three.js 模型由本项目的几何体生成，无外部模型或纹理依赖。所有运动由 Remotion 帧号驱动，无实时动画循环。粒子表示能量方向，并非电子轨迹；不展示真实功率、速度或效率测量值。回收能力受工况限制，不能回收全部动能，也不替代摩擦制动。

更新旁白后，仅处理这一支：

```sh
npm run tts:generate -- car-energy
npm run tts:generate -- car-energy --apply
```

内容参考：

- 美国能源部 AFDC，纯电汽车部件与工作原理：https://afdc.energy.gov/vehicles/how-do-all-electric-cars-work
- 美国能源部纯电汽车资料：https://www.fueleconomy.gov/feg/evtech.shtml

网页版通过 Remotion Player 在浏览器中播放三维动画和旁白，无需导出 MP4。运行 `npm run web:build` 构建，再用 Wrangler 发布 `web/dist` 到现有 `video-explainers` Pages 项目。

线上直达地址：https://video-explainers.pages.dev/?video=car-energy
