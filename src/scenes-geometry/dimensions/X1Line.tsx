import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X1Line: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const draw = easeOut(since(frame, 0, 30));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>一维：只有长短</Hero>

			<svg width={600} height={160} viewBox="0 0 600 160">
				{/* number line */}
				<line x1={40} y1={80} x2={40 + 520 * draw} y2={80} stroke={COLORS.accent} strokeWidth={5} strokeLinecap="round" />
				{[0, 1, 2, 3, 4, 5].map((i) => (
					40 + i * 104 < 40 + 520 * draw ? (
						<line key={i} x1={40 + i * 104} y1={70} x2={40 + i * 104} y2={90} stroke={COLORS.accent} strokeWidth={3} />
					) : null
				))}
				{/* arrow */}
				{draw > 0.95 ? (
					<polygon points={`${40 + 520 * draw},74 ${40 + 520 * draw + 16},80 ${40 + 520 * draw},86`} fill={COLORS.accent} />
				) : null}
			</svg>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						一根绳子，只有长度，没有宽和高
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
