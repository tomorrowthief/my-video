// Paragraph captions use measured TTS clip boundaries, not estimated word timing.
import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const { values } = parseArgs({
  options: {
    timing: { type: "string", default: "../src/idioms/timing.json" },
    out: { type: "string", default: "../src/idioms/captions.json" },
  },
});
const timingPath = new URL(values.timing, import.meta.url);
const target = new URL(values.out, import.meta.url);
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
