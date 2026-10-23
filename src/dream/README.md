# 偷梦的妖精

原创童话绘本，1920 × 1080，30 fps，约 2 分 13 秒，八幕。

- Studio：`http://localhost:3210/DreamThief`
- 网页：`http://localhost:3310/?tab=stories&category=fairytale&video=dream-thief`
- 分类：绘本与故事 → 童话绘本；系列：月光故事集。
- 剧本：项目根目录 `narration.dream.json`。
- 第二版画面：八张内置图像生成工具制作的写实童话电影场景图，含完整城堡全景、房子外景、安睡卧室与真实儿童造型。逐帧驱动镜头推进、拉远、叠化与梦光；每幕独立注册供编辑。
- 场景素材：`public/dream/v2/`；提示词与镜头说明：`src/dream/visual-prompts-v2.md`。
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
