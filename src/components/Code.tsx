import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, MONO, easeOut, since } from "../theme";

const TONE = {
	comment: COLORS.faint,
	string: COLORS.warn,
	keyword: "#b39dff",
	number: COLORS.accent2,
	call: COLORS.accent,
	plain: COLORS.text,
} as const;

const TOKEN =
	/(\/\/[^\n]*)|(`[^`]*`|"[^"]*"|'[^']*')|\b(const|let|var|function|return|if|else|await|async|new|throw|class|extends|for|of|in|typeof|instanceof|import|from|export|type|interface|as|null|undefined|true|false|this|void|readonly|private)\b|\b(\d[\w.]*)\b|([A-Za-z_$][\w$]*)(?=\s*\()/g;

/** Minimal TS/JSON tokeniser. Display only: it never needs to be exact. */
const highlight = (line: string): ReactNode[] => {
	const out: ReactNode[] = [];
	let last = 0;
	let key = 0;
	TOKEN.lastIndex = 0;
	for (let match = TOKEN.exec(line); match !== null; match = TOKEN.exec(line)) {
		if (match.index > last) out.push(line.slice(last, match.index));
		const tone = match[1]
			? TONE.comment
			: match[2]
				? TONE.string
				: match[3]
					? TONE.keyword
					: match[4]
						? TONE.number
						: TONE.call;
		out.push(
			<span key={key++} style={{ color: tone, fontStyle: match[1] ? "italic" : undefined }}>
				{match[0]}
			</span>,
		);
		last = match.index + match[0].length;
	}
	if (last < line.length) out.push(line.slice(last));
	return out;
};

/** A line of source. `{ n, text }` pins the real line number; `"⋯"` is an elision row. */
export type CodeLine = string | { readonly n: number; readonly text: string };

export type CodeWindowProps = {
	readonly file: string;
	readonly lines: readonly CodeLine[];
	/** 1-based line numbers to highlight. */
	readonly focus?: readonly number[];
	readonly startLine?: number;
	readonly fontSize?: number;
	readonly badge?: string;
	readonly stagger?: number;
	readonly enterAt?: number;
};

/**
 * A synthetic editor. Not a screenshot: every line is real text so it can be
 * highlighted, scrolled and diffed per frame.
 */
export const CodeWindow: React.FC<CodeWindowProps> = ({
	file,
	lines,
	focus = [],
	startLine = 1,
	fontSize = 21,
	badge,
	stagger = 2,
	enterAt = 0,
}) => {
	const frame = useCurrentFrame();
	const focusSet = new Set(focus);
	const hasFocus = focus.length > 0;
	return (
		<div
			style={{
				background: COLORS.panel,
				border: `1px solid ${COLORS.border}`,
				borderRadius: 16,
				overflow: "hidden",
				boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					padding: "13px 20px",
					background: COLORS.panelHi,
					borderBottom: `1px solid ${COLORS.border}`,
				}}
			>
				{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
					<span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.75 }} />
				))}
				<span style={{ fontFamily: MONO, fontSize: 19, color: COLORS.dim, marginLeft: 8 }}>{file}</span>
				<span style={{ flex: 1 }} />
				{badge !== undefined ? (
					<span
						style={{
							fontFamily: MONO,
							fontSize: 18,
							color: COLORS.accent,
							background: COLORS.accentSoft,
							border: `1px solid ${COLORS.borderHi}`,
							borderRadius: 8,
							padding: "3px 11px",
						}}
					>
						{badge}
					</span>
				) : null}
			</div>
			<div style={{ padding: "18px 0", flex: 1, overflow: "hidden" }}>
				{lines.map((line, i) => {
					const elided = typeof line === "string" && line === "⋯";
					const text = typeof line === "string" ? line : line.text;
					const n = typeof line === "string" ? startLine + i : line.n;
					const isFocus = !elided && focusSet.has(n);
					const enter = easeOut(since(frame, enterAt + i * stagger, 14));
					const dimmed = hasFocus && !isFocus;
					return (
						<div
							key={`${i}-${n}`}
							style={{
								display: "flex",
								gap: 22,
								padding: "1px 22px",
								background: isFocus ? `${COLORS.accent}1f` : "transparent",
								borderLeft: `3px solid ${isFocus ? COLORS.accent : "transparent"}`,
								opacity: enter * (dimmed ? 0.34 : elided ? 0.5 : 1),
								translate: `${(1 - enter) * 14}px 0px`,
							}}
						>
							<span
								style={{
									fontFamily: MONO,
									fontSize: fontSize - 3,
									color: isFocus ? COLORS.accent : COLORS.faint,
									width: 44,
									textAlign: "right",
									flex: "0 0 auto",
									lineHeight: 1.62,
									userSelect: "none",
								}}
							>
								{elided ? "" : n}
							</span>
							<span
								style={{
									fontFamily: MONO,
									fontSize,
									lineHeight: 1.62,
									whiteSpace: "pre",
									color: elided ? COLORS.faint : COLORS.text,
								}}
							>
								{elided ? "⋯" : highlight(text)}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};