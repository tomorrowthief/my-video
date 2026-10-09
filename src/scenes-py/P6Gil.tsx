import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { Timeline } from "./components/Timeline";

const LANES = [
	{
		title: "串行",
		note: "一个接一个",
		blocks: [
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T1" },
			{ start: 0.25, end: 0.5, kind: "busy" as const, label: "T2" },
			{ start: 0.5, end: 0.75, kind: "busy" as const, label: "T3" },
			{ start: 0.75, end: 1, kind: "busy" as const, label: "T4" },
		],
	},
	{
		title: "多线程 · CPU 密集",
		note: "抢同一把锁",
		blocks: [
			{ start: 0, end: 0.28, kind: "busy" as const, label: "T1" },
			{ start: 0.28, end: 0.62, kind: "busy" as const, label: "T2" },
			{ start: 0.62, end: 0.82, kind: "busy" as const, label: "T3" },
			{ start: 0.82, end: 1, kind: "busy" as const, label: "T4" },
		],
	},
	{
		title: "多线程 · IO 密集",
		note: "等的时候把锁放掉",
		blocks: [
			{ start: 0, end: 0.18, kind: "busy" as const, label: "T1" },
			{ start: 0.18, end: 0.4, kind: "wait" as const },
			{ start: 0.4, end: 0.58, kind: "busy" as const, label: "T2" },
			{ start: 0.58, end: 0.9, kind: "wait" as const },
			{ start: 0.9, end: 1, kind: "busy" as const, label: "T3" },
		],
	},
	{
		title: "多进程",
		note: "各跑各的解释器，绕开 GIL",
		blocks: [
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T1", row: 0 },
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T2", row: 1 },
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T3", row: 2 },
			{ start: 0, end: 0.25, kind: "busy" as const, label: "T4", row: 3 },
		],
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "同一任务用串行 / 线程 / 进程各跑一遍", artifact: "一张耗时对比表" },
	{ text: "CPU 密集和 IO 密集各做一次", artifact: "能说出「什么时候多线程真的有用」" },
];

export const P6Gil: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<Hero size={42}>{scene.heading}</Hero>
			<Timeline scene={scene} lit={Math.min(Math.max(active - 1, 0), 3)} lanes={LANES} />
		</div>
	);
};
