# Remotion video

## 网站分类与内容扩充

线上地址：https://video-explainers.pages.dev/

网站以三个主 Tab 组织内容，首页默认进入绘本与故事：

| 主 Tab | 类型 | 系列与现有内容 |
| --- | --- | --- |
| 绘本与故事 | 成语故事 | 小禾的成语故事，目前包含《拔苗助长》《守株待兔》 |
| 绘本与故事 | 历史典故 | 三国小故事系列，目前包含《望梅止渴》（取材《世说新语》） |
| 绘本与故事 | 寓言故事 | 山林寓言系列，目前包含《狐假虎威》 |
| 绘本与故事 | 神话传说 | 后续可加入传统神话与传说 |
| 绘本与故事 | 童话绘本 | 月光故事集，目前包含《偷梦的妖精》 |
| 数学 | 数学思维 | 目前包含《鸡兔同笼》 |
| 技术 | 计算机原理、编程开发、科学与工程、机器学习 | 数据持久化、Python 学习路线、汽车能量流动、神经网络前向传播 |

类型用于区分题材，系列用于组织连续内容。“三国小故事”属于历史典故下的系列；成语故事的
“小禾的成语故事”也是系列，不为每支视频单独增加 Tab。尚未发布视频的类型显示空状态，
不展示占位视频。

每集选择一个主要类型，避免重复计数：以认识成语为目标的内容归入成语故事；主要讲情节和寓意的
内容归入寓言故事。同一题材可以制作不同讲法，但每支视频只占一个主要分类。

分类与中文展示信息保存在 `web/catalog.ts`；实际可播放的视频由 `web/videos.ts` 接入。
以后新增一集，先完成视频与音频时间轴，再在这两处添加视频及其元数据，页面会自动计数和筛选。
故事条目填写 `tab: "stories"`、`storyType` 及可选的 `series`；数学使用 `tab: "math"`，
其他技术科普讲解使用 `tab: "tech"`。新增系列时在 `STORY_SERIES` 中声明它所属的故事类型。
历史故事的讲稿和简介应注明依据史实还是文学改编，例如“三国史实”与“《三国演义》改编”。

可以直接分享视频或分类：

- 成语视频：`?video=idiom-seedling`、`?video=idiom-stump`
- 寓言故事：`?video=fable-fox`
- 历史典故下的三国系列：`?tab=stories&category=history&series=three-kingdoms`
- 童话绘本：`?video=dream-thief`
- 数学：`?tab=math`
- 技术：`?tab=tech`（含 `?video=nn-forward`）

原有 `?video=math`、`?video=python`、`?video=pi-durable`、`?video=car-energy` 仍可使用。
分类与 URL 边界检查：`node --experimental-strip-types --test web/catalog.test.mjs`。

## 百炼配音试听（北京）

使用 Node.js 22 或更新版本。将 `.env.example` 复制为 `.env`，在本地填写北京地域
`DASHSCOPE_API_KEY`。密钥只由本地脚本读取，不进入网页或发布资源。

```bash
npm run tts:sample -- math --dry-run  # 查看讲稿、音色和语气，不调用 API
npm run tts:sample -- math            # 鸡兔同笼开场试听
npm run tts:sample -- python --voice Serena  # 更换讲稿或音色
```

默认使用已实测可用的 `qwen3-tts-flash`，朗读所选视频的第一个场景。
`videos.json` 分别为鸡兔同笼、汽车原理和成语故事配置百炼音色；试听可用参数覆盖音色。
可用 `--text "自定义试听文本"` 指定最多 600 字符的内容，或在 `.env` 中调整
`BAILIAN_TTS_VOICE`、`BAILIAN_TTS_MODEL`。标准模型不支持额外语气指令；如果账户可以
调用 `qwen3-tts-instruct-flash` 系列，再配置 `BAILIAN_TTS_INSTRUCTIONS` 控制讲解风格。
当前账户实测调用指令版返回模型不存在，因此试听使用标准版，不会默默忽略不支持的 API 参数。

试听 WAV 和参数保存在忽略目录 `out/tts-bailian/<video>/`。相同文本、音色与语气会复用
已有音频；试听命令不替换正式音频或时间轴，也不自动发布。API 调用按百炼账户规则计费。
确认音色后，批量替换需实测新音频时长并重建时间轴，不能直接套用旧时长。

接口参考：[百炼 Qwen-TTS](https://help.aliyun.com/zh/model-studio/qwen-tts-api)。

## 批量生成和替换配音

```bash
npm run tts:generate -- math --dry-run # 核对音色和40段旁白，不调用接口
npm run tts:generate -- math           # 生成、转码并校验鸡兔同笼旁白
npm run tts:generate -- math --apply   # 验证完整产物后替换正式音频和时间轴
npm run web:build                      # 构建网页，再用 Wrangler 发布 web/dist
```

`all` 仅处理已在 `videos.json` 中配置百炼 `tts` 的视频，目前包含 `math`、`car-energy` 和 `idiom-seedling`。
其他视频需要先显式添加音色配置后才能批量生成。生成与转码需要网络及 macOS AAC
编码器权限，使用的 Key 从本地 `.env` 读取。每支视频的模型与音色保存在 `videos.json`
的 `tts` 字段，批量生成按这个配置执行，不使用试听的全局音色覆盖。

生成缓存保存在 `out/tts-cache/`，中断后重跑会复用已完成的音频。下载失败时会在本地
保留临时下载信息用于续传，不重复请求生成；缓存目录不应上传或提交。
完成的新 WAV、64 kbps AAC/M4A 和重新测算的帧时间轴保存在 `out/tts-batch/`。
原文件在 `--apply` 时备份到 `out/tts-backups/`；每个新文件名带有音频内容哈希，
浏览器不会把缓存的旧旁白当成新旁白使用。

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
