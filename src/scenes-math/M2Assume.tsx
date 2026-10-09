import { Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MATH_COLORS, MONO, clamp01, easeInOut, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { CritterGrid, LegBar } from "./components/Critters";

const Eq: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
	children,
	size = 40,
	color = COLORS.text,
}) => <div style={{ fontFamily: MONO, fontSize: size, color, lineHeight: 1.3 }}>{children}</div>;

export const M2Assume: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);

	// The rule banner starts centred and large, then shrinks into a header strip
	// once the narration moves past it. One interpolation drives every property.
	const settle = easeInOut(since(frame, scene.paragraphs[1].startFrame, 24));
	const enter = easeOut(since(frame, scene.paragraphs[2].startFrame, 30));

	// The swap is this scene's payoff: twelve chickens turn into rabbits one at a
	// time, and the leg count rides along from 70 to 94.
	const swap = easeInOut(since(frame, scene.paragraphs[7].startFrame, 48));
	const rabbits = swap * 12;
	const legs = active >= 3 ? 70 + swap * 24 : 0;
	const gapPulse = active === 5 ? 0.5 + Math.sin(frame / 6) * 0.5 : active > 5 ? 1 : 0;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
			<div
				style={{
					alignSelf: settle > 0.5 ? "flex-start" : "center",
					marginTop: (1 - settle) * 150,
					padding: `${26 - settle * 12}px ${34 - settle * 12}px`,
					borderRadius: 16,
					background: MATH_COLORS.keySoft,
					border: `1px solid ${MATH_COLORS.key}`,
					fontFamily: FONT,
					fontSize: 44 - settle * 16,
					color: COLORS.text,
				}}
			>
				每多 <span style={{ color: MATH_COLORS.rabbit }}>1 只兔</span>，
				脚多 <span style={{ color: MATH_COLORS.key }}>2 只</span>
			</div>

			{active >= 2 ? (
				<div style={{ display: "flex", gap: 70, alignItems: "flex-start", opacity: enter }}>
					<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
						<span style={{ fontFamily: FONT, fontSize: 22, letterSpacing: "0.16em", color: COLORS.faint }}>
							{swap > 0.02 ? "换成兔子" : "假设：全是鸡"}
						</span>
						<CritterGrid count={35} rabbits={rabbits} enter={enter} size={52} columns={7} gap={16} />
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: 26, width: 700 }}>
						{active >= 3 ? (
							<Reveal at={scene.paragraphs[3].startFrame} from="left">
								<Eq>
									35 × 2 = <span style={{ color: MATH_COLORS.chicken }}>70</span> 只脚
								</Eq>
							</Reveal>
						) : null}

						{active >= 4 ? (
							<Reveal at={scene.paragraphs[4].startFrame} from="left">
								<Eq>
									实际 <span style={{ color: COLORS.text }}>94</span> 只脚
								</Eq>
							</Reveal>
						) : null}

						<LegBar value={legs} hit={swap > 0.98} width={640} />

						{active >= 5 ? (
							<div
								style={{
									padding: "20px 28px",
									borderRadius: 14,
									background: MATH_COLORS.keySoft,
									border: `1px solid ${MATH_COLORS.key}`,
									opacity: gapPulse,
								}}
							>
								<Eq size={38} color={MATH_COLORS.key}>
									94 − 70 = 24
								</Eq>
								<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.dim, marginTop: 10 }}>
									{active >= 6 ? "这 24 只脚，是兔子的" : "24 只脚不见了"}
								</div>
							</div>
						) : null}

						{active >= 7 ? (
							<Reveal at={scene.paragraphs[7].startFrame} from="scale">
								<Eq size={44} color={MATH_COLORS.rabbit}>
									24 ÷ 2 = {Math.round(clamp01(swap) * 12)} 只兔
								</Eq>
							</Reveal>
						) : null}

						{active >= 8 ? (
							<Reveal at={scene.paragraphs[8].startFrame} from="scale">
								<Eq size={44} color={MATH_COLORS.chicken}>
									35 − 12 = 23 只鸡
								</Eq>
							</Reveal>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
};
