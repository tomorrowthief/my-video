import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const M1Perimeter: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const draw = easeOut(since(frame, 0, 30));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>周长：围一圈</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<svg width={200} height={200} viewBox="0 0 200 200">
					<rect x={20} y={20} width={160} height={160} fill={COLORS.panel} rx={6} />
					{/* animated border */}
					<rect
						x={20} y={20} width={160} height={160}
						fill="none"
						stroke={GEO_COLORS.circle}
						strokeWidth={6}
						rx={6}
						strokeDasharray="640"
						strokeDashoffset={640 * (1 - draw)}
					/>
				</svg>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<div style={{ fontFamily: 'monospace', fontSize: 24, color: GEO_COLORS.circle }}>正方形：边 × 4</div>
							<div style={{ fontFamily: 'monospace', fontSize: 24, color: GEO_COLORS.rectangle }}>(长 + 宽) × 2</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
