import type { ReactNode } from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, H, PAD, W, easeOut, since } from "../theme";
import type { ParagraphTiming, SceneTiming } from "../types";

/** Which paragraph is being spoken, and how far into it we are. */
export const useSceneFrame = (scene: SceneTiming) => {
	const frame = useCurrentFrame();
	let active = 0;
	for (const paragraph of scene.paragraphs) {
		if (frame >= paragraph.startFrame) active = paragraph.index;
	}
	const paragraph = scene.paragraphs[active] as ParagraphTiming;
	const local = frame - paragraph.startFrame;
	return { frame, active, paragraph, local, total: scene.durationInFrames };
};

const Backdrop: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const frame = useCurrentFrame();
	const drift = frame * 0.22;
	const hue = (Number(scene.index) * 37) % 360;
	return (
		<AbsoluteFill style={{ background: COLORS.bgDeep }}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(1100px 700px at ${18 + Math.sin(drift / 90) * 6}% ${
						8 + Math.cos(drift / 130) * 5
					}%, hsla(${232 + (hue % 24)}, 70%, 58%, 0.16), transparent 62%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(900px 620px at 88% 96%, ${COLORS.accent2}14, transparent 60%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `linear-gradient(${COLORS.border}26 1px, transparent 1px),
						linear-gradient(90deg, ${COLORS.border}26 1px, transparent 1px)`,
					backgroundSize: "80px 80px",
					maskImage: "radial-gradient(ellipse 92% 78% at 50% 45%, #000 30%, transparent 100%)",
					WebkitMaskImage: "radial-gradient(ellipse 92% 78% at 50% 45%, #000 30%, transparent 100%)",
				}}
			/>
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, transparent 55%, ${COLORS.bgDeep} 100%)`,
				}}
			/>
		</AbsoluteFill>
	);
};

const SceneHeader: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const frame = useCurrentFrame();
	const enter = easeOut(since(frame, 0, 16));
	return (
		<div
			style={{
				position: "absolute",
				left: PAD,
				top: 58,
				display: "flex",
				alignItems: "center",
				gap: 18,
				opacity: enter,
				translate: `${(1 - enter) * -26}px 0px`,
			}}
		>
			<span
				style={{
					fontFamily: '"SF Mono", Menlo, monospace',
					fontSize: 20,
					letterSpacing: "0.16em",
					color: COLORS.accent,
					background: COLORS.accentSoft,
					border: `1px solid ${COLORS.borderHi}`,
					borderRadius: 8,
					padding: "5px 12px",
				}}
			>
				{scene.index}
			</span>
			<span style={{ fontFamily: FONT, fontSize: 22, color: COLORS.dim, letterSpacing: "0.04em" }}>
				{scene.heading}
			</span>
			<span style={{ flex: 1, height: 1, background: COLORS.border, minWidth: 40 }} />
			<span
				style={{
					fontFamily: '"SF Mono", Menlo, monospace',
					fontSize: 17,
					color: COLORS.faint,
					letterSpacing: "0.08em",
				}}
			>
				pi-durable
			</span>
		</div>
	);
};

const Caption: React.FC<{ scene: SceneTiming; paragraph: ParagraphTiming; local: number }> = ({
	paragraph,
	local,
}) => {
	const fade = Math.min(since(local, 0, 7), 1 - since(local, paragraph.durationInFrames + 4, 8));
	const rise = easeOut(since(local, 0, 12));
	if (fade <= 0.001) return null;
	return (
		<div
			style={{
				position: "absolute",
				left: PAD,
				right: PAD,
				bottom: 44,
				display: "flex",
				justifyContent: "center",
				opacity: fade,
				translate: `0px ${(1 - rise) * 14}px`,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 16,
					maxWidth: 1520,
					background: "rgba(8,10,15,0.82)",
					border: `1px solid ${COLORS.border}`,
					borderRadius: 14,
					padding: "16px 26px",
					boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
				}}
			>
				<span
					style={{
						width: 4,
						alignSelf: "stretch",
						borderRadius: 2,
						background: COLORS.accent,
						flex: "0 0 auto",
					}}
				/>
				<span style={{ fontFamily: FONT, fontSize: 31, lineHeight: 1.5, color: COLORS.text }}>
					{paragraph.text}
				</span>
			</div>
		</div>
	);
};

const ProgressBar: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const pct = ((scene.startFrame + frame) / durationInFrames) * 100;
	return (
		<div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "#ffffff10" }}>
			<div style={{ width: `${pct}%`, height: "100%", background: COLORS.accent, opacity: 0.75 }} />
		</div>
	);
};

const Narration: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { fps } = useVideoConfig();
	return (
		<>
			{scene.paragraphs.map((paragraph) => (
				<Sequence
					key={paragraph.index}
					from={paragraph.startFrame}
					durationInFrames={paragraph.durationInFrames + 8}
					premountFor={fps}
				>
					<Audio src={staticFile(`audio/${paragraph.file}`)} />
				</Sequence>
			))}
		</>
	);
};

/**
 * One scene: backdrop, header, the scene's own content, narration audio and the
 * caption band. Scenes own everything between the header and the caption.
 */
export const Stage: React.FC<{ scene: SceneTiming; children: ReactNode }> = ({ scene, children }) => {
	const { frame, paragraph, local } = useSceneFrame(scene);
	const out = since(frame, scene.durationInFrames - 14, 14);
	return (
		<AbsoluteFill style={{ width: W, height: H, overflow: "hidden", opacity: 1 - out * 0.9 }}>
			<Backdrop scene={scene} />
			<SceneHeader scene={scene} />
			<div style={{ position: "absolute", left: PAD, right: PAD, top: 132, bottom: 148 }}>{children}</div>
			<Caption scene={scene} paragraph={paragraph} local={local} />
			<ProgressBar scene={scene} />
			<Narration scene={scene} />
		</AbsoluteFill>
	);
};