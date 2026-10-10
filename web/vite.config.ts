import { cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoPublic = path.resolve(here, "../public");

/** Extensions the site actually serves. Narration ships as AAC; the wavs the
 *  TTS script leaves behind are five times the size and nothing references
 *  them, so they must not reach the bundle. */
const SHIPPED = new Set([".m4a"]);

/**
 * Copies the repo's public/ into dist, but only what the site serves.
 * Vite's own publicDir copy takes everything, which would put 85 MB of unused
 * wav into a 17 MB deploy. Copies, never deletes: the wavs stay where they are.
 */
const narrationAssets = (): Plugin => ({
	name: "narration-assets",
	closeBundle() {
		cpSync(repoPublic, path.resolve(here, "dist"), {
			recursive: true,
			filter: (src) => {
				const ext = path.extname(src);
				return ext === "" || SHIPPED.has(ext);
			},
		});
	},
});

export default defineConfig(({ command }) => ({
	root: here,
	// Dev serves the repo's public/ directly, so the player sounds the same
	// before and after a build. The build takes the filtered copy instead.
	publicDir: command === "serve" ? repoPublic : false,
	plugins: command === "serve" ? [react()] : [react(), narrationAssets()],
	build: {
		outDir: path.resolve(here, "dist"),
		emptyOutDir: true,
	},
}));
