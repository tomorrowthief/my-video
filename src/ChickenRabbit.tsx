import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { M0Pose } from "./scenes-math/M0Pose";
import { M1Table } from "./scenes-math/M1Table";
import { M2Assume } from "./scenes-math/M2Assume";
import { M3Lift } from "./scenes-math/M3Lift";
import { M4Converge } from "./scenes-math/M4Converge";
import { M5Outro } from "./scenes-math/M5Outro";
import { COLORS } from "./theme";
import timingJson from "./timing.math.json";
import type { SceneTiming, Timing } from "./types";

const timing = timingJson as unknown as Timing;

const BODIES: Record<string, React.FC<{ scene: SceneTiming }>> = {
	s0: M0Pose,
	s1: M1Table,
	s2: M2Assume,
	s3: M3Lift,
	s4: M4Converge,
	s5: M5Outro,
};

/**
 * 鸡兔同笼. Every scene sits at the absolute frame its narration starts, so the
 * audio timeline in timing.math.json is the only source of pacing: regenerating
 * the voice-over re-cuts the whole video.
 */
export const ChickenRabbit: React.FC = () => {
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
						<Stage scene={scene} brand="小学数学" audioDir="audio-math">
							<Body scene={scene} />
						</Stage>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const CR_TOTAL_FRAMES = timing.totalFrames;
