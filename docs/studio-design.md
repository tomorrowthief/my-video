# 大众 AI 视频制作 Studio：交互与技术设计

版本：0.2 · 2026-10-23 · 状态：模型直接调用与本地转发适配

2026-10-23 更新（以下历史设计中的协议等待与浏览器直连约束以本段为准）：用户已要求直接调用，无需协议确认步骤。网页将请求和 API Key 通过同源 `/api/studio/models/request` 发送给本地 Studio 后端，再由后端访问模型服务，避免供应商的浏览器 CORS 限制。Key 只用于当前转发，不写入日志、项目、历史、渲染任务或磁盘。聊天使用 `chat/completions`，语音使用 `audio/speech`；DashScope 原生接口由后端适配。连接测试实际执行一次推理或短语音生成，不依赖模型列表等额外端点。

## 1. 已确认范围与交付原则

桌面浏览器优先、中文创作、30～90 秒视频、16:9 与 9:16、1080p H.264/AAC MP4。先支持知识讲解、图文故事和产品介绍。无需账号，无支付；项目、素材与历史版本保存在浏览器，模型费用由用户直接向服务商支付，平台承担有额度限制的渲染费用。

语言模型与 TTS **完全分开配置**：独立 Base URL、API Key、模型、连接测试与状态。TTS 另外提供音色、语速和试听。用户所说的“openapi 规范”暂按待确认术语处理：OpenAPI 描述规范与 OpenAI 兼容接口并不等同。在确认之前，可完成独立配置界面、持久化与协议适配器边界，不宣称任意供应商可以接入，也不编写绑定某个协议的生产请求。

首版采用模型生成受约束的分镜 JSON，再交给可信 Remotion 组件渲染。用户不接触源码。暂不执行模型生成的 JS/TS，不开放任意依赖、脚本、远程组件或用户指定渲染地址。

## 2. 用户体验

### 2.1 页面入口与布局

现有网站保持原样，`/studio`、`/studio/` 懒加载独立创作空间。标题为“视频工作室”，不以 Remotion 开发 Studio 命名。首次打开直接出现可操作的本地示例，并明确标注“示例内容”；示例操作无需模型 Key，真正 AI 生成必须通过配置检查。

顶部：项目名、本地保存状态、模型设置、导出 MP4。左栏分为“创作”“素材”“分镜”；中间预览与镜头时间轴；右栏编辑选中镜头。新用户默认停留在创作表单，完成后进入分镜与预览。桌面 1280px 以上三栏，较小窗口将右栏折叠为面板。

创作表单：主题/目标、视频用途、受众、目标时长（30/60/90 秒）、比例、风格描述与风格预设。默认提供“清新讲解”“温暖故事”“简洁产品”三种可编辑预设。示例输入：“用温暖的绘本风格，给孩子讲一个守株待兔的故事，60 秒。”

### 2.2 主流程

1. 描述主题与风格，上传可选素材。
2. 点击“生成分镜”；检查语言模型配置，展示真实任务阶段。
3. 按镜头展示标题、画面文案、旁白、素材、布局与预计秒数；支持手动修改、增删、排序。
4. 点击“生成配音”；单独检查 TTS 配置。逐镜生成音频，记录真实音频时长，并重新计算镜头帧数。
5. 在播放器预览；支持拖动进度、跳到镜头、编辑字幕与画面属性。
6. 对话修改定位到项目或指定镜头，先校验变更，再创建版本。单镜头修改仅更新受影响的数据与配音。
7. 导出面板显示尺寸、时长、配音状态、临时上传提示与额度；确认后上传已用素材，排队渲染，显示进度，完成后下载 MP4。

未生成配音仍可预览和导出静音视频，导出时需清楚显示“当前无配音”。音频长于所选目标时长时，提示实际成片时长并允许返回缩短旁白；实际总时长超 90 秒则阻止首版导出，不能截断音频伪装成功。

### 2.3 模型配置与本地存储

配置抽屉分两个独立卡片：语言模型、TTS；每个卡片都有保存、显示/隐藏 Key、清除、连接状态。禁止一张卡片覆盖另一张的字段。Key 默认只保留当前会话；用户主动开启“记住到此浏览器”后存入独立配置存储。说明同源脚本可访问浏览器保存的凭据，不将这种存储描述为保险箱或服务端加密存储。

项目导入导出、版本快照、日志、错误报告、渲染上传都不包含 Key。项目只能引用配置 ID，不能复制 Key。浏览器直连因 CORS 失败时给出准确说明；首版不自动把 Key 发送到代理。代理功能留作后续独立决策。

项目与 Blob 存入 IndexedDB；刷新恢复，存储失败给出可见提示，不显示“已保存”。素材 Object URL 仅在运行时创建并及时回收，不能持久化到项目。历史保存最近 20 份有效版本，支持恢复；JSON 项目备份只带结构，未携带素材时必须提示重新关联，不能声称完整备份。

### 2.4 素材与修改规则

图片首版接受 PNG/JPEG/WebP，视频 MP4/WebM，音频 MP3/WAV/M4A。上传前检查扩展名、实际 MIME 与可解码性。推荐上限：单文件 25 MiB、一个项目 100 MiB、最多 20 个素材；上限来自产品保守配置，非 Cloudflare 平台能力承诺。SVG/HTML 不直接接受。删除被引用素材需先列出使用镜头并允许替换。

镜头提供标题、正文、旁白、布局、背景色、强调色、素材、时长与字幕开关；全局提供比例、字幕、音乐音量。旁白修改使对应音频失效；镜头排序或颜色修改不重新请求 TTS。风格全局修改可能影响全部镜头，应在执行前说明范围。所有异步结果绑定项目 ID 与修订号，过期结果不得覆盖新编辑。

## 3. 共享数据契约

`src/studio/types.ts` 为唯一公共类型文件。UI、播放器与后端均引用同一套结构；后端必须额外做严格运行时校验。以下字段用于首版，扩展必须提升 schemaVersion 或保持向后兼容。

```ts
export type AspectRatio = "16:9" | "9:16";
export type AssetKind = "image" | "video" | "audio";
export type SceneLayout = "title" | "split" | "full-media";

export interface StudioAsset {
  id: string;
  name: string;
  kind: AssetKind;
  mimeType: string;
  size: number;
  durationSeconds?: number;
  // Blob 在 IndexedDB 中按 id 存放；这里没有 url、Blob、Key 或磁盘路径。
}

export interface StudioScene {
  id: string;
  title: string;
  body: string;
  narration: string;
  durationInFrames: number;
  layout: SceneLayout;
  backgroundColor: string;
  accentColor: string;
  assetId?: string;
  voiceAssetId?: string;
  voiceNarration?: string; // 生成该音频的旁白；与 narration 不同则配音已失效。
  showCaptions: boolean;
}

export interface StudioProject {
  schemaVersion: 1;
  id: string;
  revision: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  brief: string;
  stylePrompt: string;
  aspectRatio: AspectRatio;
  targetDurationSeconds: 30 | 60 | 90;
  fps: 30;
  scenes: StudioScene[];
  assets: StudioAsset[];
  musicAssetId?: string;
  musicVolume: number; // 0..1
}

export interface StudioCompositionProps {
  project: StudioProject;
  assetSources: Record<string, string>; // 运行时注入；不写入项目。
}

export interface ModelConnection {
  baseUrl: string;
  apiKey: string;
  model: string;
}
export interface StudioModelSettings {
  language: ModelConnection;
  tts: ModelConnection & { voice: string; speed: number };
}
```

约束：镜头数 1～20；所有 ID 使用受限字母数字、连字符、下划线，不能含路径字符；fps 固定 30，镜头帧数为正整数，总时长最多 2700 帧；画面素材只能指向 image/video，配音与音乐只能指向 audio。颜色仅接受十六进制颜色值，文字按纯文本渲染。生成器不得添加远程 URL、CSS 字符串或源码字段。

画布尺寸由比例计算：16:9 为 1920×1080，9:16 为 1080×1920。字幕首版按镜头旁白显示、按标点分句；若供应商不提供对齐时间，只能标注为估算对齐，不宣称逐字精准。音频解码后的真实长度决定镜头最小时长，并留少量尾音余量。

## 4. 渲染 API 契约

默认本地 API 为 `http://127.0.0.1:3401`，UI 通过开发代理访问 `/api/studio`；部署时保持同一相对路径。仅需要以下端点，首版使用轮询，无 WebSocket 依赖。

| 方法与路径 | 请求 | 成功响应 |
| --- | --- | --- |
| GET `/api/studio/health` | 无 | `{status:"ok", renderer:"remotion", maxDurationSeconds:90, maxUploadBytes:104857600}` |
| POST `/api/studio/renders` | multipart/form-data，`project` 为 JSON 字符串，所有被引用的 Blob 以 `asset.<id>` 为字段名 | 202 `{jobId, token, status:"queued"}` |
| GET `/api/studio/renders/:jobId` | `Authorization: Bearer <token>` | `RenderJob` |
| POST `/api/studio/renders/:jobId/cancel` | 同上 | 200 `RenderJob`，重复取消幂等 |
| GET `/api/studio/renders/:jobId/download` | 同上 | 200 `video/mp4`，attachment 文件名；未完成 409 |

一次 multipart 创建任务即完成上传，无额外素材上传 API。前端只上传被引用素材；后端检查所有引用必须有文件且与 manifest 匹配，拒绝额外未知文件与重复字段。只有全部验证成功才入队。请求中的 `assetSources`、远程地址、源码、供应商 Key 均不得接受。

```ts
export type RenderStatus =
  | "queued" | "rendering" | "completed" | "failed" | "cancelled";
export interface RenderJob {
  jobId: string;
  status: RenderStatus;
  progress: number; // 0..1，只有完成时为 1
  createdAt: string;
  updatedAt: string;
  error?: { code: string; message: string };
  expiresAt?: string;
}
// 所有非 2xx JSON 响应：
// { error: { code: string, message: string } }
```

标准错误：400 `INVALID_PROJECT`/`INVALID_ASSET`，413 `UPLOAD_TOO_LARGE`，404 `JOB_NOT_FOUND`（含错误 token，避免泄漏任务存在性），409 `JOB_NOT_READY`，429 `QUOTA_EXCEEDED`/`QUEUE_FULL`，503 `RENDERER_UNAVAILABLE`。任务运行失败在状态中返回 `RENDER_FAILED`，不能将内部路径或异常堆栈展示给用户。前端 1～2 秒轮询、离开页停止轮询但保留任务 ID/token；页面恢复后继续查询。

下载必须使用带 Authorization 的 fetch 获取 Blob 后触发下载，不能把 token 拼到 URL。job token 至少 128 位安全随机，服务端存 hash 并恒定时间比较；token 不传给 Chromium 和第三方素材域名。取消排队任务移出队列，取消运行任务中断渲染并清理临时文件；结束状态不能被迟到的回调改写。完成的 MP4 保留 24 小时是产品目标，本地服务可定时清理，Cloudflare 以 R2 生命周期实现。

## 5. 执行架构与安全边界

### 5.1 本地样机

Vite 浏览器 → Node HTTP 渲染服务 → 可信 Studio Remotion bundle → Chromium + FFmpeg → MP4。固定 composition ID 为 `StudioVideo`。前后端共享受控组件和项目 schema，单独的 `src/studio/render-entry.tsx` 注册 composition，不修改已有 `src/Root.tsx`。渲染器按固定比例、帧数、fps 和明确输入渲染，不使用模型指定的路径或参数。

Node 服务仅监听回环地址作为默认配置；上传存在服务生成的临时目录，用内部不可预测路径提供只读资源。渲染用 URL 由服务生成，只能访问该任务素材，拒绝用户提交的任意 URL，避免请求内网或文件系统。CORS 限定开发网页来源，不能 `*` 搭配凭据。限制请求体、解码尺寸、单任务运行时间和队列长度。

建议样机初值：同时渲染 1 项、队列 3 项、任务最长 15 分钟、单客户端每小时 5 次、全局每小时 20 次；配置化并由真机结果调整。匿名浏览器 ID 不能当可靠配额身份，公网必须增加网关限流与防滥用凭据（例如 Turnstile）。本地内存计数不满足生产持久配额要求。

### 5.2 Cloudflare 目标架构

Pages 承载网页；Workers 负责请求校验、配额和任务编排；Containers 运行 Node/Chromium/FFmpeg；R2 存临时素材与最终 MP4。任务状态与配额放 Durable Objects 等持久协调层，不能依赖容器内存或临时磁盘跨休眠保持。

Cloudflare 官方支持用 Dockerfile 部署 Containers，并由 Worker 通过 Container API 访问。将 Remotion Node 渲染器放入容器是据此提出的方案；完整 Remotion 运行、中文字体、浏览器沙箱、媒体解码、冷启动、取消、休眠、R2 大文件流式传输、并发与成本均需部署样机验证。**不得将 Workers 的 Node 兼容模式等同于已具备 Chromium/FFmpeg 的完整渲染环境，也不得标注为已验证部署。**

公网发布前必须完成：来源校验与防滥用、持久配额、任务 token 鉴权、上传流量与文件上限、R2 临时保留、可靠取消、任务状态持久化、容器重启后的失败恢复。部署脚手架只交付可审阅结构，账号开通、正式配置与上线单列。

## 6. 文件归属与开发拆分

| 负责人 | 可修改范围 | 交接边界 |
| --- | --- | --- |
| 主 Agent / 集成 | `src/studio/types.ts`、`src/studio/schema.ts`（如需）、`package.json`、锁文件、`web/main.tsx`、`web/vite.config.ts` | 先建立共享类型，再让前后端读取；集中处理依赖与路由 |
| 前端 Agent | `src/studio/` 中除 types/schema/render-entry 以外文件，包括 UI、存储、播放器与可信 composition | 导出 `StudioApp` 和 `StudioComposition`；不可修改现有 catalog/Root/视频作品 |
| 后端 Agent | `server/`、`cloudflare/`、`src/studio/render-entry.tsx` | 仅导入共享类型与 `StudioComposition`，API 严格按第 4 节实现 |
| 设计 Agent | 本文档 | 不改源码与依赖 |

无需数据库子任务；首版使用 IndexedDB 和本地任务目录。协议适配可留 `generateStoryboard` / `synthesizeSpeech` 接口，确认协议后再实现；UI 中未实现的 AI 请求入口必须显示真实状态，不用示例数据冒充模型结果。

### 6.1 实施顺序

1. 建立共享类型、独立 `/studio` 路由、创作布局与本地示例；原站回归。
2. IndexedDB 保存、双配置抽屉、素材库、分镜编辑、Remotion Player、比例切换和版本恢复。
3. 本地 Node multipart 渲染 API；先使用样例项目与固定音频验证 MP4，检验中文字体、音画同步和取消。
4. 确认兼容协议后接入真实分镜生成、逐镜 TTS、时长校正和对话修改；错误可重试且保留已完成内容。
5. Docker/Cloudflare 脚手架、部署试验、费用与配额校准，然后才公开服务。

## 7. 验收清单

- 原网站全部视频入口不受影响；直接访问/刷新 `/studio` 可用。
- 两套模型配置互不覆盖；项目 JSON、渲染请求、日志内没有 Key。
- 上传图片、音视频并刷新后恢复；失效素材和保存失败都有明确提示。
- 生成/编辑分镜后，预览与导出使用相同 composition、字体、尺寸、fps 和输入修订。
- 16:9 与 9:16 均可导出合法 H.264/AAC MP4，播放器能播放；字幕与中文字体无缺字。
- 修改旁白只使相关音频失效；实际音频不足/超时有明确处理，不能音频被无声截断。
- 无效项目、远程 URL、超限文件、错误 token 均被拒绝；取消后没有继续消耗的渲染进程。
- 云端尚未部署或没有配置时显示真实不可用状态，不伪造导出成功或下载链接。
- 真正 AI 和 TTS 验收需用户提供自己的浏览器配置；无凭据时仅验收确定性流程。

## 8. 技术依据与待验证事项

- [Cloudflare Containers 入门](https://developers.cloudflare.com/containers/get-started/)：Dockerfile 与 Worker/容器部署结构。
- [Cloudflare Container 类](https://developers.cloudflare.com/containers/api/container-class/)：容器生命周期控制边界。
- [Remotion renderer 源码](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/render-media.ts)：renderMedia 的 serveUrl、inputProps、进度与取消信号接口；实现需匹配项目锁定的 4.0.533 版本。

待确认仅剩模型协议的准确含义；Cloudflare 实际环境验证属于实施工作，不能在没有部署结果时转为产品承诺。

## 9. 首轮实现与验证记录

已实现 `/studio` 独立入口、创作表单、可信 Remotion 画面组件、分镜编辑、素材上传、IndexedDB 本地保存、历史版本、独立语言模型与 TTS 配置、预览、字幕和背景音乐设置，以及本地 MP4 异步渲染 API。

2026-10-22 验证：95 项自动化测试通过，TypeScript 与 Studio lint 通过，网站生产构建通过。原网站分类回归 9 项通过。真实服务端测试生成横屏与竖屏 1080p H.264/AAC 短片，并验证错误 token、无效素材、取消清理与额度限制。当前真实渲染样片为短片；30/60/90 秒完整负载与 Cloudflare 环境仍需后续验证。

模型适配器保持显式待确认状态，不调用任何供应商、不用示例冒充 AI 生成结果。确认用户指的是 OpenAI 兼容接口还是 OpenAPI 文档导入后，再实现对应协议。配置和手动编辑/本地预览/MP4 导出不依赖该确认。

本地体验：分别启动 `npm run studio:server` 与 `npm run studio:dev`，浏览器访问 `/studio`。若开发工具的 SWC 缓存目录不可写，可将 `SWC_NATIVE_BINDING_CACHE` 指向可写临时目录。云端目录仅包含默认禁用公开导出的部署脚手架，尚未上线。
