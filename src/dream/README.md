# 偷梦的妖精

原创童话绘本，1920 × 1080，30 fps，约 2 分 13 秒，八幕。

- Studio：`http://localhost:3210/DreamThief`
- 网页：`http://localhost:3310/?tab=stories&category=fairytale&video=dream-thief`
- 分类：绘本与故事 → 童话绘本；系列：月光故事集。
- 剧本：项目根目录 `narration.dream.json`。
- 第三版画面（当前）：手绘动画风，八幕全部由代码绘制，见 `src/dream/painted/`。每幕独立注册供编辑。
- 第二版画面（已停用）：八张写实电影场景图，素材仍在 `public/dream/v2/`，说明见 `src/dream/visual-prompts-v2.md`；`CinematicPage.tsx` 的 `FilmShot` 保留，可用于恢复。
- 字幕：按中文停顿切成短句，与原旁白时长同步。
- 配音：百炼北京 `qwen3-tts-flash`，Cherry 在线神经网络女声。去掉过密逗号，保持音高按 0.92 倍轻微减速，统一为 -19 LUFS；按处理后每段实际音频长度同步字幕和镜头。配置位于 `src/dream/voice.json`。
- 配乐：原创循环音乐盒旋律，由 `scripts/dream-music.py` 生成。

## 重建配音

先执行 `node scripts/dream-voice.mjs --sample` 生成开头试听，再执行 `node scripts/dream-voice.mjs --apply`。在线合成使用项目 `.env` 中的百炼配置，需要可用的北京地域 `DASHSCOPE_API_KEY`。macOS 上需要 `afconvert`，音频处理复用项目内置 FFmpeg。

所有片段先在 `out/dream-voice/cloud-v2/` 暂存并验证，全部完成后才切换引用；旧音频与时间轴保存在 `out/dream-voice/backups/`。缓存避免重复生成；新音频使用独立版本文件名，避免旧浏览器缓存。`--local` 已停用，不再自动降级系统声音。

当前账号不提供 Instruct 模型，实际使用模型不接受风格指令；`voice.json` 中的 instructions 是期望风格记录，实际改善由自然音色、文案节奏及音频处理实现。

## 重建配乐

执行 `python3 scripts/dream-music.py`，然后执行 `afconvert -f m4af -d aac -b 64000 public/audio-dream/moonlight.wav public/audio-dream/moonlight.m4a`。

网页只发布压缩后的 `.m4a`；音频原始文件用于本地留档。本版已完整替换为在线 TTS，未混用原系统声音。未发布到线上，未导出 MP4。

## 手绘动画风（第三版画面）

六个场景，八幕共用；角色、云、梦瓶、滤镜与镜头在 `painted/kit.tsx`。

| 文件 | 场景 | 使用 |
|---|---|---|
| `painted/Town.tsx` | 城堡全景、石头小屋 | 第一幕（妖精提瓶飞来）、第七幕（梦飞回各家窗口，妖精带花敲窗） |
| `painted/Bedroom.tsx` | 阁楼卧室 | 第二幕（收梦）、第三幕（偷看后坐起）、第八幕（读绘本，星星眨眼） |
| `painted/Forest.tsx` | 梦瓶森林 | 第四幕（从梦瓶摇到空床）、第五幕前半（米米坐到妖精身边） |
| `painted/Boat.tsx` | 星海小船 | 第五幕后半、第六幕后半 |
| `painted/Hollow.tsx` | 树洞特写 | 第六幕前半（妖精第一次做梦） |

- 画法：积云和树冠为亮顶暗底的赛璐珞分层，边缘用噪声位移成笔触；整幅叠纸纹与水彩晕染。
- 运动：各层按深度视差；水面倒影按“一拍三”跳帧；窗帘、蕨类、花草随风摆；镜头推拉后停住留白。
- 换成生成的手绘底图（可选）：`node scripts/dream-painted-art.mjs`，使用百炼 `qwen-image`，结果写入 `public/dream/painted/`，需要能访问 `dashscope.aliyuncs.com`。目前没有接入画面。
