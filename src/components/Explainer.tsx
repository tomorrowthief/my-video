import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import type { SceneTiming, Timing } from "../types";
import { Stage } from "./Stage";

export type SceneBody = React.FC<{ scene: SceneTiming }>;
export type SceneBodies = Readonly<Record<string, SceneBody>>;

/**
 * Builds one video's composition component. Every scene sits at the absolute
 * frame its narration starts, so the audio timeline in its timing JSON is the
 * only source of pacing: regenerating the voice-over re-cuts the whole video.
 *
 * Call this once per video and keep the result — returning a fresh component
 * on every render would hand Remotion a new component identity each frame.
 */
export const makeExplainer = (
	timing: Timing,
	brand: string,
	audioDir: string,
	bodies: SceneBodies,
): React.FC => {
	const Explainer: React.FC = () => {
		const { fps } = useVideoConfig();
		return (
			<AbsoluteFill style={{ background: COLORS.bgDeep }}>
				{timing.scenes.map((scene) => {
					const Body = bodies[scene.id];
					// defineVideo checks this at module load, so reaching here means the
					// registry and the timing drifted apart afterwards. Fail loudly:
					// returning null would take the scene's body, caption and narration
					// down together inside a still-"successful" render.
					if (Body === undefined) {
						throw new Error(`${brand}: no body registered for scene "${scene.id}"`);
					}
					return (
						<Sequence
							key={scene.id}
							from={scene.startFrame}
							durationInFrames={scene.durationInFrames}
							premountFor={fps}
						>
							<Stage scene={scene} brand={brand} audioDir={audioDir}>
								<Body scene={scene} />
							</Stage>
						</Sequence>
					);
				})}
			</AbsoluteFill>
		);
	};
	return Explainer;
};
