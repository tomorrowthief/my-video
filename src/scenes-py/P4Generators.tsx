import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把词频统计改成流式", artifact: "能吃几百兆日志、内存恒定的脚本" },
	{ text: "用 itertools 替掉手写循环", artifact: "一段用 groupby / islice / chain 的代码" },
];

export const P4Generators: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
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
					title: "一次性读",
					note: "文件多大，内存多大",
					lines: [
						{ text: "text = open(path).read()", mark: true },
						{ text: "counts = {}" },
						{ text: "for w in text.split():" },
						{ text: "    counts[w] = counts.get(w, 0) + 1" },
						{ text: "return sorted(counts.items()," },
						{ text: "              key=lambda kv: -kv[1])[:10]" },
					],
				}}
				right={{
					title: "惰性流式",
					note: "省内存，不省时间",
					lines: [
						{ text: "def lines(path):" },
						{ text: "    with open(path) as f:" },
						{ text: "        for line in f:" },
						{ text: "            yield line", mark: true },
						{ text: "" },
						{ text: "Counter(w for l in lines(p)" },
						{ text: "          for w in l.split())", mark: true },
						{ text: "" },
						{ text: "itertools.groupby / islice / chain", mark: true },
					],
				}}
			/>
		</div>
	);
};
