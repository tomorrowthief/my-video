import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { EcosystemPicker } from "./components/EcosystemPicker";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const TRACKS = [
	{
		name: "Web",
		goal: "服务端接口",
		chain: ["FastAPI", "Pydantic", "SQLAlchemy", "部署"],
		accent: "#7d8cff",
		soft: "#1b2040",
	},
	{
		name: "数据",
		goal: "分析与处理",
		chain: ["pandas", "polars", "NumPy", "可视化"],
		accent: "#2fd3bd",
		soft: "#0e2b2b",
	},
	{
		name: "AI / Agent",
		goal: "模型应用",
		chain: ["模型 API", "流式", "向量检索", "工具循环"],
		accent: "#ffb454",
		soft: "#2e2210",
	},
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "写下一年最想做成的一件事", artifact: "一句话，越具体越好" },
	{ text: "反推选哪条路线", artifact: "选定后，用四步法把这条链过一遍" },
];

export const P11Ecosystem: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<EcosystemPicker
				scene={scene}
				tracks={TRACKS}
				lit={active === 0 ? -1 : Math.min(active - 1, 2)}
				pickAt={4}
			/>
		</div>
	);
};
