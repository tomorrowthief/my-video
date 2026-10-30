import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";
import { GEO_COLORS } from "../palette";

export const S3Triangle: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const grow = easeOut(since(frame, 0, 24));
	const bounce = Math.sin(frame / 8) * 4;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={44}>
				<span style={{ color: GEO_COLORS.triangle }}>三角形</span>
			</Hero>

			<div style={{ display: "flex", gap: 60, alignItems: "center" }}>
				<div style={{ transform: `scale(${0.3 + grow * 0.7})` }}>
					<svg width={180} height={160} style={{ translate: `0px ${bounce}px` }}>
						<polygon points="90,10 170,140 10,140" fill={GEO_COLORS.triangle} />
						<text x={90} y={158} textAnchor="middle" fill={COLORS.dim} fontSize={16}>底</text>
					</svg>
				</div>

				{active >= 1 ? (
					<Reveal at={scene.paragraphs[1].startFrame}>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><polygon points="20,6 36,34 4,34" fill={GEO_COLORS.triangle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>屋顶</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><polygon points="20,6 36,34 4,34" fill={GEO_COLORS.triangle} /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>三角尺</span>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<svg width={40} height={40}><polygon points="20,6 36,34 4,34" fill="#f4a460" /></svg>
								<span style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 24, color: COLORS.text }}>三明治</span>
							</div>
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
