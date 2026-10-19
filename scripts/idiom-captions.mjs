// Paragraph captions use measured TTS clip boundaries, not estimated word timing.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const timingPath = new URL("../src/idioms/timing.json", import.meta.url);
const target = new URL("../src/idioms/captions.json", import.meta.url);
const timing = JSON.parse(readFileSync(timingPath, "utf8"));
const captions = Object.fromEntries(
  timing.scenes.map((scene) => [
    scene.id,
    scene.paragraphs.map((p) => ({
      text: p.text,
      startMs: (p.startFrame / timing.fps) * 1000,
      endMs: ((p.startFrame + p.durationInFrames) / timing.fps) * 1000,
      timestampMs: null,
      confidence: null,
    })),
  ]),
);
writeFileSync(target, `${JSON.stringify(captions, null, 2)}\n`);
console.log(
  `Updated ${fileURLToPath(target)}: ${timing.scenes.length} scenes.`,
);
