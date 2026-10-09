import { Hero, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, clamp01, easeInOut, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { CritterGrid } from "./components/Critters";
import { MATH_COLORS } from "./palette";

const DOT = 20;
const GAP = 11;
/** 14 divides 70, so the lifted feet are exactly the first five rows and the 24
 *  survivors land as a clean 14 + 10 block instead of being split mid-row. */
const PER_ROW = 14;
const ROW_H = DOT + 10 + GAP;
const LIFTED_ROWS = 5;

/**
 * The 94 feet, drawn below a ground line. The first `lifted` of them rise and
 * fade on the whistle; whatever is left on the ground is, by construction, the
 * rabbits' back feet. `paired` brackets the survivors two at a time, and the
 * emptied rows collapse so the survivors end up tucked under the ground line.
 */
const Ground: React.FC<{ lifted: number; paired: number; chickenTint: number; collapse: number }> = ({
	lifted,
	paired,
	chickenTint,
	collapse,
}) => (
	<div style={{ height: ROW_H * 2.4, overflow: "hidden" }}>
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: GAP,
				translate: `0px ${-collapse * LIFTED_ROWS * ROW_H}px`,
			}}
		>
			{Array.from({ length: Math.ceil(94 / PER_ROW) }, (_, row) => (
				<div key={row} style={{ display: "flex", gap: GAP, alignItems: "flex-end", height: DOT + 10 }}>
					{Array.from({ length: Math.min(PER_ROW, 94 - row * PER_ROW) }, (_, col) => {
						const i = row * PER_ROW + col;
						const up = clamp01(lifted - i);
						const onGround = i >= lifted;
						const isPaired = onGround && i < lifted + paired;
						// Pairs are bracketed by rounding each pair's dots towards each
						// other, which reads as "these two belong to one rabbit".
						const pairLeft = isPaired && (i - Math.floor(lifted)) % 2 === 0;
						return (
							<span
								key={col}
								style={{
									width: DOT,
									height: DOT,
									borderRadius: isPaired
										? pairLeft
											? "50% 20% 20% 50%"
											: "20% 50% 50% 20%"
										: "50%",
									background: up > 0
										? MATH_COLORS.chicken
										: isPaired
											? MATH_COLORS.rabbit
											: MATH_COLORS.foot,
									opacity: up > 0 ? (1 - up) * (0.4 + chickenTint * 0.6) : 1,
									translate: `0px ${-up * 104}px`,
									boxShadow: isPaired ? `0 0 12px ${MATH_COLORS.rabbit}aa` : "none",
								}}
							/>
						);
					})}
				</div>
			))}
		</div>
	</div>
);

export const M3Lift: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);

	const settle = easeOut(since(frame, scene.paragraphs[1].startFrame, 26));
	// The whistle: one ring expands and dies, and the animals bob once.
	const whistle = since(frame, scene.paragraphs[2].startFrame, 22);
	const bob = Math.sin(clamp01(whistle) * Math.PI) * 14;
	const lift = easeInOut(since(frame, scene.paragraphs[3].startFrame, 34));
	// Paragraph 5 is "the chickens' feet are all up" — tint the risen ones.
	const chickenTint = active >= 5 ? easeOut(since(frame, scene.paragraphs[5].startFrame, 18)) : 0;
	const pair = active >= 7 ? easeInOut(since(frame, scene.paragraphs[7].startFrame, 40)) : 0;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<Hero size={40}>
				还有一个<span style={{ color: MATH_COLORS.key }}>更妙的办法</span>
			</Hero>

			{active >= 1 ? (
				<div style={{ display: "flex", gap: 70, alignItems: "center", opacity: settle }}>
					<div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
						<div style={{ translate: `0px ${-bob}px` }}>
							<CritterGrid count={35} unknown size={40} columns={12} gap={12} />
						</div>

						{whistle > 0 && whistle < 1 ? (
							<div
								style={{
									position: "absolute",
									left: "50%",
									top: 50,
									width: 120,
									height: 120,
									marginLeft: -60,
									borderRadius: "50%",
									border: "2px solid #ffffff",
									scale: String(0.2 + whistle * 3.4),
									opacity: (1 - whistle) * 0.45,
								}}
							/>
						) : null}

						{/* Air: the lifted feet rise into this gap and vanish before they
						    reach the animals, so the two never overlap. */}
						<div style={{ height: 124 }} />

						<div style={{ height: 2, background: COLORS.borderHi, width: "100%" }} />
						<div style={{ height: 22 }} />

						<Ground
							lifted={lift * 70}
							paired={pair * 24}
							chickenTint={chickenTint}
							collapse={lift}
						/>
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: 24, width: 560 }}>
						{active >= 2 ? (
							<Reveal at={scene.paragraphs[2].startFrame} from="left">
								<div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.dim }}>
									所有动物，<span style={{ color: COLORS.text }}>抬起两只脚</span>
								</div>
							</Reveal>
						) : null}

						{active >= 3 ? (
							<Reveal at={scene.paragraphs[3].startFrame} from="left">
								<div style={{ fontFamily: MONO, fontSize: 38, color: MATH_COLORS.chicken }}>
									抬起 35 × 2 = {Math.round(lift * 70)}
								</div>
							</Reveal>
						) : null}

						{active >= 4 ? (
							<Reveal at={scene.paragraphs[4].startFrame} from="scale">
								<div
									style={{
										padding: "22px 30px",
										borderRadius: 14,
										background: MATH_COLORS.keySoft,
										border: `1px solid ${MATH_COLORS.key}`,
									}}
								>
									<div style={{ fontFamily: MONO, fontSize: 38, color: MATH_COLORS.key }}>
										94 − 70 = 24
									</div>
									<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.dim, marginTop: 10 }}>
										{active >= 6 ? "地上的脚，全是兔子的" : "地上还剩 24 只脚"}
									</div>
								</div>
							</Reveal>
						) : null}

						{active >= 5 ? (
							<Reveal at={scene.paragraphs[5].startFrame} from="left">
								<div style={{ fontFamily: FONT, fontSize: 27, color: COLORS.dim, lineHeight: 1.5 }}>
									鸡只有 <span style={{ color: MATH_COLORS.chicken }}>两只脚</span>
									，已经全抬起来了
								</div>
							</Reveal>
						) : null}

						{active >= 7 ? (
							<Reveal at={scene.paragraphs[7].startFrame} from="scale">
								<div style={{ fontFamily: MONO, fontSize: 46, color: MATH_COLORS.rabbit }}>
									24 ÷ 2 = {Math.round(pair * 12)} 只兔
								</div>
							</Reveal>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
};
