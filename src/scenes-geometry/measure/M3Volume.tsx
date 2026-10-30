import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const M3Volume: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const stack = easeOut(since(frame, 0, 30));
	const layers = Math.floor(stack * 4);

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>体积：装一箱</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<svg width={200} height={200} viewBox="0 0 200 200">
					{Array.from({ length: 4 }).map((_, layer) => (
						<g key={layer} opacity={layer < layers ? 0.7 : 0.15}>
							<rect
								x={30 + layer * 8}
								y={150 - layer * 32}
								width={120 - layer * 16}
								height={28}
								fill={GEO_COLORS.rectangle}
								rx={4}
							/>
						</g>
					))}
				</svg>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<div style={{ fontFamily: 'monospace', fontSize: 24, color: GEO_COLORS.rectangle }}>长 × 宽 × 高</div>
							<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.dim }}>单位：立方厘米</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
