import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const D5Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={48}>量一量</Hero>

			<div style={{ opacity: enter, display: "flex", gap: 40, justifyContent: "center" }}>
				<div style={{ textAlign: "center" }}>
					<svg width={60} height={60}>
						<line x1={10} y1={30} x2={50} y2={30} stroke={COLORS.accent2} strokeWidth={4} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.dim, marginTop: 8 }}>直线最短</div>
				</div>
				<div style={{ textAlign: "center" }}>
					<svg width={60} height={60}>
						<line x1={30} y1={10} x2={30} y2={50} stroke="#f472b6" strokeWidth={4} />
						<line x1={10} y1={50} x2={50} y2={50} stroke={COLORS.text} strokeWidth={3} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.dim, marginTop: 8 }}>垂直最短</div>
				</div>
				<div style={{ textAlign: "center" }}>
					<svg width={60} height={60}>
						<line x1={10} y1={20} x2={50} y2={20} stroke={COLORS.text} strokeWidth={3} />
						<line x1={10} y1={40} x2={50} y2={40} stroke={COLORS.text} strokeWidth={3} />
						<line x1={30} y1={20} x2={30} y2={40} stroke={COLORS.accent2} strokeWidth={3} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.dim, marginTop: 8 }}>处处等距</div>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.text, textAlign: "center" }}>
						拿起尺子，量量你身边各种距离吧！
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
