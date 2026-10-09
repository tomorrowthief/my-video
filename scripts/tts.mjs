// Generates narration audio with macOS `say` and writes the timing JSON.
// Run: node scripts/tts.mjs [narrationPath] [timingOutPath] [audioOutDir]
// All three arguments are optional and project-root-relative; see the argument
// contract below. With no arguments this reproduces the pi-durable paths.
/* global process, console */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Optional positional args so one project can host more than one explainer:
//   node scripts/tts.mjs [narrationPath] [timingOutPath] [audioOutDir]
// Paths are relative to the project root. Defaults reproduce the original
// pi-durable behaviour exactly.
const [narrationArg = "narration.json", timingArg = "src/timing.json", audioArg = "public/audio"] =
	process.argv.slice(2);

// resolve (not join) so that an absolute argument stays absolute and is rejected
// below instead of being silently rebased under the root as `<root>/tmp/...`.
const argPath = (arg) => resolve(root, arg);

const narrationPath = argPath(narrationArg);
const outDir = argPath(audioArg);
const timingPath = argPath(timingArg);
const tmpDir = join(root, ".tts-tmp");

// outDir is handed to rmSync(..., { recursive: true, force: true }) below, so an
// empty argument, "." or ".." would delete the project itself — or a directory
// outside it. Arguments are project-root-relative and must land strictly inside
// the project root; reject anything else before touching the filesystem.
const insideRoot = (p) => p !== root && p.startsWith(root + sep);
for (const [label, p] of [
	["narration", narrationPath],
	["timing", timingPath],
	["audio", outDir],
]) {
	if (!insideRoot(p)) {
		throw new Error(
			`tts.mjs: refusing to use the ${label} path "${p}" — it must be a non-empty path inside the project root (${root})`,
		);
	}
}

let narrationSource;
try {
	narrationSource = readFileSync(narrationPath, "utf8");
} catch {
	throw new Error(
		`tts.mjs: cannot read the narration file "${narrationPath}" (argument 1, project-root-relative)`,
	);
}
const narration = JSON.parse(narrationSource);

const FPS = 30;
const { voice, rate, gapSeconds, leadInSeconds, tailSeconds } = narration;

/** Seconds of audio in a RIFF/WAVE file, read from its fmt and data chunks. */
const wavDuration = (path) => {
	const buf = readFileSync(path);
	if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
		throw new Error(`Not a WAVE file: ${path}`);
	}
	let byteRate;
	let dataSize;
	let offset = 12;
	while (offset + 8 <= buf.length) {
		const id = buf.toString("ascii", offset, offset + 4);
		const size = buf.readUInt32LE(offset + 4);
		const body = offset + 8;
		if (id === "fmt ") byteRate = buf.readUInt32LE(body + 8);
		if (id === "data") {
			dataSize = Math.min(size, buf.length - body);
			break;
		}
		offset = body + size + (size % 2);
	}
	if (byteRate === undefined || dataSize === undefined) {
		throw new Error(`Malformed WAVE file: ${path}`);
	}
	return dataSize / byteRate;
};

rmSync(tmpDir, { recursive: true, force: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(timingPath), { recursive: true });

const toFrames = (seconds) => Math.round(seconds * FPS);
const scenes = [];
let totalFrames = 0;
let totalSeconds = 0;

for (const scene of narration.scenes) {
	const paragraphs = [];
	let cursor = leadInSeconds;

	for (const [index, paragraph] of scene.paragraphs.entries()) {
		const name = `${scene.id}-${index}`;
		const aiff = join(tmpDir, `${name}.aiff`);
		const wav = join(outDir, `${name}.wav`);
		execFileSync("say", ["-v", voice, "-r", String(rate), "-o", aiff, paragraph.say]);
		execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@22050", aiff, wav]);
		const duration = wavDuration(wav);
		paragraphs.push({
			index,
			file: `${name}.wav`,
			text: paragraph.show ?? paragraph.say,
			startFrame: toFrames(cursor),
			durationInFrames: toFrames(duration),
			durationSeconds: Number(duration.toFixed(3)),
		});
		cursor += duration + gapSeconds;
		process.stdout.write(`  ${name}  ${duration.toFixed(2)}s\n`);
	}

	const durationSeconds = cursor - gapSeconds + tailSeconds;
	const durationInFrames = toFrames(durationSeconds);
	scenes.push({
		id: scene.id,
		index: scene.index,
		title: scene.title,
		heading: scene.heading,
		visual: scene.visual,
		startFrame: totalFrames,
		durationInFrames,
		durationSeconds: Number(durationSeconds.toFixed(3)),
		paragraphs,
	});
	totalFrames += durationInFrames;
	totalSeconds += durationSeconds;
	console.log(`${scene.id}  ${scene.paragraphs.length} 句  ${durationSeconds.toFixed(1)}s`);
}

writeFileSync(
	timingPath,
	`${JSON.stringify(
		{
			fps: FPS,
			width: 1920,
			height: 1080,
			voice,
			rate,
			totalFrames,
			totalSeconds: Number(totalSeconds.toFixed(3)),
			scenes,
		},
		null,
		2,
	)}\n`,
);

rmSync(tmpDir, { recursive: true, force: true });
const minutes = Math.floor(totalSeconds / 60);
console.log(`\ntotal ${minutes}m ${Math.round(totalSeconds - minutes * 60)}s  ${totalFrames} frames`);