# 本地 MP4 渲染服务

Node 22.22.3 或以上版本，以及 Remotion 可用的 Chromium。媒体检查默认使用锁定版本 Remotion 随附的 FFmpeg/FFprobe，不依赖系统版本。安装工程依赖后，在仓库根运行 `npm run studio:server`。开发网站通过 Vite 代理访问 `/api/studio`；默认服务地址 `http://127.0.0.1:3401`。若首次使用 Remotion 的浏览器下载失败，可设置 `STUDIO_BROWSER_EXECUTABLE` 为本机兼容 Chromium 的绝对路径。

服务使用可信 `src/studio/render-entry.tsx` / `StudioComposition`，接受严格校验的分镜 JSON 和被引用素材。导出 H.264、AAC、1080p、30 fps MP4；静音项目会加入静音音轨。支持取消、排队、鉴权下载和本机重启恢复状态；重启时未完成任务会标记失败。

## 配置

| 环境变量 | 默认值 / 作用 |
| --- | --- |
| `STUDIO_HOST` / `STUDIO_PORT` | `127.0.0.1` / `3401` |
| `STUDIO_DATA_DIR` | 系统临时目录下按工程生成的目录；保存本地任务，可能受操作系统临时文件清理影响 |
| `STUDIO_ALLOWED_ORIGINS` | `http://localhost:3200,http://127.0.0.1:3200,http://localhost:3412,http://127.0.0.1:3412`，逗号分隔 |
| `STUDIO_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]`，限制 Host 防止 DNS 重绑定 |
| `STUDIO_BROWSER_EXECUTABLE` | 可选，自定义兼容浏览器的绝对路径 |
| `STUDIO_FFMPEG` / `STUDIO_FFPROBE` | 可选，覆盖 Remotion 自带工具，指定本机可用程序的绝对路径 |

每个素材 25 MiB，项目 100 MiB，20 个素材；最多 90 秒、20 个镜头。并发 1、队列 3，同时上传最多 2 项；运行最长 15 分钟。额度每小时每个网络客户端 5 次、全局 20 次，创建尝试即计数；本地试用额度在进程重启后重置。任务及结果保留 24 小时，到期每分钟清理。

PNG/JPEG/WebP 会完整解码并重编码为 PNG。视频接受 MP4 H.264 或 WebM VP8/VP9，音频接受 MP3、PCM WAV、AAC M4A；不接受 SVG、HTML、播放列表或远程素材 URL。FFprobe 检查实际流与时长，FFmpeg 完整解码检查后才入队；损坏媒体、超大解码尺寸、不支持编码会返回 `INVALID_ASSET`。当前服务不提供任意媒体转码。

任务 token 仅在创建响应返回一次。后续状态、取消、下载均通过 `Authorization: Bearer ...`；无效 token 返回 404。MP4 下载用带 Authorization 的 fetch，不能将 token 放到查询参数。服务只存 token 哈希。素材使用渲染子进程内单独的回环端口与随机资源路径；主 API 不暴露素材下载路由，取消/失败后清理输入，完成后仅保留 MP4 与任务记录。

## 验证

`npm run studio:server:test` 运行真实 HTTP 与 Remotion 验证（需要 FFmpeg/Chromium）：检查非法输入、错误 token、文件字节校验、取消，并生成短横/竖屏 MP4 后由 FFprobe 检查 H.264/AAC 及尺寸。测试在临时目录隔离运行，不调用模型、不需要 API Key。

本地服务提供完整导出闭环；Cloudflare 目录仍是待验证脚手架。生产还需要持久配额、防滥用、R2 生命周期与任务协调，见 `cloudflare/README.md`。

## 模型转发

`POST /api/studio/models/request` 接受 JSON `{url, apiKey, body}`，其中 `url` 为完整模型接口地址，`body` 为上游请求对象。网页通过 Vite 同源代理调用；服务要求配置内的 Origin，仅在内存中使用 API Key，不写入日志或文件。返回上游状态码与 JSON / 音频字节。无需协议发现或 models 列表接口。

仅接受公网 HTTPS 443；拒绝本机、内网、含凭据 URL 和重定向，解析 DNS 后固定连接地址。输入最多 1 MiB，输出最多 32 MiB，总请求超时 90 秒，网页断开会取消模型请求。该入口不依赖渲染器是否就绪。

百炼域名的 `/api/v1/chat/completions` 自动改为 `/compatible-mode/v1/chat/completions`；`/api/v1/audio/speech` 和 `/compatible-mode/v1/audio/speech` 针对非实时 Qwen-TTS 模型自动改用原生接口，转换 text / voice，并在后端下载返回的音频地址，避免第二次跨域。原生 Qwen-TTS 不提供 OpenAI speed 参数，当前忽略此参数。其他百炼语音模型需提供相应支持的接口及请求格式，不能直接套用此适配。参考 [阿里云 Qwen-TTS API](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-api)。

`node --test tests/studio/model-proxy.test.mjs` 运行无付费调用的模拟转发、百炼适配、地址校验及取消测试。
