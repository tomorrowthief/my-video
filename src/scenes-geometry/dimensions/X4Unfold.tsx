import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X4Unfold: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const unfold = easeOut(since(frame, 0, 40));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>三维变二维</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				{/* folded box */}
				<div style={{ transform: `perspective(500px) rotateY(${(1 - unfold) * 30}deg)`, opacity: 1 - unfold * 0.3 }}>
					<svg width={120} height={120} viewBox="0 0 120 120">
						<rect x={10} y={10} width={100} height={100} fill={COLORS.warn} opacity={0.7} rx={4} />
						<rect x={20} y={20} width={80} height={80} fill={COLORS.warn} opacity={0.4} rx={4} />
					</svg>
				</div>

				{unfold > 0.3 ? (
					<div style={{ fontSize: 40, color: COLORS.accent2 }}>→</div>
				) : null}

				{/* unfolded net */}
				<div style={{ opacity: unfold, transform: `scale(${0.5 + unfold * 0.5})` }}>
					<svg width={240} height={180} viewBox="0 0 240 180">
						{/* cross-shaped net */}
						<rect x={80} y={10} width={80} height={80} fill={COLORS.accent2} opacity={0.5} rx={4} />
						<rect x={80} y={90} width={80} height={80} fill={COLORS.accent2} opacity={0.5} rx={4} />
						<rect x={10} y={90} width={80} height={80} fill={COLORS.accent2} opacity={0.5} rx={4} />
						<rect x={160} y={90} width={70} height={80} fill={COLORS.accent2} opacity={0.5} rx={4} />
					</svg>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						维度之间可以互相变换
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
