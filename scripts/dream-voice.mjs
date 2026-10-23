// Cloud narration is staged and validated before any player references change.
// node scripts/dream-voice.mjs --sample | --apply
import { createHash } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  existsSync,
} from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateAudition,
  speechSettings,
  wavDuration,
} from "./tts-bailian.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
const voice = JSON.parse(
  readFileSync(join(ROOT, "src/dream/voice.json"), "utf8"),
);
const story = JSON.parse(
  readFileSync(join(ROOT, "narration.dream.json"), "utf8"),
);
const stage = join(ROOT, "out/dream-voice/cloud-v2");
mkdirSync(join(stage, "audio"), { recursive: true });

// Curl config arrives on stdin; credentials and signed URLs never enter argv or logs.
const curlRequest = (url, opts = {}) =>
  new Promise((done, fail) => {
    const config = [
      `url = ${JSON.stringify(String(url))}`,
      "silent",
      "show-error",
      "connect-timeout = 20",
      `max-time = ${opts.method === "POST" ? 110 : 60}`,
    ];
    for (const [key, value] of Object.entries(opts.headers ?? {}))
      config.push(`header = ${JSON.stringify(`${key}: ${value}`)}`);
    if (opts.method) config.push(`request = ${JSON.stringify(opts.method)}`);
    if (opts.body) config.push(`data = ${JSON.stringify(opts.body)}`);
    const child = spawn(
      "curl",
      ["--config", "-", "--write-out", "\n%{http_code}"],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const chunks = [];
    let size = 0;
    child.stdout.on("data", (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024 * 1024) child.kill();
      else chunks.push(chunk);
    });
    child.stderr.on("data", () => {});
    child.on("error", () => fail(new Error("语音网络连接无法启动。")));
    child.on("close", (code) => {
      if (code !== 0)
        return fail(
          new Error(`语音网络请求未完成（${code}）；未自动重发生成请求。`),
        );
      const buffer = Buffer.concat(chunks);
      const split = buffer.lastIndexOf(10);
      const status = Number(buffer.subarray(split + 1).toString());
      if (!(status >= 200 && status < 600))
        return fail(new Error("语音服务响应无效。"));
      done(new Response(buffer.subarray(0, split), { status }));
    });
    child.stdin.on("error", () => {});
    child.stdin.end(config.join("\n"));
  });

// Remove purely rhythmic extra commas left by the old system-voice script.
const smoothText = (text) =>
  text
    .replace("有一扇小小的窗，还亮着月光", "有一扇小小的窗还亮着月光")
    .replace("想不起，昨夜", "想不起昨夜")
    .replace("决定，今晚", "决定今晚")
    .replace("带到哪里去了？", "带到哪里去了？")
    .replace("妖精带着米米，走进森林", "妖精带着米米走进森林")
    .replace("因为，我从来", "因为……我从来")
    .replace("那我们就一起，编一个故事吧", "那我们就一起编一个故事吧")
    .replace("一艘树叶小船，驶过", "一艘树叶小船驶过")
    .replace("一只怕黑的小太阳，坐在", "一只怕黑的小太阳坐在")
    .replace("自己的心，亮起来", "自己的心亮起来")
    .replace("让鲸鱼和城堡，飞回", "让鲸鱼和城堡飞回")
    .replace("米米笑着，翻开了绘本", "米米笑着翻开了绘本")
    .replace("都会有一个，属于自己的梦", "都会有一个属于自己的梦");

const buildClip = async (s, j) => {
  const text = s.lines[j];
  const say = smoothText(text);
  const settings = speechSettings({ text: say, ...voice });
  const hash = createHash("sha256")
    .update(JSON.stringify({ settings, tempo: voice.tempo ?? 1 }))
    .digest("hex")
    .slice(0, 12);
  const result = await generateAudition({
    settings,
    apiKey: process.env.DASHSCOPE_API_KEY,
    outDir: stage,
    request: curlRequest,
  });
  const processed = join(stage, `soft-${hash}.wav`);
  if (!existsSync(processed)) {
    const compositor = join(
      ROOT,
      "node_modules/@remotion/compositor-darwin-arm64",
    );
    execFileSync(
      join(compositor, "ffmpeg"),
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        result.path,
        "-af",
        `atempo=${voice.tempo ?? 1},loudnorm=I=-19:TP=-2:LRA=7`,
        "-ar",
        "24000",
        "-c:a",
        "pcm_s16le",
        processed,
      ],
      {
        env: { ...process.env, DYLD_LIBRARY_PATH: compositor },
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
  }
  const seconds = wavDuration(readFileSync(processed));
  if (seconds < 1 || seconds > 90)
    throw new Error(`音频长度异常：${s.id}-${j}`);
  const file = `${s.id}-${j}-${hash}.m4a`;
  const encoded = join(stage, "audio", file);
  execFileSync(
    "afconvert",
    ["-f", "m4af", "-d", "aac", "-b", "64000", processed, encoded],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  console.log(
    `${s.id}-${j}: ${seconds.toFixed(2)}s${result.cached ? " (cached)" : ""}`,
  );
  return { file, text, say, seconds, wav: result.path };
};

const main = async () => {
  if (process.argv.includes("--local"))
    throw new Error("当前脚本使用在线故事配音，不再回退系统语音。");
  if (process.argv.includes("--sample")) {
    const clip = await buildClip(story.scenes[0], 0);
    copyFileSync(join(stage, "audio", clip.file), join(stage, "sample.m4a"));
    console.log(`Sample: ${join(stage, "sample.m4a")}`);
    return;
  }
  const jobs = story.scenes.flatMap((s, i) =>
    s.lines.map((_, j) => ({ s, i, j })),
  );
  const clips = Array(jobs.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (next < jobs.length) {
        const index = next++;
        const { s, j } = jobs[index];
        clips[index] = await buildClip(s, j);
      }
    }),
  );
  let cursor = 0,
    clipIndex = 0;
  const scenes = story.scenes.map((s, i) => {
    let local = 30;
    const paragraphs = s.lines.map((_, j) => {
      const c = clips[clipIndex++];
      const durationInFrames = Math.ceil(c.seconds * 30);
      const paragraph = {
        index: j,
        file: c.file,
        text: c.text,
        startFrame: local,
        durationInFrames,
        durationSeconds: c.seconds,
      };
      local += durationInFrames + 21;
      return paragraph;
    });
    const durationInFrames = local + 42;
    const scene = {
      id: s.id,
      index: String(i + 1).padStart(2, "0"),
      title: s.title,
      heading: s.title,
      visual: s.id,
      startFrame: cursor,
      durationInFrames,
      durationSeconds: durationInFrames / 30,
      paragraphs,
    };
    cursor += durationInFrames;
    return scene;
  });
  const timing = {
    fps: 30,
    width: 1920,
    height: 1080,
    provider: voice.provider,
    model: voice.model,
    voice: voice.voice,
    totalFrames: cursor,
    totalSeconds: cursor / 30,
    scenes,
  };
  writeFileSync(
    join(stage, "timing.json"),
    JSON.stringify(timing, null, 2) + "\n",
  );
  writeFileSync(
    join(stage, "voice.json"),
    JSON.stringify(
      { ...voice, clips: clips.map(({ wav, ...c }) => c) },
      null,
      2,
    ) + "\n",
  );
  if (!process.argv.includes("--apply")) {
    console.log(
      `Staged ${clips.length} clips; ${timing.totalSeconds.toFixed(2)}s. Add --apply to publish locally.`,
    );
    return;
  }
  const backup = join(
    ROOT,
    "out/dream-voice/backups",
    new Date().toISOString().replaceAll(":", "-"),
  );
  mkdirSync(backup, { recursive: true });
  const old = JSON.parse(
    readFileSync(join(ROOT, "src/dream/timing.json"), "utf8"),
  );
  copyFileSync(
    join(ROOT, "src/dream/timing.json"),
    join(backup, "timing.json"),
  );
  for (const s of old.scenes)
    for (const p of s.paragraphs)
      copyFileSync(
        join(ROOT, "public/audio-dream", p.file),
        join(backup, p.file),
      );
  for (const c of clips)
    copyFileSync(
      join(stage, "audio", c.file),
      join(ROOT, "public/audio-dream", c.file),
    );
  // New versioned filenames keep the existing player valid until this single switch.
  writeFileSync(
    join(ROOT, "src/dream/timing.json"),
    JSON.stringify(timing, null, 2) + "\n",
  );
  console.log(
    `Applied ${clips.length} cloud clips; ${timing.totalSeconds.toFixed(2)}s. Previous version preserved.`,
  );
};
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
