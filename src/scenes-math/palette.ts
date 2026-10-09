/**
 * Warm palette for the maths explainer. Chickens and rabbits are told apart by
 * shape as well as hue, so the video still reads for colour-blind viewers.
 *
 * Lives next to the scenes that use it rather than in theme.ts: theme.ts holds
 * what every video shares, and a per-video palette there would grow without
 * bound as videos are added.
 */
export const MATH_COLORS = {
	chicken: "#f5c35a",
	chickenSoft: "#3a2c12",
	rabbit: "#b79bff",
	rabbitSoft: "#272042",
	/** Key numbers and the "missing legs" gap. */
	key: "#ff8f4a",
	keySoft: "#3a2113",
	foot: "#d8dced",
	unknown: "#5b6478",
	ok: "#5ed37f",
} as const;
