import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const D0Intro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));
	const float = Math.sin(frame / 20) * 5;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 48 }}>
			<Hero size={52}>远近之间</Hero>

			<div style={{ opacity: enter, transform: `translateY(${float}px)` }}>
				<svg width={260} height={120}>
					{/* person */}
					<circle cx={50} cy={40} r={16} fill={COLORS.accent} />
					<rect x={38} y={56} width={24} height={44} rx={8} fill={COLORS.accent} />
					{/* mom */}
					<circle cx={200} cy={40} r={16} fill="#f472b6" />
					<rect x={188} y={56} width={24} height={44} rx={8} fill="#f472b6" />
					{/* distance arrow */}
					<line x1={72} y1={80} x2={188} y2={80} stroke={COLORS.accent2} strokeWidth={3} strokeDasharray="6 4" />
					<text x={130} y={100} textAnchor="middle" fill={COLORS.dim} fontSize={18}>距离？</text>
				</svg>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						今天，我们就来聊聊「距离」这件事
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
