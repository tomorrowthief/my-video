import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const S4Compare: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter1 = easeOut(since(frame, 0, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 36 }}>
			<Hero size={44}>长方形</Hero>

			<div style={{ display: "flex", gap: 50, alignItems: "center" }}>
				<div style={{ opacity: enter1, transform: `scale(${0.5 + enter1 * 0.5})` }}>
					<svg width={200} height={120}>
						<rect x={8} y={8} width={184} height={104} rx={6} fill={GEO_COLORS.rectangle} />
						<text x={100} y={70} textAnchor="middle" fill={COLORS.bgDeep} fontSize={20} fontFamily="monospace">长 × 宽</text>
					</svg>
				</div>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={50} height={30}><rect x={2} y={2} width={46} height={26} rx={3} fill={GEO_COLORS.rectangle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>书本</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={30} height={50}><rect x={2} y={2} width={26} height={46} rx={3} fill={GEO_COLORS.rectangle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>门</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={60} height={36}><rect x={2} y={2} width={56} height={32} rx={3} fill={GEO_COLORS.rectangle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>黑板</span>
							</div>
						</div>
					</Reveal>
				) : null}
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame + 30}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 22, color: COLORS.dim }}>
						对边一样长，像拉长的正方形
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
