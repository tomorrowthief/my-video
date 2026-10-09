import { Hero, Mono } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS } from "../theme";
import type { SceneTiming } from "../types";

/** Placeholder for scene p03. Replaced in its own task. */
export const P3Decorators: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<Hero>{scene.heading}</Hero>
			<Mono size={24} color={COLORS.faint}>
				placeholder · paragraph {active + 1} / {scene.paragraphs.length}
			</Mono>
		</div>
	);
};
