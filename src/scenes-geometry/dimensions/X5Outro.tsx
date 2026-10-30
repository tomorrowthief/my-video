import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const X5Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={48}>维度升级</Hero>

			<div style={{ opacity: enter, display: "flex", gap: 20, alignItems: "center" }}>
				<div style={{ textAlign: "center", padding: "16px 24px", background: COLORS.panel, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
					<svg width={80} height={20}><line x1={5} y1={10} x2={75} y2={10} stroke={COLORS.accent} strokeWidth={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: COLORS.dim, marginTop: 8 }}>一维 → 长度</div>
				</div>
				<div style={{ fontSize: 24, color: COLORS.accent2 }}>+</div>
				<div style={{ textAlign: "center", padding: "16px 24px", background: COLORS.panel, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
					<svg width={60} height={60}><rect x={5} y={5} width={50} height={50} fill={COLORS.accent2} opacity={0.5} rx={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: COLORS.dim, marginTop: 8 }}>二维 → +宽度</div>
				</div>
				<div style={{ fontSize: 24, color: COLORS.accent2 }}>+</div>
				<div style={{ textAlign: "center", padding: "16px 24px", background: COLORS.panel, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
					<svg width={60} height={60}><rect x={10} y={10} width={40} height={40} fill={COLORS.warn} opacity={0.5} rx={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 18, color: COLORS.dim, marginTop: 8 }}>三维 → +高度</div>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.text, textAlign: "center" }}>
						下次看到任何物体，想想它有几个维度吧！
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
