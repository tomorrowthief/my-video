import { Hero, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeInOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { LegBar } from "./components/Critters";
import { MATH_COLORS } from "./palette";

/** Each guess, and the paragraph it lands on. */
const ROWS = [
	{ chickens: 35, rabbits: 0, legs: 70, at: 1 },
	{ chickens: 30, rabbits: 5, legs: 80, at: 3 },
	{ chickens: 25, rabbits: 10, legs: 90, at: 4 },
	{ chickens: 23, rabbits: 12, legs: 94, at: 5 },
] as const;

const COLUMNS = "150px 150px 200px";

const HeadCell: React.FC<{ children: string; color?: string }> = ({ children, color = COLORS.faint }) => (
	<span style={{ fontFamily: FONT, fontSize: 21, letterSpacing: "0.16em", color }}>{children}</span>
);

export const M1Table: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);

	// The bar eases from the previous guess to the newest one that has landed,
	// so the climb towards 94 is felt as motion rather than read off the table.
	const shown = ROWS.filter((row) => active >= row.at);
	const current = shown.length > 0 ? shown[shown.length - 1] : undefined;
	const previous = shown.length >= 2 ? shown[shown.length - 2] : undefined;
	const slide =
		current === undefined
			? 0
			: easeInOut(since(frame, scene.paragraphs[current.at].startFrame, 20));
	const legs =
		current === undefined
			? 0
			: (previous?.legs ?? current.legs) + ((current.legs - (previous?.legs ?? current.legs)) * slide);
	const hit = current?.legs === 94 && slide > 0.9;

	// Paragraph 2 is where the narration says "not enough" — pulse the shortfall.
	const short = active === 2 ? 0.55 + Math.sin(frame / 6) * 0.45 : 0;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 36 }}>
			<Hero size={40}>
				最笨的办法：<span style={{ color: MATH_COLORS.key }}>一个一个试</span>
			</Hero>

			<div style={{ display: "flex", gap: 90, alignItems: "center" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
					<div style={{ display: "grid", gridTemplateColumns: COLUMNS, gap: 14, padding: "0 22px" }}>
						<HeadCell color={MATH_COLORS.chicken}>鸡</HeadCell>
						<HeadCell color={MATH_COLORS.rabbit}>兔</HeadCell>
						<HeadCell>脚</HeadCell>
					</div>

					{ROWS.map((row) =>
						active >= row.at ? (
							<Reveal key={row.rabbits} at={scene.paragraphs[row.at].startFrame} from="left">
								<div
									style={{
										display: "grid",
										gridTemplateColumns: COLUMNS,
										gap: 14,
										alignItems: "baseline",
										padding: "14px 22px",
										borderRadius: 12,
										background: row.legs === 94 ? `${MATH_COLORS.ok}14` : COLORS.panel,
										border: `1px solid ${row.legs === 94 ? MATH_COLORS.ok : COLORS.border}`,
									}}
								>
									<span style={{ fontFamily: MONO, fontSize: 34, color: MATH_COLORS.chicken }}>
										{row.chickens}
									</span>
									<span style={{ fontFamily: MONO, fontSize: 34, color: MATH_COLORS.rabbit }}>
										{row.rabbits}
									</span>
									<span
										style={{
											fontFamily: MONO,
											fontSize: 34,
											color:
												row.legs === 94
													? MATH_COLORS.ok
													: row.legs === 70 && short > 0
														? MATH_COLORS.key
														: COLORS.text,
											opacity: row.legs === 70 && short > 0 ? short : 1,
										}}
									>
										{row.legs}
										{row.legs === 94 ? "  ✓" : null}
									</span>
								</div>
							</Reveal>
						) : null,
					)}
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
					<LegBar value={legs} hit={hit} width={640} />

					{active >= 6 ? (
						<Reveal at={scene.paragraphs[6].startFrame} from="scale">
							<div
								style={{
									padding: "26px 34px",
									borderRadius: 16,
									background: MATH_COLORS.keySoft,
									border: `1px solid ${MATH_COLORS.key}`,
									boxShadow: `0 0 40px ${MATH_COLORS.key}22`,
								}}
							>
								<div style={{ fontFamily: FONT, fontSize: 21, letterSpacing: "0.16em", color: MATH_COLORS.key, marginBottom: 14 }}>
									你发现了吗
								</div>
								<div style={{ fontFamily: FONT, fontSize: 38, color: COLORS.text, lineHeight: 1.4 }}>
									每多 <span style={{ color: MATH_COLORS.rabbit }}>1 只兔</span>，
									脚多 <span style={{ color: MATH_COLORS.key }}>2 只</span>
								</div>
							</div>
						</Reveal>
					) : null}
				</div>
			</div>
		</div>
	);
};
