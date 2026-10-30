import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const S0Intro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));
	const float = Math.sin(frame / 18) * 6;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 48 }}>
			<Hero size={52}>形状的世界</Hero>

			<div style={{ display: "flex", gap: 36, opacity: enter, translate: `0px ${float}px` }}>
				<svg width={72} height={72}><circle cx={36} cy={36} r={30} fill={GEO_COLORS.circle} /></svg>
				<svg width={72} height={72}><rect x={6} y={6} width={60} height={60} rx={4} fill={GEO_COLORS.square} /></svg>
				<svg width={72} height={72}><polygon points="36,6 66,60 6,60" fill={GEO_COLORS.triangle} /></svg>
				<svg width={84} height={60}><rect x={4} y={4} width={76} height={52} rx={4} fill={GEO_COLORS.rectangle} /></svg>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.dim, textAlign: "center" }}>
						我们一起来认识几个最常见的好朋友
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
