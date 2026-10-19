# 小禾的成语故事 · 第一集《拔苗助长》

面向约 4—7 岁儿童的原创绘本动画，1920 × 1080、30 fps、约 100 秒。

## 本地观看

- Studio：`http://localhost:3210/SeedlingStory`，启动命令 `npm run dev -- --port=3210`。
- 网页目录：启动 `npm run web:dev` 后，打开 `http://localhost:3200/?video=idiom-seedling`。
- `Idioms/Scenes` 中的八个镜头也可以单独打开，含各自旁白和字幕。

线上观看：[拔苗助长](https://video-explainers.pages.dev/?video=idiom-seedling)。网页版通过 Remotion Player 播放动画和配音，无需导出 MP4。

## 内容与分镜

| 章节 | 画面与讲述 |
| --- | --- |
| 翻开故事书 | 小禾介绍主题，Three.js 故事书翻开，纸面长出立体小苗。 |
| 农夫的小苗 | 春日菜园里，农夫盼望小苗长高。 |
| 着急的农夫 | 才过一天，农夫就等不及了。 |
| 往上拔一拔 | 农夫弯腰拔苗，苗的位置升高，但叶片和茎没有因此长大。 |
| 你猜会怎样 | 并排观察原来的苗与被拔高的苗，提问后留 2.4 秒思考。 |
| 小苗低下了头 | 叶片下垂，剖面图展示拔松的根与土壤。 |
| 长大有自己的节奏 | 总结成语含义；健康小苗是照顾方法的示意，不是原先受损苗复活。 |
| 轮到你想一想 | 联系豆芽、学骑车和画画，让孩子说说自己的办法。 |

故事骨架参考《孟子·公孙丑上》的“揠苗助长”，使用常见说法“拔苗助长”作为片名。小禾、对白、绘本插画与分镜为本项目原创改编；未使用现成动画片角色。典故参考：[揠苗助长原文](https://www.gushiwen.cn/shiwenv.aspx?id=3e43768c1d5c)。

## 角色与资产

- 小禾：圆脸短发、鹅黄色上衣、苔绿色背带裤、叶片徽章、小书包；招手、思考、拿书三个姿势。
- 农夫：草帽、陶土红上衣、深蓝裤子、棕色布鞋；站立、弯腰拔苗、蹲下担心三个姿势。
- 画风：暖色纸张、水粉与彩铅质感、圆润轮廓。
- `public/idioms/characters-v1.png`：内置 `image_gen` 生成的透明人物图集；1536 × 1024，3 列 × 2 行。代码裁切复用，不改变人物服装与比例。
- `public/idioms/garden.png`：内置 `image_gen` 生成的田园背景。
- `image-prompts.json`：两份完整生成提示词与落盘位置。
- 小苗、根部剖面、水滴、太阳和时钟使用代码绘制，以便确定性地表达生长、拔高、下垂与时间变化。

Three.js 仅用于开场故事书与立体小苗；其他场景使用可复用绘本人物、背景与 SVG 动画。所有运动都由 Remotion 帧号决定。

## 配音和字幕

百炼北京 `qwen3-tts-flash / Cherry`，15 段中文配音。音频位于 `public/audio-idiom/`，`timing.json` 使用实际 WAV 时长生成。字幕按整段音频边界展示，不声称逐字对齐，没有另行调用 ASR。

修改根目录 `narration.idiom.json` 后依次执行：

```sh
npm run tts:generate -- idiom-seedling
npm run tts:generate -- idiom-seedling --apply
node scripts/idiom-captions.mjs
```

网页构建命令为 `npm run web:build`，产物包含 M4A 和绘本图片，不包含 WAV 或 `.env`。
