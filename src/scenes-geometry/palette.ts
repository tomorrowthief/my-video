/**
 * Bright, child-friendly palette for the geometry explainer series.
 * Each shape has a distinct hue so the videos remain legible for colour-blind viewers.
 */
export const GEO_COLORS = {
	/** Circle — warm yellow. */
	circle: "#f5c35a",
	/** Square — cool blue. */
	square: "#5b9aff",
	/** Triangle — green. */
	triangle: "#5ed37f",
	/** Rectangle — coral / orange. */
	rectangle: "#ff8f4a",
	/** Line / path — light blue. */
	line: "#7dc8ff",
	/** Point — white with glow. */
	point: "#ffffff",
	/** Dimension marker — pink. */
	dimension: "#f472b6",
	/** Grid lines — muted. */
	grid: "#242a38",
	/** Highlight — bright accent. */
	highlight: "#ffd166",
} as const;
