import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const S2Square: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const grow = easeOut(since(frame, 0, 24));
	const pulse = 0.95 + Math.sin(frame / 10) * 0.05;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>
				<span style={{ color: GEO_COLORS.square }}>正方形</span>
			</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<div style={{ transform: `scale(${0.3 + grow * 0.7})` }}>
					<svg width={160} height={160}>
						<rect
							x={10} y={10} width={140} height={140} rx={6}
							fill={GEO_COLORS.square}
							style={{ transform: `scale(${pulse})`, transformOrigin: "center" }}
						/>
						{/* side labels */}
						<text x={80} y={8} textAnchor="middle" fill={COLORS.dim} fontSize={16}>a</text>
						<text x={80} y={162} textAnchor="middle" fill={COLORS.dim} fontSize={16}>a</text>
						<text x={-4} y={84} textAnchor="middle" fill={COLORS.dim} fontSize={16}>a</text>
						<text x={164} y={84} textAnchor="middle" fill={COLORS.dim} fontSize={16}>a</text>
					</svg>
				</div>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><rect x={4} y={4} width={32} height={32} rx={2} fill={GEO_COLORS.square} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>手帕</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><rect x={4} y={4} width={32} height={32} rx={2} fill={GEO_COLORS.square} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>瓷砖</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><rect x={4} y={4} width={32} height={32} rx={2} fill={GEO_COLORS.square} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>魔方</span>
							</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
