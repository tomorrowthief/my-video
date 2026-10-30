import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoPublic = path.resolve(here, "../public");

/** Extensions the site actually serves: AAC narration and storybook images. The wavs the
 *  TTS script leaves behind are five times the size and nothing references
 *  them, so they must not reach the bundle. */
const SHIPPED = new Set([".m4a", ".png", ".webp", ".jpg", ".jpeg"]);

/**
 * Copies the repo's public/ into dist, but only what the site serves.
 * Vite's own publicDir copy takes everything, which would put 85 MB of unused
 * wav into a 17 MB deploy. Copies, never deletes: the wavs stay where they are.
 */
const narrationAssets = (): Plugin => ({
	name: "narration-assets",
	closeBundle() {
		const output = path.resolve(here, "dist");
		cpSync(repoPublic, output, {
			recursive: true,
			filter: (src) => {
				const ext = path.extname(src);
				return ext === "" || SHIPPED.has(ext);
			},
		});
		const demo = path.resolve(here, "../ann-demo/ann-demo.html");
		if (existsSync(demo)) {
			mkdirSync(path.join(output, "ann-demo"), { recursive: true });
			cpSync(demo, path.join(output, "ann-demo/index.html"));
		}
		cpSync(path.resolve(here, "../cloudflare/pages-preview.mjs"), path.join(output, "_worker.js"));
		writeFileSync(path.join(output, "_routes.json"), JSON.stringify({
			version: 1, include: ["/api/studio", "/api/studio/*"], exclude: [],
		}));
	},
});

export default defineConfig(({ command }) => ({
	root: here,
	// Dev serves the repo's public/ directly, so the player sounds the same
	// before and after a build. The build takes the filtered copy instead.
	publicDir: command === "serve" ? repoPublic : false,
	plugins: command === "serve" ? [react()] : [react(), narrationAssets()],
	server: {
		proxy: { "/api/studio": "http://127.0.0.1:3401" },
	},
	build: {
		outDir: path.resolve(here, "dist"),
		emptyOutDir: true,
	},
}));
