import manifest from "../videos.json";
import { makeExplainer, type SceneBodies } from "./components/Explainer";
import { M0Pose } from "./scenes-math/M0Pose";
import { M1Table } from "./scenes-math/M1Table";
import { M2Assume } from "./scenes-math/M2Assume";
import { M3Lift } from "./scenes-math/M3Lift";
import { M4Converge } from "./scenes-math/M4Converge";
import { M5Outro } from "./scenes-math/M5Outro";
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
// Geometry series
import { S0Intro as GS0Intro } from "./scenes-geometry/shapes/S0Intro";
import { S1Circle } from "./scenes-geometry/shapes/S1Circle";
import { S2Square } from "./scenes-geometry/shapes/S2Square";
import { S3Triangle } from "./scenes-geometry/shapes/S3Triangle";
import { S4Compare as GS4Compare } from "./scenes-geometry/shapes/S4Compare";
import { S5Outro as GS5Outro } from "./scenes-geometry/shapes/S5Outro";
import { D0Intro } from "./scenes-geometry/distance/D0Intro";
import { D1PointPoint } from "./scenes-geometry/distance/D1PointPoint";
import { D2PointLine } from "./scenes-geometry/distance/D2PointLine";
import { D3Parallel } from "./scenes-geometry/distance/D3Parallel";
import { D4Application } from "./scenes-geometry/distance/D4Application";
import { D5Outro } from "./scenes-geometry/distance/D5Outro";
import { X0Intro } from "./scenes-geometry/dimensions/X0Intro";
import { X1Line } from "./scenes-geometry/dimensions/X1Line";
import { X2Plane } from "./scenes-geometry/dimensions/X2Plane";
import { X3Solid } from "./scenes-geometry/dimensions/X3Solid";
import { X4Unfold } from "./scenes-geometry/dimensions/X4Unfold";
import { X5Outro } from "./scenes-geometry/dimensions/X5Outro";
import { M0Intro as GM0Intro } from "./scenes-geometry/measure/M0Intro";
import { M1Perimeter } from "./scenes-geometry/measure/M1Perimeter";
import { M2Area } from "./scenes-geometry/measure/M2Area";
import { M3Volume } from "./scenes-geometry/measure/M3Volume";
import { M4Compare } from "./scenes-geometry/measure/M4Compare";
import { M5Outro as GM5Outro } from "./scenes-geometry/measure/M5Outro";
import piTiming from "./timing.json";
import mathTiming from "./timing.math.json";
import pyTiming from "./timing.python.json";
import geoShapesTiming from "./timing.geo-shapes.json";
import geoDistanceTiming from "./timing.geo-distance.json";
import geoDimensionsTiming from "./timing.geo-dimensions.json";
import geoMeasureTiming from "./timing.geo-measure.json";
import type { Timing } from "./types";

export type VideoDef = {
	readonly key: string;
	readonly title: string;
	readonly brand: string;
	readonly folder: string;
	readonly timing: Timing;
	readonly Component: React.FC;
};

/**
 * Registers one video, checking its timing and its scene map against each
 * other at module load so a mismatch surfaces when Studio opens rather than
 * when playback reaches the broken scene.
 *
 * Both directions are checked on purpose: a renamed scene id leaves an
 * unrendered scene AND an orphaned component, and reporting only the first
 * would send you looking in the wrong place.
 */
const defineVideo = (
	key: keyof typeof manifest,
	timingJson: unknown,
	bodies: SceneBodies,
): VideoDef => {
	const entry = manifest[key];
	const timing = timingJson as Timing;
	const sceneIds = timing.scenes.map((scene) => scene.id);
	const missing = sceneIds.filter((id) => bodies[id] === undefined);
	const orphaned = Object.keys(bodies).filter((id) => !sceneIds.includes(id));
	if (missing.length > 0 || orphaned.length > 0) {
		throw new Error(
			`videos.ts: "${key}" is out of sync with ${entry.timing}.` +
				(missing.length > 0 ? ` Scenes with no component: ${missing.join(", ")}.` : "") +
				(orphaned.length > 0 ? ` Components with no scene: ${orphaned.join(", ")}.` : "") +
				` Timing has: ${sceneIds.join(", ")}.`,
		);
	}
	return {
		key,
		title: entry.title,
		brand: entry.brand,
		folder: entry.folder,
		timing,
		Component: makeExplainer(timing, entry.brand, entry.audio, bodies),
	};
};

/** Every video in the project. Add one here and in videos.json; nothing else. */
export const VIDEOS: readonly VideoDef[] = [
	defineVideo("pi-durable", piTiming, {
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
	}),
	defineVideo("python", pyTiming, {
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
	}),
	defineVideo("math", mathTiming, {
		s0: M0Pose,
		s1: M1Table,
		s2: M2Assume,
		s3: M3Lift,
		s4: M4Converge,
		s5: M5Outro,
	}),
	defineVideo("geo-shapes", geoShapesTiming, {
		s0: GS0Intro,
		s1: S1Circle,
		s2: S2Square,
		s3: S3Triangle,
		s4: GS4Compare,
		s5: GS5Outro,
	}),
	defineVideo("geo-distance", geoDistanceTiming, {
		s0: D0Intro,
		s1: D1PointPoint,
		s2: D2PointLine,
		s3: D3Parallel,
		s4: D4Application,
		s5: D5Outro,
	}),
	defineVideo("geo-dimensions", geoDimensionsTiming, {
		s0: X0Intro,
		s1: X1Line,
		s2: X2Plane,
		s3: X3Solid,
		s4: X4Unfold,
		s5: X5Outro,
	}),
	defineVideo("geo-measure", geoMeasureTiming, {
		s0: GM0Intro,
		s1: M1Perimeter,
		s2: M2Area,
		s3: M3Volume,
		s4: M4Compare,
		s5: GM5Outro,
	}),
];
