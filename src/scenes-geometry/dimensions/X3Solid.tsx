import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X3Solid: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const rotate = easeOut(since(frame, 0, 40));
	const angle = rotate * 15;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>三维：加上高低</Hero>

			<div style={{ transform: `perspective(600px) rotateY(${angle}deg) rotateX(${-angle * 0.5}deg)` }}>
				<svg width={220} height={220} viewBox="0 0 220 220">
					{/* back face */}
					<rect x={40} y={30} width={120} height={120} fill={COLORS.warn} opacity={0.3} rx={4} />
					{/* front face */}
					<rect x={60} y={50} width={120} height={120} fill={COLORS.warn} opacity={0.7} rx={4} />
					{/* connecting edges */}
					<line x1={40} y1={30} x2={60} y2={50} stroke={COLORS.warn} strokeWidth={3} />
					<line x1={160} y1={30} x2={180} y2={50} stroke={COLORS.warn} strokeWidth={3} />
					<line x1={40} y1={150} x2={60} y2={170} stroke={COLORS.warn} strokeWidth={3} />
					<line x1={160} y1={150} x2={180} y2={170} stroke={COLORS.warn} strokeWidth={3} />
					{/* labels */}
					<text x={120} y={185} textAnchor="middle" fill={COLORS.dim} fontSize={18}>长</text>
					<text x={195} y={110} textAnchor="middle" fill={COLORS.dim} fontSize={18}>宽</text>
					<text x={30} y={110} textAnchor="middle" fill={COLORS.dim} fontSize={18}>高</text>
				</svg>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						我们生活的世界，就是三维的
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
