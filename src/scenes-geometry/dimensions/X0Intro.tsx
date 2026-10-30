import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X0Intro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));
	const float = Math.sin(frame / 18) * 5;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 48 }}>
			<Hero size={52}>从线到体</Hero>

			<div style={{ display: "flex", gap: 40, opacity: enter, transform: `translateY(${float}px)` }}>
				{/* line */}
				<svg width={100} height={40}>
					<line x1={10} y1={20} x2={90} y2={20} stroke={COLORS.accent} strokeWidth={4} />
				</svg>
				{/* plane */}
				<svg width={80} height={80}>
					<rect x={8} y={8} width={64} height={64} fill={COLORS.accent2} opacity={0.6} rx={4} />
				</svg>
				{/* solid */}
				<svg width={80} height={80}>
					<rect x={12} y={12} width={56} height={56} fill={COLORS.warn} opacity={0.6} rx={4} />
					<rect x={4} y={4} width={56} height={56} fill={COLORS.warn} opacity={0.3} rx={4} />
				</svg>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						它们住在不同的维度里，今天我们就来探险
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
