# 《偷梦的妖精》第二版画面

生成方式：内置 image_gen 图像生成工具。八张独立场景图；后七张使用第一张卧室图作为人物身份、服装、房间和光线的参考。所有最终资产位于 `public/dream/v2/`，原始生成文件也保留在 Codex 的 generated_images 中。

## 共同提示词与约束

Use case: illustration-story. One 16:9 landscape cinematic frame per asset. Live-action photorealistic fantasy cinema, natural 35mm lens and physically convincing practical textures. A fictional East Asian girl age 7, natural child proportions, round face, dark straight shoulder-length bob hair with fringe, modest ivory long-sleeve cotton pajamas. A tiny friendly 25cm woodland fairy in a moss-green coat and curled hat with delicate translucent moth wings. Deep blue moonlight and amber practical lamps, reassuring bedtime mood. Main subjects inside central 75%; quiet lower 14% for subtitles. No text, lettering, logos, watermark, graphic borders, collage, flat illustration, or plastic doll appearance. Preserve the same girl, fairy, bedroom, stone cottage and castle identity across frames.

## 各场景提示词

- **bedroom.png**：Cozy stone-cottage attic bedroom; girl sleeping peacefully on her side, face visible on cream pillow, covered to chest by ivory knitted quilt. Tiny fairy hovers by the left arched window holding a glass bottle of golden dream light. Distant illuminated hilltop castle through the window. Honey-colored wood furniture, bedside lamp, soft shadows, tactile linen. Wide room shot, child middle-right.
- **castle.png**：Very wide exterior establishing panorama of the entire hilltop castle, all spires and base inside frame with breathing room, seen from across the lake. Aged pale stone, slate spires, golden windows, village below, winding bridge, pine forest, low mist, star reflections. Clear darker left sky for a title added in code, castle center-right. Foreground cottage has one glowing arched attic window. No people.
- **house.png**：Exterior of girl's two-story stone-and-timber cottage, steep slate gable, chimney, climbing ivy, glowing arched attic bedroom window, stone garden path, gate and wildflowers. Wide three-quarter garden view, castle far across the lake. Same tiny fairy approaches the upper window. Calm village midnight.
- **awake.png**：Same wide attic-bedroom camera, same girl newly awake sitting up under cream quilt, turned curiously and kindly toward the same small fairy hovering at bedside with dream bottle. Girl middle-right, fairy center-left. Castle through left arched window, natural child skin, believable hands and shadows.
- **forest.png**：Ancient moonlit woodland clearing. Girl kneels on mossy root wearing same pajamas and a muted knitted shawl, looking with concern at tiny fairy sitting beside its empty leaf bed. Dozens of glass dream bottles hang on silk threads from great oak branches. Ferns, roots, blue moonbeams, warm dream light; quietly sad, never scary.
- **boat.png**：Enchanted reflective star lake. Same girl and tiny fairy sit safely inside a naturally curved green leaf boat; a small friendly glowing sun orb beside them. Entire boat visible center-right, magnificent castle on misty island in background, luminous whale in far sky. Indigo and warm starlight, photoreal tangible textures.
- **fairy-sleep.png**：Macro cinema shot of same tiny fairy curled asleep in moss and folded-leaf bed inside hollow oak. Folded translucent wings, relaxed hands, tiny cloth textures. Girl's hand and ivory sleeve near bed for scale, face softly visible behind. Nearby glowing glass bottle contains a little dream of a leaf boat; warm dust, woodland bokeh.
- **storybook.png**：Closing wide shot in same bedroom. Same girl sits comfortably under quilt holding open picture book on lap, smiling at tiny fairy standing on book edge with a small wildflower. Same arched window and castle, same bedside amber lamp, coherent scale, natural child face and hands, no legible words on book.

## 镜头与字幕

- 第一幕：城堡全景 → 房子外景；第二幕：安睡卧室；第三幕：安睡 → 醒来。
- 第四幕：梦瓶森林；第五幕：森林 → 星海小船；第六幕：妖精安睡 → 自己的梦。
- 第七幕：小镇全景 → 房子；第八幕：女孩与妖精共读绘本。
- 所有镜头用帧驱动缓慢推进、拉远与叠化；保留原 2 分 15 秒旁白和章节时间轴。
- 字幕按中文停顿和字数比例细分，短句显示；底部渐暗衬底保证可读。
- 图像为生成的电影感静帧；运动来自镜头、转场与光点，不是生成式人物视频。
