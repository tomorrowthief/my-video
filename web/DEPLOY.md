# 部署到 Cloudflare

视频成片放 R2，入口页放 Pages。**不能全放 Pages** —— 它的单文件上限是 25 MiB，
而除了鸡兔同笼（13.7 MB）之外每一支都超了。这是 Cloudflare 官方推荐的分法。

## 一次性准备

```bash
npm i -D wrangler
npx wrangler login
```

## 1. 建 R2 桶并上传成片

```bash
npx wrangler r2 bucket create video-explainers

npx wrangler r2 object put video-explainers/chicken-rabbit.mp4 \
  --file out/chicken-rabbit.mp4 --content-type video/mp4 --remote
npx wrangler r2 object put video-explainers/python-roadmap.mp4 \
  --file out/python-roadmap.mp4 --content-type video/mp4 --remote
npx wrangler r2 object put video-explainers/pi-durable.mp4 \
  --file out/pi-durable.mp4 --content-type video/mp4 --remote
```

`--content-type video/mp4` 不能省：缺了它浏览器会当成下载而不是播放。
`--remote` 也不能省，否则只会写进本地模拟器。

## 2. 把桶开成公开可读

在 Dashboard → R2 → 你的桶 → Settings：

- **Public Development URL**：开了之后拿到一个 `https://pub-xxxx.r2.dev` 地址，够用但不保证稳定
- 或者绑自定义域名（如 `video.yourdomain.com`），正式用这个

## 3. 填地址

把 `web/index.html` 里这行换成上一步拿到的地址：

```js
const R2_BASE = "https://REPLACE-ME.r2.dev";
```

## 4. 部署入口页

```bash
npx wrangler pages deploy web --project-name video-explainers
```

输出里会给你 `https://video-explainers.pages.dev` —— 这就是发给别人的 URL。

## 关于跨域

视频用 `<video src>` 直接加载，不是 `fetch`，所以**不需要配 CORS**。
只有将来改成 Remotion Player 实时渲染（要 `fetch` 音频）时才需要在 R2 加 CORS 规则。

## 成片怎么来的

```bash
npx remotion render src/index.ts ChickenRabbit  out/chicken-rabbit.mp4
npx remotion render src/index.ts PythonRoadmap  out/python-roadmap.mp4
npx remotion render src/index.ts PiDurable      out/pi-durable.mp4
```

`out/` 在 `.gitignore` 里，成片不进版本库 —— 改了场景就重渲，别去找旧文件。
