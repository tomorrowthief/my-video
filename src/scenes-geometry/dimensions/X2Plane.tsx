import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X2Plane: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const grow = easeOut(since(frame, 0, 30));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>二维：有了宽窄</Hero>

			<div style={{ transform: `scale(${0.3 + grow * 0.7})` }}>
				<svg width={280} height={200} viewBox="0 0 280 200">
					<rect x={20} y={20} width={240} height={160} fill={COLORS.accent2} opacity={0.5} rx={8} />
					<line x1={20} y1={20} x2={260} y2={20} stroke={COLORS.accent2} strokeWidth={3} />
					<line x1={20} y1={180} x2={260} y2={180} stroke={COLORS.accent2} strokeWidth={3} />
					<text x={140} y={15} textAnchor="middle" fill={COLORS.dim} fontSize={18}>长</text>
					<text x={10} y={105} textAnchor="middle" fill={COLORS.dim} fontSize={18} transform="rotate(-90,10,105)">宽</text>
				</svg>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						一张纸，有长和宽，但没有厚度
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
