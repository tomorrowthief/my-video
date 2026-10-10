import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root: here,
	plugins: [react()],
	// The narration lives in the repo's public/ directory, which the Remotion
	// renderer and Studio also serve from. Pointing Vite at the same folder
	// means staticFile("audio-math/s0-0.m4a") resolves to the same URL in the
	// browser as it does in a render — one source of audio, not two copies.
	publicDir: path.resolve(here, "../public"),
	build: {
		outDir: path.resolve(here, "dist"),
		emptyOutDir: true,
	},
});
