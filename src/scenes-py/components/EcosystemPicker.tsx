import { useCurrentFrame } from "remotion";
import { Label, Mono } from "../../components/Bits";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type Track = {
	readonly name: string;
	readonly goal: string;
	/** The learning chain, in order. */
	readonly chain: readonly string[];
	readonly accent: string;
	readonly soft: string;
};

/**
 * The ecosystem motif: three tracks side by side. `lit` picks which one is
 * highlighted, so the narration can walk Web → 数据 → AI and then land on one.
 */
export const EcosystemPicker: React.FC<{
	scene: SceneTiming;
	tracks: readonly Track[];
	lit: number;
	/** Paragraph index at which the "pick one" banner appears. */
	pickAt?: number;
}> = ({ scene, tracks, lit, pickAt }) => {
	const frame = useCurrentFrame();
	const pickStart = pickAt !== undefined ? (scene.paragraphs[pickAt]?.startFrame ?? 0) : Infinity;
	const showPick = frame >= pickStart;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
			<div style={{ display: "flex", gap: 24, flex: 1 }}>
				{tracks.map((track, i) => {
					const on = i === lit;
					const p = easeOut(since(frame, i * 12, 16));
					return (
						<div
							key={track.name}
							style={{
								flex: 1,
								opacity: lit >= 0 && !on ? 0.45 : p,
								background: on ? track.soft : COLORS.panel,
								border: `1px solid ${on ? track.accent : COLORS.border}`,
								borderRadius: 16,
								padding: "26px 28px",
								display: "flex",
								flexDirection: "column",
								gap: 18,
								boxShadow: on ? `0 0 38px ${track.accent}33` : "none",
								translate: on ? "0px -8px" : "0px 0px",
							}}
						>
							<div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
								<span
									style={{
										fontFamily: FONT,
										fontSize: 32,
										fontWeight: 600,
										color: track.accent,
									}}
								>
									{track.name}
								</span>
								<Mono size={18} color={COLORS.faint} style={{ marginLeft: "auto" }}>
									{track.goal}
								</Mono>
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								{track.chain.map((step, si) => {
									const sp = easeOut(since(frame, i * 12 + si * 8, 14));
									return (
										<div
											key={step}
											style={{
												opacity: sp,
												display: "flex",
												alignItems: "center",
												gap: 12,
												background: COLORS.bg,
												border: `1px solid ${COLORS.border}`,
												borderRadius: 10,
												padding: "12px 16px",
											}}
										>
											<span style={{ fontFamily: MONO, fontSize: 17, color: COLORS.faint }}>
												{si + 1}
											</span>
											<span style={{ fontFamily: MONO, fontSize: 22, color: COLORS.text }}>
												{step}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
			{showPick ? (
				<Label color={COLORS.ok} style={{ textAlign: "center" }}>
					选一条走完，胜过三条浅尝
				</Label>
			) : null}
		</div>
	);
};
