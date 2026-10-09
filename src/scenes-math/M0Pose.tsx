import { Chip, Hero, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { CritterGrid, FootDots } from "./components/Critters";
import { MATH_COLORS } from "./palette";

const Counter: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
	<div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
		<span style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim }}>{label}</span>
		<span style={{ fontFamily: MONO, fontSize: 52, color, lineHeight: 1 }}>{value}</span>
	</div>
);

export const M0Pose: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const heads = easeOut(since(frame, scene.paragraphs[1].startFrame, 34));
	const feet = since(frame, scene.paragraphs[2].startFrame, 46);
	// The chip pulses so the pause for guessing reads as an invitation.
	const pulse = 0.72 + Math.sin(frame / 7) * 0.28;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
			<Hero size={44}>
				笼子里有<span style={{ color: MATH_COLORS.chicken }}>鸡</span>，也有
				<span style={{ color: MATH_COLORS.rabbit }}>兔子</span>
			</Hero>

			<div style={{ display: "flex", gap: 40, alignItems: "center", justifyContent: "space-between" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					<Counter
						label="头"
						value={active >= 1 ? String(Math.round(heads * 35)) : "?"}
						color={active >= 1 ? COLORS.text : COLORS.faint}
					/>
					<CritterGrid count={35} enter={heads} unknown size={56} columns={7} gap={18} />
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					<Counter
						label="脚"
						value={active >= 2 ? String(Math.round(feet * 94)) : "?"}
						color={active >= 2 ? COLORS.text : COLORS.faint}
					/>
					<FootDots count={94} shown={feet * 94} perRow={12} dot={24} gap={13} />
				</div>

				{active >= 3 ? (
					<Reveal at={scene.paragraphs[3].startFrame} from="left">
						<div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
							<Counter label="鸡" value="?" color={MATH_COLORS.chicken} />
							<Counter label="兔" value="?" color={MATH_COLORS.rabbit} />
							{active >= 4 ? (
								<Chip
									color={MATH_COLORS.key}
									soft={MATH_COLORS.keySoft}
									style={{ fontSize: 28, padding: "12px 26px", opacity: pulse }}
								>
									先猜一猜
								</Chip>
							) : null}
						</div>
					</Reveal>
				) : (
					<div style={{ width: 220 }} />
				)}
			</div>
		</div>
	);
};
