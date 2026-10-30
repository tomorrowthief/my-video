import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

const SpinningCircle: React.FC<{ frame: number }> = ({ frame }) => {
	const spin = frame * 1.2;
	return (
		<svg width={180} height={180} style={{ transform: `rotate(${spin}deg)` }}>
			<circle cx={90} cy={90} r={75} fill={GEO_COLORS.circle} />
			<circle cx={90} cy={30} r={10} fill={COLORS.bgDeep} />
		</svg>
	);
};

export const S1Circle: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const grow = easeOut(since(frame, 0, 24));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>
				<span style={{ color: GEO_COLORS.circle }}>圆形</span>
			</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<div style={{ transform: `scale(${0.3 + grow * 0.7})` }}>
					<SpinningCircle frame={frame} />
				</div>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><circle cx={20} cy={20} r={16} fill={GEO_COLORS.circle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>车轮</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><circle cx={20} cy={20} r={16} fill={GEO_COLORS.circle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>盘子</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><circle cx={20} cy={20} r={16} fill="#ffb347" /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>太阳</span>
							</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
