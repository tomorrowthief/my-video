import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给自己的类实现 3 个协议", artifact: "一个能 with、能迭代、能比较的类" },
	{ text: "读一遍官方 Data Model 章节", artifact: "一份「协议 → 触发场景」清单" },
];

export const P2DataModel: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "基础写法",
					note: "能跑",
					lines: [
						{ text: "n = len(items)" },
						{ text: "with open(path) as f:" },
						{ text: "    data = f.read()" },
						{ text: "total = a + b" },
						{ text: "for x in obj:" },
						{ text: "    process(x)" },
					],
				}}
				right={{
					title: "背后都是协议",
					note: "dunder 是接口约定，不是语法糖",
					lines: [
						{ text: "n = items.__len__()", mark: true },
						{ text: "f.__enter__() / f.__exit__()", mark: true },
						{ text: "    # 只要实现它，你的类也能进 with" },
						{ text: "total = a.__add__(b)", mark: true },
						{ text: "obj.__iter__() → __next__()", mark: true },
						{ text: "" },
					],
				}}
			/>
		</div>
	);
};
