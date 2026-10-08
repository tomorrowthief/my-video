import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { S0Hook } from "./scenes/S0Hook";
import { S1Layers } from "./scenes/S1Layers";
import { S2Invariants } from "./scenes/S2Invariants";
import { S3Commit } from "./scenes/S3Commit";
import { S4Poison } from "./scenes/S4Poison";
import { S5States } from "./scenes/S5States";
import { S6Tasks } from "./scenes/S6Tasks";
import { S7Chord } from "./scenes/S7Chord";
import { S8Storage } from "./scenes/S8Storage";
import { S9Outro } from "./scenes/S9Outro";
import { COLORS } from "./theme";
import timingJson from "./timing.json";
import type { SceneTiming, Timing } from "./types";

const timing = timingJson as unknown as Timing;

const BODIES: Record<string, React.FC<{ scene: SceneTiming }>> = {
	s0: S0Hook,
	s1: S1Layers,
	s2: S2Invariants,
	s3: S3Commit,
	s4: S4Poison,
	s5: S5States,
	s6: S6Tasks,
	s7: S7Chord,
	s8: S8Storage,
	s9: S9Outro,
};

/**
 * The full explainer. Every scene is placed at the absolute frame its narration
 * starts, so the audio timeline in timing.json is the single source of truth for
 * pacing: regenerating the voice-over re-cuts the whole video.
 */
export const PiDurable: React.FC = () => {
	const { fps } = useVideoConfig();
	return (
		<AbsoluteFill style={{ background: COLORS.bgDeep }}>
			{timing.scenes.map((scene) => {
				const Body = BODIES[scene.id];
				if (Body === undefined) return null;
				return (
					<Sequence
						key={scene.id}
						from={scene.startFrame}
						durationInFrames={scene.durationInFrames}
						premountFor={fps}
					>
						<Stage scene={scene}>
							<Body scene={scene} />
						</Stage>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const TOTAL_FRAMES = timing.totalFrames;
export const FPS = timing.fps;
export const DURATION_SECONDS = timing.totalSeconds;