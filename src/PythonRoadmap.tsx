import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Stage } from "./components/Stage";
import { P0Hook } from "./scenes-py/P0Hook";
import { P1Roadmap } from "./scenes-py/P1Roadmap";
import { P2DataModel } from "./scenes-py/P2DataModel";
import { P3Decorators } from "./scenes-py/P3Decorators";
import { P4Generators } from "./scenes-py/P4Generators";
import { P5Typing } from "./scenes-py/P5Typing";
import { P6Gil } from "./scenes-py/P6Gil";
import { P7Asyncio } from "./scenes-py/P7Asyncio";
import { P8Profiling } from "./scenes-py/P8Profiling";
import { P9Structure } from "./scenes-py/P9Structure";
import { P10Testing } from "./scenes-py/P10Testing";
import { P11Ecosystem } from "./scenes-py/P11Ecosystem";
import { P12Outro } from "./scenes-py/P12Outro";
import { COLORS } from "./theme";
import timingJson from "./timing.python.json";
import type { SceneTiming, Timing } from "./types";

const timing = timingJson as unknown as Timing;

const BODIES: Record<string, React.FC<{ scene: SceneTiming }>> = {
	p00: P0Hook,
	p01: P1Roadmap,
	p02: P2DataModel,
	p03: P3Decorators,
	p04: P4Generators,
	p05: P5Typing,
	p06: P6Gil,
	p07: P7Asyncio,
	p08: P8Profiling,
	p09: P9Structure,
	p10: P10Testing,
	p11: P11Ecosystem,
	p12: P12Outro,
};

/**
 * The python advanced roadmap explainer. Same contract as PiDurable: the audio
 * timeline in timing.python.json is the single source of truth for pacing, so
 * rewriting the narration re-cuts the whole video.
 */
export const PythonRoadmap: React.FC = () => {
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
						<Stage scene={scene} brand="python-roadmap" audioDir="audio-py">
							<Body scene={scene} />
						</Stage>
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const PY_TOTAL_FRAMES = timing.totalFrames;
export const PY_FPS = timing.fps;
export const PY_DURATION_SECONDS = timing.totalSeconds;