export const FPS = 30;

export const COLORS = {
	bg: "#0a0c11",
	bgDeep: "#06070b",
	panel: "#12151d",
	panelHi: "#171b25",
	border: "#242a38",
	borderHi: "#333b4d",
	text: "#e7eaf2",
	dim: "#8a93a8",
	faint: "#5b6478",
	accent: "#7d8cff",
	accentSoft: "#1b2040",
	accent2: "#2fd3bd",
	accent2Soft: "#0e2b2b",
	warn: "#ffb454",
	warnSoft: "#2e2210",
	danger: "#ff6b7a",
	dangerSoft: "#2e1219",
	ok: "#5ed37f",
} as const;

export const FONT =
	'"PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", sans-serif';
export const MONO = '"SF Mono", "JetBrains Mono", Menlo, Monaco, "Courier New", monospace';

export const W = 1920;
export const H = 1080;
export const PAD = 88;

import { Easing, interpolate } from "remotion";

/** Linear 0..1 progress over `frames`, starting at `from`. */
export const since = (frame: number, from: number, frames: number): number =>
	interpolate(frame, [from, from + frames], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

/** Ease-out cubic over an already-normalised 0..1 value, for entrances. */
export const easeOut = (t: number): number =>
	interpolate(t, [0, 1], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

/** Ease-in-out over an already-normalised 0..1 value, for moves. */
export const easeInOut = (t: number): number =>
	interpolate(t, [0, 1], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});

export const clamp01 = (t: number): number => Math.min(Math.max(t, 0), 1);