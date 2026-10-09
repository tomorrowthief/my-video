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

const SCENE_IDS = [
	"p00",
	"p01",
	"p02",
	"p03",
	"p04",
	"p05",
	"p06",
	"p07",
	"p08",
	"p09",
	"p10",
	"p11",
	"p12",
] as const;
type SceneId = (typeof SCENE_IDS)[number];

// Total over SceneId on purpose: a scene whose component is missing, renamed or
// misspelled is a compile error here, not a blank scene at render time.
const BODIES: Record<SceneId, React.FC<{ scene: SceneTiming }>> = {
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

const isSceneId = (id: string): id is SceneId => SCENE_IDS.some((known) => known === id);

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
				// The scene list comes from timing.python.json, so an unknown id can only be
				// caught at runtime. Returning null here would take the scene's body, caption
				// and narration down together — a silent black hole in a still-"successful"
				// render. Fail loudly instead.
				const Body = isSceneId(scene.id) ? BODIES[scene.id] : undefined;
				if (Body === undefined) {
					throw new Error(
						`PythonRoadmap: no body registered for scene "${scene.id}" (known ids: ${SCENE_IDS.join(", ")})`,
					);
				}
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