import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const D2PointLine: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const draw = easeOut(since(frame, 0, 30));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>垂直最短</Hero>

			<svg width={600} height={240} viewBox="0 0 600 240">
				{/* horizontal line */}
				<line x1={40} y1={200} x2={560} y2={200} stroke={COLORS.text} strokeWidth={4} />

				{/* point above */}
				<circle cx={250} cy={50} r={14} fill={GEO_COLORS.point} />

				{/* oblique lines */}
				<line x1={250} y1={50} x2={100} y2={200} stroke={COLORS.faint} strokeWidth={2} strokeDasharray="6 4" />
				<line x1={250} y1={50} x2={450} y2={200} stroke={COLORS.faint} strokeWidth={2} strokeDasharray="6 4" />

				{/* perpendicular (shortest) */}
				<line
					x1={250} y1={50} x2={250} y2={50 + 150 * draw}
					stroke={GEO_COLORS.dimension}
					strokeWidth={5}
					strokeLinecap="round"
				/>

				{/* right angle marker */}
				{draw > 0.9 ? (
					<polyline
						points="250,185 265,185 265,200"
						fill="none"
						stroke={GEO_COLORS.dimension}
						strokeWidth={2}
					/>
				) : null}
			</svg>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.text, textAlign: "center" }}>
						最短的那条，和原来的线成<span style={{ color: GEO_COLORS.dimension }}>直角</span>
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
