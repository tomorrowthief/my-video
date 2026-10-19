// Generate into out/tts-batch; --apply swaps validated assets in with a backup.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import {
  generateAudition,
  speechSettings,
  wavDuration,
} from "./tts-bailian.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STAGING = join(ROOT, "out", "tts-batch");
const CACHE = join(ROOT, "out", "tts-cache");

export const buildTiming = (narration, config, clips, spec) => {
  const { fps, width, height } = spec;
  let totalFrames = 0;
  const gap = Math.round(narration.gapSeconds * fps);
  const scenes = narration.scenes.map((scene) => {
    let cursor = Math.round(narration.leadInSeconds * fps);
    const paragraphs = scene.paragraphs.map((p, index) => {
      const clip = clips[`${scene.id}-${index}`];
      if (!clip || !(clip.seconds > 0))
        throw new Error(`Missing generated clip: ${scene.id}-${index}`);
      const durationInFrames = Math.ceil(clip.seconds * fps);
      const paragraph = {
        index,
        file: clip.file,
        text: p.show ?? p.say,
        startFrame: cursor,
        durationInFrames,
        durationSeconds: Number(clip.seconds.toFixed(6)),
      };
      cursor += durationInFrames + gap;
      return paragraph;
    });
    if (!paragraphs.length)
      throw new Error(`Scene has no paragraphs: ${scene.id}`);
    const durationInFrames =
      cursor - gap + Math.ceil(narration.tailSeconds * fps);
    const result = {
      id: scene.id,
      index: scene.index,
      title: scene.title,
      heading: scene.heading,
      visual: scene.visual,
      startFrame: totalFrames,
      durationInFrames,
      durationSeconds: durationInFrames / fps,
      paragraphs,
    };
    totalFrames += durationInFrames;
    return result;
  });
  return {
    fps,
    width,
    height,
    provider: config.provider,
    model: config.model,
    voice: config.voice,
    totalFrames,
    totalSeconds: totalFrames / fps,
    scenes,
  };
};

export const validateTiming = (timing, narration, audioDir) => {
  let cursor = 0;
  let count = 0;
  if (timing.scenes.length !== narration.scenes.length)
    throw new Error("Scene count differs from narration");
  for (const [i, scene] of timing.scenes.entries()) {
    const source = narration.scenes[i];
    if (
      scene.id !== source.id ||
      scene.startFrame !== cursor ||
      scene.paragraphs.length !== source.paragraphs.length
    ) {
      throw new Error(`Invalid scene timeline: ${scene.id}`);
    }
    let end = 0;
    for (const [j, p] of scene.paragraphs.entries()) {
      if (
        p.index !== j ||
        p.startFrame < end ||
        p.text !== (source.paragraphs[j].show ?? source.paragraphs[j].say)
      ) {
        throw new Error(`Invalid paragraph: ${scene.id}/${j}`);
      }
      const audio = readFileSync(join(audioDir, p.file));
      if (audio.length < 100 || audio.toString("ascii", 4, 8) !== "ftyp")
        throw new Error(`Invalid M4A: ${p.file}`);
      const seconds = wavDuration(
        readFileSync(join(audioDir, p.file.replace(/\.m4a$/, ".wav"))),
      );
      if (
        Math.abs(seconds - p.durationSeconds) > 0.000001 ||
        Math.ceil(seconds * timing.fps) !== p.durationInFrames
      ) {
        throw new Error(`Audio duration mismatch: ${p.file}`);
      }
      end = p.startFrame + p.durationInFrames;
      if (end > scene.durationInFrames)
        throw new Error(`Paragraph extends beyond scene: ${p.file}`);
      count++;
    }
    cursor += scene.durationInFrames;
  }
  if (cursor !== timing.totalFrames)
    throw new Error("Total frame count mismatch");
  if (readdirSync(audioDir).length !== count * 2)
    throw new Error("Unexpected staged audio files");
  return count;
};

const main = async () => {
  const { values, positionals } = parseArgs({
    options: { apply: { type: "boolean" }, "dry-run": { type: "boolean" } },
    allowPositionals: true,
  });
  const manifest = JSON.parse(readFileSync(join(ROOT, "videos.json"), "utf8"));
  if (positionals.length > 1)
    throw new Error(
      "Usage: npm run tts:generate -- [all|video] [--dry-run|--apply]",
    );
	const keys =
		!positionals[0] || positionals[0] === "all"
			? Object.keys(manifest).filter((key) => manifest[key].tts?.provider === "bailian")
			: positionals;
	if (!keys.length) throw new Error("No videos have a Bailian tts configuration");
  for (const key of keys)
    if (!Object.hasOwn(manifest, key)) throw new Error(`Unknown video: ${key}`);
  if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
  const jobs = keys.map((key) => {
    const entry = manifest[key];
    const narration = JSON.parse(
      readFileSync(join(ROOT, entry.narration), "utf8"),
    );
    const spec = JSON.parse(readFileSync(join(ROOT, entry.timing), "utf8"));
    if (!entry.tts || entry.tts.provider !== "bailian")
      throw new Error(`Missing Bailian voice configuration: ${key}`);
    for (const scene of narration.scenes) {
      if (!/^[A-Za-z0-9_-]+$/.test(scene.id))
        throw new Error("Invalid scene id");
      for (const p of scene.paragraphs)
        speechSettings({ text: p.say, ...entry.tts });
    }
    return { key, entry, narration, spec, folder: join(STAGING, key) };
  });
  console.log(
    jobs
      .map(
        (j) =>
          `${j.key}: ${j.entry.tts.voice}, ${j.narration.scenes.reduce((s, c) => s + c.paragraphs.length, 0)} clips`,
      )
      .join("\n"),
  );
  if (values["dry-run"]) return;
  if (values.apply) {
    // Validate every video first, then preserve an entire rollback copy before any swap.
    for (const j of jobs) {
      const timing = JSON.parse(
        readFileSync(join(j.folder, "timing.json"), "utf8"),
      );
      if (
        timing.voice !== j.entry.tts.voice ||
        timing.model !== j.entry.tts.model
      )
        throw new Error(`Stale staged voice: ${j.key}`);
      validateTiming(timing, j.narration, join(j.folder, "audio"));
    }
    const backup = join(
      ROOT,
      "out",
      "tts-backups",
      new Date().toISOString().replaceAll(":", "-"),
    );
    mkdirSync(backup, { recursive: true });
    for (const j of jobs) {
      cpSync(join(ROOT, "public", j.entry.audio), join(backup, j.entry.audio), {
        recursive: true,
      });
      copyFileSync(
        join(ROOT, j.entry.timing),
        join(backup, basename(j.entry.timing)),
      );
    }
    const applied = [];
    try {
      for (const j of jobs) {
        const target = join(ROOT, "public", j.entry.audio);
        const old = `${target}.tts-previous`;
        if (existsSync(old))
          throw new Error(`Previous swap needs recovery: ${old}`);
        // Copy to a sibling so rename works even across different filesystems.
        const next = `${target}.tts-next`;
        if (existsSync(next))
          throw new Error(`Previous staged swap exists: ${next}`);
        cpSync(join(j.folder, "audio"), next, { recursive: true });
        renameSync(target, old);
        applied.push({ j, target, old, swapped: false });
        renameSync(next, target);
        applied.at(-1).swapped = true;
        copyFileSync(join(j.folder, "timing.json"), join(ROOT, j.entry.timing));
      }
    } catch (error) {
      for (const a of applied.reverse()) {
        if (a.swapped)
          renameSync(a.target, `${a.target}.tts-failed-${Date.now()}`);
        renameSync(a.old, a.target);
        copyFileSync(
          join(backup, basename(a.j.entry.timing)),
          join(ROOT, a.j.entry.timing),
        );
      }
      throw error;
    }
    // Keep previous directories inside the ignored backup, outside public/ and deploys.
    for (const a of applied)
      renameSync(a.old, join(backup, `${a.j.entry.audio}-swapped`));
    console.log(
      `Applied ${jobs.length} videos. Original assets preserved in ${backup}`,
    );
    return;
  }
  if (!process.env.DASHSCOPE_API_KEY?.trim())
    throw new Error("Missing DASHSCOPE_API_KEY in .env");
  // Verify the encoder before spending API quota on any new audio.
  mkdirSync(STAGING, { recursive: true });
  const checkWav = join(
    ROOT,
    "out/tts-bailian/math/Cherry-3ef63d78f73a4aa9.wav",
  );
  if (!existsSync(checkWav))
    throw new Error("Generate the initial math audition before batch encoding");
  execFileSync(
    "afconvert",
    [
      "-f",
      "m4af",
      "-d",
      "aac",
      "-b",
      "64000",
      checkWav,
      join(STAGING, "encoder-check.m4a"),
    ],
    { stdio: "pipe" },
  );
  let done = 0;
  const tasks = [];
  for (const j of jobs) {
    mkdirSync(join(j.folder, "audio"), { recursive: true });
    j.clips = {};
    for (const scene of j.narration.scenes)
      for (const [index, p] of scene.paragraphs.entries()) {
        tasks.push(async () => {
          const settings = speechSettings({ text: p.say, ...j.entry.tts });
          let clip;
          for (let attempt = 0; ; attempt++) {
            try {
              clip = await generateAudition({
                settings,
                apiKey: process.env.DASHSCOPE_API_KEY,
                outDir: CACHE,
              });
              break;
            } catch (error) {
              // Only explicit throttling is safely retryable without duplicate generation charges.
              if (error.status !== 429 || attempt >= 3) {
                error.message = `${j.key}/${scene.id}-${index}: ${error.message}`;
                throw error;
              }
              await delay(2000 * 2 ** attempt);
            }
          }
          const buffer = readFileSync(clip.path);
          const hash = createHash("sha256")
            .update(buffer)
            .digest("hex")
            .slice(0, 10);
          const name = `${scene.id}-${index}-${hash}`;
          const wav = join(j.folder, "audio", `${name}.wav`);
          const m4a = join(j.folder, "audio", `${name}.m4a`);
          copyFileSync(clip.path, wav);
          if (!existsSync(m4a))
            execFileSync(
              "afconvert",
              ["-f", "m4af", "-d", "aac", "-b", "64000", wav, m4a],
              { stdio: "pipe" },
            );
          j.clips[`${scene.id}-${index}`] = {
            seconds: clip.seconds,
            file: `${name}.m4a`,
          };
          console.log(
            `[${++done}/${tasks.length}] ${j.key}/${scene.id}-${index} ${j.entry.tts.voice} ${clip.seconds.toFixed(2)}s${clip.cached ? " (cached)" : ""}`,
          );
        });
      }
  }
  let cursor = 0;
  let stopped;
	const failures = [];
  const worker = async () => {
    while (cursor < tasks.length && !stopped) {
      const task = tasks[cursor++];
      try {
        await task();
			} catch (error) {
				failures.push(error);
				console.error(`Pending retry: ${error.message}`);
				if (error.status && error.status !== 429) stopped = error;
      }
      await delay(350);
    }
  };
	await Promise.all([worker(), worker()]);
	if (failures.length) throw new Error(`${failures.length} clips incomplete; rerun to reuse cached audio. ${failures[0].message}`);
  for (const j of jobs) {
    const timing = buildTiming(j.narration, j.entry.tts, j.clips, j.spec);
    const count = validateTiming(timing, j.narration, join(j.folder, "audio"));
    writeFileSync(
      join(j.folder, "timing.json"),
      `${JSON.stringify(timing, null, 2)}\n`,
    );
    console.log(
      `Validated ${j.key}: ${count} clips, ${timing.voice}, ${timing.totalSeconds.toFixed(2)}s`,
    );
  }
  console.log(
    "Generation complete. Review, then run: npm run tts:generate -- all --apply",
  );
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
