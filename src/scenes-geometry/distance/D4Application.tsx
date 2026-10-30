import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const D4Application: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter1 = easeOut(since(frame, 0, 20));
	const enter2 = easeOut(since(frame, 15, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 36 }}>
			<Hero size={44}>用一用</Hero>

			<div style={{ display: "flex", gap: 60 }}>
				{/* Crosswalk */}
				<div style={{ opacity: enter1, transform: `scale(${0.6 + enter1 * 0.4})` }}>
					<svg width={180} height={120} viewBox="0 0 180 120">
						{/* road */}
						<rect x={0} y={20} width={180} height={80} fill={COLORS.panel} />
						{/* zebra crossing */}
						{[40, 70, 100, 130].map((x, i) => (
							<rect key={i} x={x} y={24} width={20} height={72} fill={COLORS.text} rx={2} />
						))}
						{/* person */}
						<circle cx={20} cy={10} r={10} fill={GEO_COLORS.line} />
						<rect x={12} y={20} width={16} height={20} rx={6} fill={GEO_COLORS.line} />
						{/* arrow */}
						<line x1={30} y1={12} x2={100} y2={12} stroke={GEO_COLORS.dimension} strokeWidth={3} markerEnd="url(#arrow)" />
					</svg>
				</div>

				{/* Room */}
				<div style={{ opacity: enter2, transform: `scale(${0.6 + enter2 * 0.4})` }}>
					<svg width={180} height={120} viewBox="0 0 180 120">
						<rect x={10} y={10} width={160} height={100} fill="none" stroke={COLORS.text} strokeWidth={3} rx={4} />
						<line x1={10} y1={110} x2={170} y2={110} stroke={GEO_COLORS.dimension} strokeWidth={4} />
						<text x={90} y={118} textAnchor="middle" fill={GEO_COLORS.dimension} fontSize={14}>量距离</text>
					</svg>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						距离，无处不在
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
