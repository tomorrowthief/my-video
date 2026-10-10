// Converts the narration from wav to AAC and points the timing JSONs at the
// new files. Run: node scripts/compress-audio.mjs [--delete-wav]
//
// The wavs are ~370 KB a sentence, which is fine for rendering locally and
// wasteful for a site people open on a phone. AAC at 64 kbps mono is about
// a fifth of that and indistinguishable for speech.
//
// Durations are NOT recomputed. They were measured from the wavs when the
// narration was generated, transcoding does not change them, and recomputing
// would risk shifting every scene by a frame for no reason.
//
// macOS only: afconvert ships with the OS. The AAC encoder is unavailable
// inside a sandbox, so run this from a real terminal.
/* global process, console */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deleteWav = process.argv.includes("--delete-wav");

const manifest = JSON.parse(readFileSync(join(root, "videos.json"), "utf8"));

let converted = 0;
let skipped = 0;
let wavBytes = 0;
let aacBytes = 0;

for (const [key, video] of Object.entries(manifest)) {
	const audioDir = join(root, "public", video.audio);
	const wavs = readdirSync(audioDir).filter((f) => f.endsWith(".wav"));

	for (const wav of wavs) {
		const m4a = wav.replace(/\.wav$/, ".m4a");
		const from = join(audioDir, wav);
		const to = join(audioDir, m4a);
		wavBytes += statSize(from);
		if (existsSync(to)) {
			aacBytes += statSize(to);
			skipped++;
			continue;
		}
		execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", from, to]);
		aacBytes += statSize(to);
		converted++;
	}

	// Rewrite only the extension on each paragraph's `file`. Every other field,
	// in particular every frame count, is left exactly as it was.
	const timingPath = join(root, video.timing);
	const timing = JSON.parse(readFileSync(timingPath, "utf8"));
	for (const scene of timing.scenes) {
		for (const paragraph of scene.paragraphs) {
			paragraph.file = paragraph.file.replace(/\.wav$/, ".m4a");
		}
	}
	writeFileSync(timingPath, `${JSON.stringify(timing, null, 2)}\n`);

	const missing = [];
	for (const scene of timing.scenes) {
		for (const paragraph of scene.paragraphs) {
			if (!existsSync(join(audioDir, paragraph.file))) missing.push(paragraph.file);
		}
	}
	if (missing.length > 0) {
		throw new Error(`${key}: timing points at ${missing.length} missing files, e.g. ${missing[0]}`);
	}
	console.log(`${key.padEnd(12)} ${wavs.length} clips -> ${video.audio}/*.m4a`);
}

if (deleteWav) {
	for (const video of Object.values(manifest)) {
		const audioDir = join(root, "public", video.audio);
		for (const wav of readdirSync(audioDir).filter((f) => f.endsWith(".wav"))) {
			unlinkSync(join(audioDir, wav));
		}
	}
	console.log("\nwav files deleted");
} else {
	console.log("\nwav files kept — rerun with --delete-wav once the player sounds right");
}

const mb = (n) => `${(n / 1048576).toFixed(1)}MB`;
console.log(
	`converted ${converted}, reused ${skipped} | ${mb(wavBytes)} -> ${mb(aacBytes)} (${(wavBytes / aacBytes).toFixed(1)}x)`,
);

function statSize(path) {
	return existsSync(path) ? readFileSync(path).length : 0;
}
