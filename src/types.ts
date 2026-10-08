export type ParagraphTiming = {
	readonly index: number;
	readonly file: string;
	readonly text: string;
	readonly startFrame: number;
	readonly durationInFrames: number;
	readonly durationSeconds: number;
};

export type SceneTiming = {
	readonly id: string;
	readonly index: string;
	readonly title: string;
	readonly heading: string;
	readonly visual: string;
	readonly startFrame: number;
	readonly durationInFrames: number;
	readonly durationSeconds: number;
	readonly paragraphs: readonly ParagraphTiming[];
};

export type Timing = {
	readonly fps: number;
	readonly width: number;
	readonly height: number;
	readonly totalFrames: number;
	readonly totalSeconds: number;
	readonly scenes: readonly SceneTiming[];
};