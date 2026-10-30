import { Hero, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export const M5Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const enter = easeOut(since(frame, 0, 20));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40 }}>
			<Hero size={48}>动手量</Hero>

			<div style={{ opacity: enter, display: "flex", gap: 30 }}>
				<div style={{ textAlign: "center", padding: "20px 24px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<div style={{ fontSize: 36, marginBottom: 8 }}>📏</div>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text }}>围一圈</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>周长</div>
				</div>
				<div style={{ textAlign: "center", padding: "20px 24px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<div style={{ fontSize: 36, marginBottom: 8 }}></div>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text }}>数格子</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>面积</div>
				</div>
				<div style={{ textAlign: "center", padding: "20px 24px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.border}` }}>
					<div style={{ fontSize: 36, marginBottom: 8 }}>🧱</div>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 20, color: COLORS.text }}>堆方块</div>
					<div style={{ fontFamily: 'monospace', fontSize: 16, color: COLORS.dim }}>体积</div>
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: '"PingFang SC", sans-serif', fontSize: 28, color: COLORS.text, textAlign: "center" }}>
						找三个盒子，量量它们的周长、面积和体积吧！
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
