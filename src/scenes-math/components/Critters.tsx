import type { CSSProperties } from "react";
import { interpolateColors } from "remotion";
import { MATH_COLORS, MONO, clamp01, easeOut } from "../../theme";

/**
 * One animal. `morph` 0 is a chicken (round, warm yellow, two feet), 1 is a
 * rabbit (rounded square, lilac, four feet); fractional values are mid-swap and
 * get a small pop so the change is felt, not just seen. `unknown` is the state
 * the problem actually starts in — we do not yet know what this animal is.
 */
export const Critter: React.FC<{
	morph?: number;
	/** 0..1, lifts exactly two feet off the ground. */
	lift?: number;
	size?: number;
	unknown?: boolean;
	dim?: boolean;
	style?: CSSProperties;
}> = ({ morph = 0, lift = 0, size = 56, unknown = false, dim = false, style }) => {
	const m = clamp01(morph);
	const body = unknown
		? "transparent"
		: interpolateColors(m, [0, 1], [MATH_COLORS.chicken, MATH_COLORS.rabbit]);
	const feet = unknown ? 0 : m > 0.5 ? 4 : 2;
	const pop = 1 + Math.sin(m * Math.PI) * 0.14;
	const foot = Math.max(6, Math.round(size * 0.13));
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: foot * 0.6,
				opacity: dim ? 0.3 : 1,
				...style,
			}}
		>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: `${50 - m * 24}%`,
					background: body,
					border: unknown ? `2px dashed ${MATH_COLORS.unknown}` : "none",
					boxShadow: unknown ? "none" : `0 0 ${size * 0.4}px ${body}55`,
					scale: String(pop),
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: MONO,
					fontSize: size * 0.45,
					color: MATH_COLORS.unknown,
				}}
			>
				{unknown ? "?" : null}
			</div>
			<div style={{ display: "flex", gap: foot * 0.7, height: foot }}>
				{Array.from({ length: feet }, (_, i) => {
					const up = i < 2 ? clamp01(lift) : 0;
					return (
						<span
							key={i}
							style={{
								width: foot,
								height: foot,
								borderRadius: "50%",
								background: MATH_COLORS.foot,
								opacity: 1 - up * 0.75,
								translate: `0px ${-up * size * 0.75}px`,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

/**
 * The 35 animals. Rabbits fill in from the end of the grid, so a fractional
 * `rabbits` animates one swap at a time instead of all of them at once.
 * `enter` 0..1 staggers them in.
 */
export const CritterGrid: React.FC<{
	count?: number;
	rabbits?: number;
	enter?: number;
	lift?: number;
	size?: number;
	columns?: number;
	unknown?: boolean;
	gap?: number;
}> = ({
	count = 35,
	rabbits = 0,
	enter = 1,
	lift = 0,
	size = 56,
	columns = 7,
	unknown = false,
	gap = 20,
}) => (
	<div
		style={{
			display: "grid",
			gridTemplateColumns: `repeat(${columns}, ${size}px)`,
			gap,
			justifyContent: "start",
		}}
	>
		{Array.from({ length: count }, (_, i) => {
			const t = easeOut(clamp01((enter * (count + 8) - i) / 8));
			const morph = clamp01(rabbits - (count - 1 - i));
			return (
				<div key={i} style={{ opacity: t, scale: String(0.6 + t * 0.4) }}>
					<Critter morph={morph} lift={lift} size={size} unknown={unknown} />
				</div>
			);
		})}
	</div>
);

/**
 * A dense row of foot dots. `shown` reveals them progressively; `lifted`
 * raises and fades the first N, which is the whole point of the whistle scene.
 * `paired` tints the dots just past the lifted ones in rabbit lilac.
 */
export const FootDots: React.FC<{
	count?: number;
	shown?: number;
	lifted?: number;
	paired?: number;
	perRow?: number;
	dot?: number;
	gap?: number;
}> = ({ count = 94, shown = count, lifted = 0, paired = 0, perRow = 47, dot = 16, gap = 8 }) => (
	<div style={{ display: "flex", flexDirection: "column", gap }}>
		{Array.from({ length: Math.ceil(count / perRow) }, (_, row) => (
			<div key={row} style={{ display: "flex", gap }}>
				{Array.from({ length: Math.min(perRow, count - row * perRow) }, (_, col) => {
					const i = row * perRow + col;
					const vis = clamp01(shown - i);
					const up = clamp01(lifted - i);
					const isPaired = i >= lifted && i < lifted + paired;
					return (
						<span
							key={col}
							style={{
								width: dot,
								height: dot,
								borderRadius: "50%",
								background: isPaired ? MATH_COLORS.rabbit : MATH_COLORS.foot,
								opacity: vis * (1 - up * 0.82),
								translate: `0px ${-up * 70}px`,
								boxShadow: isPaired ? `0 0 10px ${MATH_COLORS.rabbit}99` : "none",
							}}
						/>
					);
				})}
			</div>
		))}
	</div>
);

/**
 * Leg count on a 0..140 scale — 70 is all chickens, 140 all rabbits — with a
 * tick at the 94 we are aiming for. Showing the full range is deliberate: it
 * makes "70 is the floor" visible rather than asserted.
 */
export const LegBar: React.FC<{
	value: number;
	target?: number;
	max?: number;
	width?: number;
	hit?: boolean;
}> = ({ value, target = 94, max = 140, width = 620, hit = false }) => {
	const pct = clamp01(value / max) * 100;
	const tick = clamp01(target / max) * 100;
	const gap = target - value;
	return (
		<div style={{ width }}>
			<div
				style={{
					position: "relative",
					height: 26,
					borderRadius: 13,
					background: MATH_COLORS.keySoft,
					border: `1px solid ${MATH_COLORS.key}33`,
				}}
			>
				<div
					style={{
						width: `${pct}%`,
						height: "100%",
						borderRadius: 13,
						background: hit ? MATH_COLORS.ok : MATH_COLORS.chicken,
						boxShadow: hit ? `0 0 24px ${MATH_COLORS.ok}88` : "none",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: `${tick}%`,
						top: -10,
						bottom: -10,
						width: 3,
						background: hit ? MATH_COLORS.ok : MATH_COLORS.key,
						boxShadow: `0 0 16px ${hit ? MATH_COLORS.ok : MATH_COLORS.key}`,
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginTop: 10,
					fontFamily: MONO,
					fontSize: 21,
				}}
			>
				<span style={{ color: MATH_COLORS.foot }}>{Math.round(value)} 只脚</span>
				<span style={{ color: hit ? MATH_COLORS.ok : MATH_COLORS.key }}>
					{hit ? `命中 ${target}` : `还差 ${Math.round(gap)}`}
				</span>
			</div>
		</div>
	);
};
