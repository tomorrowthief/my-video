import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const M0Intro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));
	const bounce = Math.sin(frame / 12) * 4;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 48 }}>
			<Hero size={52}>量一量</Hero>

			<div style={{ display: "flex", gap: 30, opacity: enter, transform: `translateY(${bounce}px)` }}>
				<div style={{ textAlign: "center" }}>
					<svg width={80} height={60}>
						<rect x={5} y={10} width={70} height={40} fill="none" stroke={GEO_COLORS.circle} strokeWidth={3} rx={4} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: GEO_COLORS.circle, marginTop: 6 }}>围一圈？</div>
				</div>
				<div style={{ textAlign: "center" }}>
					<svg width={60} height={60}>
						<rect x={5} y={5} width={50} height={50} fill={GEO_COLORS.square} opacity={0.4} rx={4} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: GEO_COLORS.square, marginTop: 6 }}>铺一地？</div>
				</div>
				<div style={{ textAlign: "center" }}>
					<svg width={60} height={70}>
						<rect x={10} y={10} width={40} height={40} fill={GEO_COLORS.rectangle} opacity={0.4} rx={4} />
						<rect x={5} y={5} width={40} height={40} fill={GEO_COLORS.rectangle} opacity={0.2} rx={4} />
					</svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: GEO_COLORS.rectangle, marginTop: 6 }}>装一箱？</div>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						周长 · 面积 · 体积
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
