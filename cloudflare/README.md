# Cloudflare 渲染：待部署的集成脚手架

目前能运行的导出服务在 `server/`，默认仅监听本机。此目录**没有部署到 Cloudflare**，Worker 默认对创作/导出请求返回 503。R2 绑定目前未被读写。不能将此脚手架作为已完成的云端渲染功能。

## 架构目标

Pages 提供工作室界面；Workers 做来源校验、Turnstile/网关限流、任务入口；Durable Objects 保存任务、配额、租约与心跳；Containers 运行受控 Node + Chromium + FFmpeg；私有 R2 保存临时素材、输入快照与最终 MP4。浏览器语言模型与 TTS Key 不进入这条链路。

`worker.mjs` 声明容器类和一个使用服务端预览凭据的健康检查入口；其余入口保持不可用。`wrangler.example.jsonc` 仅用于审阅部署结构，不会自动创建资源。正式应用应给容器调用添加服务端鉴权，并持久保存 job token 的哈希，不能依赖容器临时盘与进程内配额。

## 本地容器验证

从仓库根目录构建，使 Dockerfile 能读到锁文件及共享组件：

```sh
docker build --platform linux/amd64 -f cloudflare/Dockerfile -t studio-renderer:integration .
docker run --rm --init --memory=4g --cpus=2 --pids-limit=256 \
  --shm-size=512m -p 127.0.0.1:3401:3401 studio-renderer:integration
```

基础镜像固定为 Node 22.22.3；系统 Chromium、FFmpeg、中文字体通过 Debian 包安装。验收后应锁定镜像 digest 和包仓库快照。容器使用非 root 用户，默认不挂载宿主目录；本地测试项目在容器销毁时消失。请勿把容器端口直接发布到公网。

## Cloudflare 集成前的工作

1. 在独立部署包安装并锁定经验证版本的 Wrangler 与 `@cloudflare/containers`；生成锁文件。当前主工程尚未增加这些云端开发依赖。
2. 将示例配置复制为实际配置，填写账户/私有 R2 桶，检查当前实例类型与账户权限。通过 Wrangler 配置仓库根作为容器构建上下文，或先从根构建镜像推送到 Cloudflare Registry 后使用镜像 URI；示例 Dockerfile 路径本身不替代根构建上下文。
3. 将健康检查用 `STUDIO_PREVIEW_TOKEN` 存入 Worker secret；不会发往浏览器。当前入口只验证容器启动，不允许导出。
4. 实现 R2 流式上传/下载、24 小时生命周期清理和持久任务协调。成功的任务至少持久保存 project revision、结果对象 ID、tokenHash、状态、重试次数、expiresAt；素材不能开放公共读取。
5. 渲染租约、心跳与取消信号持久化。容器重启/休眠必须能把运行任务转为可解释的失败或有上限的恢复，不能丢失完成结果。
6. 使用真实 30/60/90 秒、横竖屏、中文字体、图片/视频/音频样例验证 MP4、音画同步、冷启动、取消、并发、上传与费用；然后才启用公开路由。

本地每小时 5 次/客户端、20 次/全局额度仅进程内有效，反向代理后的 IP 也不能作为公网可靠身份。平台承担计算费用，公网限额需依靠网关与持久配额，不能依赖前端按钮或 localStorage。

官方依据：[Containers 入门](https://developers.cloudflare.com/containers/get-started/)、[Container 生命周期与 API](https://developers.cloudflare.com/containers/api/container-class/)。将 Remotion 放入该容器是基于这些能力提出的实现方案，当前未做 Cloudflare 真机兼容或成本验证。

## Studio 网页预览部署

2026-10-23：网页预览使用现有 `video-explainers` Pages 项目的 `studio-preview` 分支；与生产域名独立。`pages-preview.mjs` 为 Pages 高级模式入口，静态文件由 ASSETS 提供，`/api/studio/*` 明确返回 503 与中文未接通说明。此部署不包含容器渲染服务，浏览器里的本地文件和配置不会随代码发布。

构建后将 `pages-preview.mjs` 复制为 `web/dist/_worker.js`，并放置仅包含 `/api/studio` 和 `/api/studio/*` 的 `_routes.json`，再执行 `wrangler pages deploy web/dist --project-name video-explainers --branch studio-preview --commit-dirty=true`。每次重新构建都需要重新添加这两个预览文件。

本机目前没有可用的 Docker 客户端与运行中的 Docker 引擎，因此尚不能在本机构建并推送 Remotion 容器镜像。后续可安装并启动 Docker，或使用 Cloudflare Workers Builds 连接代码仓库远程构建；仍需完成前述持久任务和 R2 接入。
