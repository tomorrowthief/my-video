import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const D3Parallel: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const slide = easeOut(since(frame, 0, 40));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>永远不相交</Hero>

			<svg width={600} height={200} viewBox="0 0 600 200">
				{/* parallel lines (like train tracks) */}
				<line x1={20} y1={60} x2={20 + 560 * slide} y2={60} stroke={COLORS.text} strokeWidth={4} />
				<line x1={20} y1={140} x2={20 + 560 * slide} y2={140} stroke={COLORS.text} strokeWidth={4} />

				{/* cross ties */}
				{[80, 160, 240, 320, 400, 480].map((x, i) => (
					x < 20 + 560 * slide ? (
						<line key={i} x1={x} y1={60} x2={x} y2={140} stroke={COLORS.faint} strokeWidth={3} />
					) : null
				))}

				{/* distance markers */}
				<line x1={500} y1={60} x2={500} y2={140} stroke={GEO_COLORS.dimension} strokeWidth={3} />
				<text x={520} y={105} fill={GEO_COLORS.dimension} fontSize={18}>等距</text>
			</svg>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.text, textAlign: "center" }}>
						它们之间的距离<span style={{ color: GEO_COLORS.dimension }}>处处相等</span>
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
