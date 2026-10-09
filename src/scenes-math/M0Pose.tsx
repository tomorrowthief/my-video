import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT } from "../theme";
import type { SceneTiming } from "../types";

export const M0Pose: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
			<span style={{ fontFamily: FONT, fontSize: 40, color: COLORS.dim }}>
				{scene.title} · 第 {active + 1} / {scene.paragraphs.length} 句
			</span>
		</div>
	);
};
