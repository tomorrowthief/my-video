import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const M2Area: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const fill = easeOut(since(frame, 0, 30));
	const cells = Math.floor(fill * 16);

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>面积：铺一地</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<svg width={200} height={200} viewBox="0 0 200 200">
					<rect x={20} y={20} width={160} height={160} fill={COLORS.panel} rx={6} />
					{/* grid cells filling up */}
					{Array.from({ length: 16 }).map((_, i) => {
						const row = Math.floor(i / 4);
						const col = i % 4;
						return (
							<rect
								key={i}
								x={24 + col * 39}
								y={24 + row * 39}
								width={35}
								height={35}
								fill={GEO_COLORS.square}
								opacity={i < cells ? 0.6 : 0.1}
								rx={3}
							/>
						);
					})}
				</svg>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<div style={{ fontFamily: 'monospace', fontSize: 24, color: GEO_COLORS.square }}>长 × 宽</div>
							<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.dim }}>单位：平方厘米</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
