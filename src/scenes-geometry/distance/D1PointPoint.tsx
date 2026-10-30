import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const D1PointPoint: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const draw = easeOut(since(frame, 0, 30));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>两点之间</Hero>

			<svg width={600} height={200} viewBox="0 0 600 200">
				{/* points */}
				<circle cx={80} cy={100} r={14} fill={GEO_COLORS.point} />
				<circle cx={520} cy={100} r={14} fill={GEO_COLORS.point} />

				{/* curved path */}
				<path
					d="M 80 100 Q 200 20 300 60 Q 400 100 520 100"
					fill="none"
					stroke={COLORS.faint}
					strokeWidth={3}
					strokeDasharray="8 4"
				/>
				{/* zigzag path */}
				<polyline
					points="80,100 180,40 280,140 380,50 520,100"
					fill="none"
					stroke={COLORS.faint}
					strokeWidth={3}
					strokeDasharray="8 4"
				/>
				{/* straight line (shortest) */}
				<line
					x1={80} y1={100} x2={80 + (520 - 80) * draw} y2={100}
					stroke={GEO_COLORS.line}
					strokeWidth={5}
					strokeLinecap="round"
				/>
			</svg>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.text, textAlign: "center" }}>
						最短的那条，永远是一条<span style={{ color: GEO_COLORS.line }}>直直的线段</span>
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
