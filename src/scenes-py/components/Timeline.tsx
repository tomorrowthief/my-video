import { useCurrentFrame } from "remotion";
import { COLORS, FONT, MONO, easeInOut, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type TimelineLane = {
	readonly title: string;
	readonly note?: string;
	/** Each block spans [start, end] on a 0..1 scale, with a busy/wait kind. */
	readonly blocks: readonly {
		readonly start: number;
		readonly end: number;
		readonly kind: "busy" | "wait";
		readonly label?: string;
	}[];
	readonly accent?: string;
};

const KIND_COLORS = {
	busy: COLORS.accent,
	wait: COLORS.warn,
} as const;

/**
 * The concurrency motif: one lane per strategy (serial, threads, processes,
 * asyncio). Busy blocks are solid, waiting blocks are hatched — the shape of a
 * lane is the whole argument, so the lanes are worth reading before the words.
 */
export const Timeline: React.FC<{
	scene: SceneTiming;
	lanes: readonly TimelineLane[];
	/** Which lane is lit; driven by the scene's paragraph index. */
	lit: number;
	/** Scene-relative frame the lanes reveal at. Defaults to the first paragraph. */
	from?: number;
}> = ({ scene, lanes, lit, from }) => {
	const frame = useCurrentFrame();
	const track = 1180;
	const start = from ?? scene.paragraphs[0]?.startFrame ?? 0;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
			{lanes.map((lane, li) => {
				const accent = lane.accent ?? COLORS.accent;
				const on = li === lit;
				const p = easeOut(since(frame, start + li * 10, 14));
				return (
					<div
						key={lane.title}
						style={{
							opacity: p,
							display: "flex",
							alignItems: "center",
							gap: 22,
							background: on ? COLORS.panelHi : COLORS.panel,
							border: `1px solid ${on ? accent : COLORS.border}`,
							borderRadius: 14,
							padding: "20px 26px",
							boxShadow: on ? `0 0 30px ${accent}22` : "none",
						}}
					>
						<div style={{ flex: "0 0 250px", display: "flex", flexDirection: "column", gap: 6 }}>
							<span style={{ fontFamily: MONO, fontSize: 25, color: on ? accent : COLORS.dim }}>
								{lane.title}
							</span>
							{lane.note !== undefined ? (
								<span style={{ fontFamily: FONT, fontSize: 20, color: COLORS.faint }}>
									{lane.note}
								</span>
							) : null}
						</div>
						<div
							style={{
								position: "relative",
								flex: 1,
								height: 46,
								background: COLORS.bg,
								border: `1px solid ${COLORS.border}`,
								borderRadius: 8,
								overflow: "hidden",
							}}
						>
							{lane.blocks.map((block, bi) => {
								const grow = easeInOut(since(frame, start + li * 10 + bi * 6, 18));
								return (
									<div
										key={bi}
										style={{
											position: "absolute",
											top: 6,
											bottom: 6,
											left: `${block.start * 100}%`,
											width: `${(block.end - block.start) * 100 * grow}%`,
											background:
												block.kind === "busy"
													? `linear-gradient(180deg, ${KIND_COLORS.busy}, ${accent})`
													: `repeating-linear-gradient(45deg, ${KIND_COLORS.wait}55 0 6px, ${KIND_COLORS.wait}22 6px 12px)`,
											borderRadius: 5,
											display: "flex",
											alignItems: "center",
											paddingLeft: 10,
										}}
									>
										{block.label !== undefined ? (
											<span style={{ fontFamily: MONO, fontSize: 17, color: COLORS.bgDeep }}>
												{block.label}
											</span>
										) : null}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
			<div
				style={{
					marginLeft: 272,
					width: track,
					display: "flex",
					justifyContent: "space-between",
					fontFamily: MONO,
					fontSize: 18,
					color: COLORS.faint,
				}}
			>
				<span>0s</span>
				<span>时间 →</span>
			</div>
		</div>
	);
};
