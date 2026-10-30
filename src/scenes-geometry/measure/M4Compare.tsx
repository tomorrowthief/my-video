import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const M4Compare: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter1 = easeOut(since(frame, 0, 20));
	const enter2 = easeOut(since(frame, 15, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 36 }}>
			<Hero size={44}>一维·二维·三维</Hero>

			<div style={{ display: "flex", gap: 40, alignItems: "center" }}>
				<div style={{ opacity: enter1, transform: `scale(${0.7 + enter1 * 0.3})`, textAlign: "center", padding: "20px 28px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<svg width={80} height={20}><line x1={5} y1={10} x2={75} y2={10} stroke={COLORS.accent} strokeWidth={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text, marginTop: 10 }}>周长</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>一维</div>
				</div>

				<div style={{ fontSize: 28, color: COLORS.accent2 }}>→</div>

				<div style={{ opacity: enter2, transform: `scale(${0.7 + enter2 * 0.3})`, textAlign: "center", padding: "20px 28px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<svg width={60} height={60}><rect x={5} y={5} width={50} height={50} fill={COLORS.accent2} opacity={0.5} rx={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text, marginTop: 10 }}>面积</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>二维</div>
				</div>

				<div style={{ fontSize: 28, color: COLORS.accent2 }}>→</div>

				<div style={{ opacity: enter2, transform: `scale(${0.7 + enter2 * 0.3})`, textAlign: "center", padding: "20px 28px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<svg width={60} height={70}><rect x={10} y={10} width={40} height={40} fill={COLORS.warn} opacity={0.5} rx={4} /><rect x={5} y={5} width={40} height={40} fill={COLORS.warn} opacity={0.3} rx={4} /></svg>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text, marginTop: 10 }}>体积</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>三维</div>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 26, color: COLORS.dim, textAlign: "center" }}>
						维度越高，量的东西越大
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
