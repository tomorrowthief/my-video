import { Hero } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, MONO } from "../theme";
import { PracticeBox } from "./components/PracticeBox";
import type { SceneTiming } from "../types";

/** Smoke-test wiring for PracticeBox. Replaced by the real scene in Task 11. */
export const P2DataModel: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return (
			<PracticeBox
				scene={scene}
				at={5}
				items={[
					{ text: "给自己的类实现 3 个协议", artifact: "一个能 with、能迭代、能比较的类" },
					{ text: "读一遍 Data Model 文档章节", artifact: "一份协议清单笔记" },
				]}
			/>
		);
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<Hero>{scene.heading}</Hero>
			<span style={{ fontFamily: MONO, fontSize: 24, color: COLORS.faint }}>
				母题占位 · 第 {active + 1} 段
			</span>
		</div>
	);
};
