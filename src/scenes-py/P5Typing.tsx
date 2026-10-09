import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给一个 200 行的脚本加全类型标注", artifact: "一个 mypy 能跑通的仓库" },
	{ text: "把类型检查接进编辑器", artifact: "日常开发实时标红，慢慢清零" },
];

export const P5Typing: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
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
					title: "够用的写法",
					note: "第一天就会",
					lines: [
						{ text: "def load(path: str) -> dict[str, int]:" },
						{ text: "    ..." },
						{ text: "" },
						{ text: "items: list[Item] = []" },
						{ text: "maybe: str | None = None" },
						{ text: "" },
						{ text: "# 不改变运行，是给工具和人看的", mark: true },
					],
				}}
				right={{
					title: "真正的门槛",
					note: "三样东西",
					lines: [
						{ text: 'T = TypeVar("T")', mark: true },
						{ text: "def first(xs: list[T]) -> T: ...", mark: true },
						{ text: "" },
						{ text: "class Reader(Protocol):", mark: true },
						{ text: "    def read(self, n: int) -> bytes: ...", mark: true },
						{ text: "    # 不继承，只要长得像 → 鸭子类型", mark: true },
						{ text: "" },
						{ text: 'Level = Literal["debug", "info"]', mark: true },
						{ text: "" },
						{ text: "mypy / pyright / ruff → 接进编辑器", mark: true },
					],
				}}
			/>
		</div>
	);
};
