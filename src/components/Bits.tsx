import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";

/** Fade + rise entrance, starting at `at`. */
export const Reveal: React.FC<{
	at: number;
	frames?: number;
	children: ReactNode;
	style?: CSSProperties;
	from?: "left" | "bottom" | "scale";
}> = ({ at, frames = 14, children, style, from = "bottom" }) => {
	const frame = useCurrentFrame();
	const p = easeOut(since(frame, at, frames));
	const shift =
		from === "left"
			? { translate: `${(1 - p) * -28}px 0px` }
			: from === "scale"
				? { scale: 0.94 + p * 0.06 }
				: { translate: `0px ${(1 - p) * 22}px` };
	return <div style={{ opacity: p, ...shift, ...style }}>{children}</div>;
};

export const Panel: React.FC<{
	children: ReactNode;
	active?: boolean;
	accent?: string;
	style?: CSSProperties;
	pad?: string;
}> = ({ children, active = false, accent = COLORS.accent, style, pad = "22px 26px" }) => (
	<div
		style={{
			background: active ? COLORS.panelHi : COLORS.panel,
			border: `1px solid ${active ? accent : COLORS.border}`,
			borderRadius: 14,
			padding: pad,
			boxShadow: active ? `0 0 0 1px ${accent}44, 0 20px 50px rgba(0,0,0,0.45)` : "none",
			transition: "none",
			...style,
		}}
	>
		{children}
	</div>
);

export const Chip: React.FC<{
	children: ReactNode;
	color?: string;
	soft?: string;
	style?: CSSProperties;
}> = ({ children, color = COLORS.accent, soft = COLORS.accentSoft, style }) => (
	<span
		style={{
			fontFamily: MONO,
			fontSize: 20,
			color,
			background: soft,
			border: `1px solid ${COLORS.borderHi}`,
			borderRadius: 9,
			padding: "5px 13px",
			whiteSpace: "nowrap",
			...style,
		}}
	>
		{children}
	</span>
);

/** A box in a diagram. */
export const Node: React.FC<{
	children: ReactNode;
	active?: boolean;
	color?: string;
	mono?: boolean;
	size?: number;
	style?: CSSProperties;
}> = ({ children, active = false, color = COLORS.accent, mono = true, size = 24, style }) => (
	<div
		style={{
			fontFamily: mono ? MONO : FONT,
			fontSize: size,
			color: active ? color : COLORS.dim,
			background: active ? `${color}1c` : COLORS.panel,
			border: `1px solid ${active ? color : COLORS.border}`,
			borderRadius: 12,
			padding: "12px 22px",
			whiteSpace: "nowrap",
			boxShadow: active ? `0 0 26px ${color}33` : "none",
			...style,
		}}
	>
		{children}
	</div>
);

export const Arrow: React.FC<{ active?: boolean; size?: number; vertical?: boolean; label?: string }> = ({
	active = false,
	size = 26,
	vertical = false,
	label,
}) => (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			gap: 8,
			color: active ? COLORS.accent : COLORS.faint,
			fontFamily: MONO,
			fontSize: size,
			flexDirection: vertical ? "column" : "row",
			lineHeight: 1,
		}}
	>
		{label !== undefined ? <span style={{ fontSize: size * 0.7 }}>{label}</span> : null}
		<span>{vertical ? "↓" : "→"}</span>
	</div>
);

/** A row of items where the one at `active` is lit. */
export const Row: React.FC<{
	items: readonly ReactNode[];
	active: number;
	gap?: number;
	style?: CSSProperties;
}> = ({ items, active, gap = 14, style }) => (
	<div style={{ display: "flex", alignItems: "center", gap, ...style }}>
		{items.map((item, i) => (
			<span key={i} style={{ display: "flex", alignItems: "center", gap }}>
				{i > 0 ? <Arrow active={i <= active} /> : null}
				{item}
			</span>
		))}
	</div>
);

export const Mono: React.FC<{ children: ReactNode; size?: number; color?: string; style?: CSSProperties }> = ({
	children,
	size = 21,
	color = COLORS.text,
	style,
}) => <span style={{ fontFamily: MONO, fontSize: size, color, ...style }}>{children}</span>;

export const Label: React.FC<{ children: ReactNode; color?: string; style?: CSSProperties }> = ({
	children,
	color = COLORS.faint,
	style,
}) => (
	<span
		style={{
			fontFamily: FONT,
			fontSize: 19,
			letterSpacing: "0.16em",
			textTransform: "uppercase",
			color,
			...style,
		}}
	>
		{children}
	</span>
);

/** Big headline used at the top of a content area. */
export const Hero: React.FC<{ children: ReactNode; size?: number; color?: string; style?: CSSProperties }> = ({
	children,
	size = 46,
	color = COLORS.text,
	style,
}) => (
	<div
		style={{
			fontFamily: FONT,
			fontSize: size,
			fontWeight: 600,
			color,
			lineHeight: 1.3,
			letterSpacing: "-0.01em",
			...style,
		}}
	>
		{children}
	</div>
);

/** A bulleted list that lights up line by line as `active` advances. */
export const Bullets: React.FC<{
	items: readonly { text: ReactNode; note?: ReactNode }[];
	active: number;
	/** Items from this index on are shown in the alert colour. */
	alertFrom?: number;
	style?: CSSProperties;
}> = ({ items, active, alertFrom, style }) => (
	<div style={{ display: "flex", flexDirection: "column", gap: 14, ...style }}>
		{items.map((item, i) => {
			const on = i <= active;
			const isAlert = alertFrom !== undefined && i >= alertFrom;
			const color = isAlert ? COLORS.warn : COLORS.accent;
			return (
				<Reveal key={i} at={0} frames={1} style={{ opacity: 1 }}>
					<div
						style={{
							display: "flex",
							gap: 18,
							alignItems: "baseline",
							opacity: on ? 1 : 0.26,
							background: on ? `${color}12` : "transparent",
							border: `1px solid ${on ? `${color}55` : COLORS.border}`,
							borderRadius: 12,
							padding: "14px 22px",
						}}
					>
						<span
							style={{
								fontFamily: MONO,
								fontSize: 21,
								color,
								flex: "0 0 auto",
							}}
						>
							{i + 1}
						</span>
						<span style={{ fontFamily: FONT, fontSize: 27, color: COLORS.text, lineHeight: 1.45 }}>
							{item.text}
						</span>
						{item.note !== undefined ? (
							<span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 19, color: COLORS.dim }}>
								{item.note}
							</span>
						) : null}
					</div>
				</Reveal>
			);
		})}
	</div>
);