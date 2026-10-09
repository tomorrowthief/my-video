import { Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MATH_COLORS, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

/** A check line that writes itself in from the left, then gets its tick. */
const Check: React.FC<{ at: number; frame: number; children: React.ReactNode; faded: number }> = ({
	at,
	frame,
	children,
	faded,
}) => {
	const write = easeOut(since(frame, at, 26));
	const tick = easeOut(since(frame, at + 12, 14));
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 20, opacity: 1 - faded * 0.72 }}>
			<div
				style={{
					fontFamily: MONO,
					fontSize: 42,
					color: COLORS.text,
					clipPath: `inset(0 ${(1 - write) * 100}% 0 0)`,
				}}
			>
				{children}
			</div>
			<span
				style={{
					fontFamily: MONO,
					fontSize: 42,
					color: MATH_COLORS.ok,
					opacity: tick,
					scale: String(0.6 + tick * 0.4),
				}}
			>
				✓
			</span>
		</div>
	);
};

/** One of the ten vehicles in the practice problem — deliberately unreadable:
 *  how many wheels it has is exactly what the viewer has to work out. */
const Vehicle: React.FC = () => (
	<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
		<div
			style={{
				width: 62,
				height: 40,
				borderRadius: 10,
				border: `2px dashed ${MATH_COLORS.unknown}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: MONO,
				fontSize: 22,
				color: MATH_COLORS.unknown,
			}}
		>
			?
		</div>
		<div style={{ width: 40, height: 2, background: COLORS.border }} />
	</div>
);

export const M5Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const faded = active >= 2 ? easeOut(since(frame, scene.paragraphs[2].startFrame, 24)) : 0;

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				<Check at={scene.paragraphs[0].startFrame} frame={frame} faded={faded}>
					23 + 12 = <span style={{ color: MATH_COLORS.ok }}>35</span> 个头
				</Check>
				{active >= 1 ? (
					<Check at={scene.paragraphs[1].startFrame} frame={frame} faded={faded}>
						23 × 2 + 12 × 4 = <span style={{ color: MATH_COLORS.ok }}>94</span> 只脚
					</Check>
				) : null}
			</div>

			{active >= 2 ? (
				<Reveal at={scene.paragraphs[2].startFrame} from="scale">
					<div
						style={{
							padding: "32px 40px",
							borderRadius: 18,
							background: COLORS.panelHi,
							border: `1px solid ${MATH_COLORS.key}`,
							boxShadow: `0 0 44px ${MATH_COLORS.key}22`,
						}}
					>
						<div
							style={{
								fontFamily: FONT,
								fontSize: 21,
								letterSpacing: "0.18em",
								color: MATH_COLORS.key,
								marginBottom: 20,
							}}
						>
							换你了
						</div>

						{active >= 3 ? (
							<Reveal at={scene.paragraphs[3].startFrame}>
								<div style={{ display: "flex", alignItems: "center", gap: 40 }}>
									<div style={{ display: "flex", gap: 14 }}>
										{Array.from({ length: 10 }, (_, i) => (
											<Vehicle key={i} />
										))}
									</div>
									<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
										<span style={{ fontFamily: FONT, fontSize: 30, color: COLORS.text }}>
											自行车和三轮车，一共{" "}
											<span style={{ color: MATH_COLORS.key }}>10 辆</span>
										</span>
										<span style={{ fontFamily: FONT, fontSize: 30, color: COLORS.text }}>
											轮子一共 <span style={{ color: MATH_COLORS.key }}>26 个</span>
											。各有几辆？
										</span>
									</div>
								</div>
							</Reveal>
						) : null}

						{active >= 4 ? (
							<Reveal at={scene.paragraphs[4].startFrame} from="scale">
								<div
									style={{
										marginTop: 26,
										padding: "20px 28px",
										borderRadius: 14,
										background: MATH_COLORS.keySoft,
										border: `1px solid ${MATH_COLORS.key}`,
										fontFamily: FONT,
										fontSize: 34,
										color: COLORS.text,
									}}
								>
									小心 —— 这一次，每换一辆车，轮子只多{" "}
									<span style={{ color: MATH_COLORS.key }}>1 个</span>
								</div>
							</Reveal>
						) : null}
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
