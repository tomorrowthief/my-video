import { Hero, Mono } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS } from "../theme";
import type { SceneTiming } from "../types";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { Timeline } from "./components/Timeline";

const LANES = [
	{
		title: "串行 requests",
		note: "请求一个等一个",
		blocks: [
			{ start: 0, end: 0.25, kind: "wait" as const, label: "req" },
			{ start: 0.25, end: 0.5, kind: "wait" as const, label: "req" },
			{ start: 0.5, end: 0.75, kind: "wait" as const, label: "req" },
			{ start: 0.75, end: 1, kind: "wait" as const, label: "req" },
		],
	},
	{
		title: "线程池",
		note: "四个线程一起等",
		blocks: [
			{ start: 0, end: 0.25, kind: "wait" as const, row: 0 },
			{ start: 0.02, end: 0.27, kind: "wait" as const, row: 1 },
			{ start: 0.04, end: 0.29, kind: "wait" as const, row: 2 },
			{ start: 0.06, end: 0.31, kind: "wait" as const, row: 3 },
		],
	},
	{
		title: "asyncio · 单线程",
		note: "一个线程，交错等",
		accent: COLORS.accent2,
		blocks: [
			{ start: 0, end: 0.14, kind: "busy" as const, label: "a" },
			{ start: 0.14, end: 0.3, kind: "wait" as const },
			{ start: 0.16, end: 0.32, kind: "busy" as const, label: "b" },
			{ start: 0.32, end: 0.48, kind: "wait" as const },
			{ start: 0.34, end: 0.5, kind: "busy" as const, label: "c" },
			{ start: 0.5, end: 0.66, kind: "wait" as const },
		],
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把 requests 串行脚本改成 httpx 异步并发", artifact: "同一批请求的耗时对比" },
	{ text: "故意在协程里调一次同步阻塞函数", artifact: "亲眼看到并发全部退化" },
];

export const P7Asyncio: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	const lit = active <= 2 ? 0 : active === 3 ? 1 : 2;
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
			<Hero size={42}>{scene.heading}</Hero>
			<Timeline scene={scene} lit={lit} lanes={LANES} />
			{active === 4 ? (
				<Mono size={22} color={COLORS.accent2}>
					↑ 一个线程，一样能并发——前提是每一步都真的在等 IO
				</Mono>
			) : null}
		</div>
	);
};
