import { useCurrentFrame } from "remotion";
import { Label } from "../../components/Bits";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type CodeLine = {
	readonly text: string;
	/** Highlight this line as the differing / interesting one. */
	readonly mark?: boolean;
};

export type CodePane = {
	readonly title: string;
	readonly note?: string;
	readonly lines: readonly CodeLine[];
};

/**
 * The language-core motif: the plain way on the left, the advanced way (or the
 * thing the plain way is really doing) on the right. Both panes reveal line by
 * line so the narration can walk down them.
 *
 * Keep every line under 42 characters: two panes of about 820px at 22px
 * monospace is where it starts overflowing. Indentation is real spaces —
 * whiteSpace is "pre", so tabs would render at the font's tab width.
 */
export const CodeCompare: React.FC<{
	scene: SceneTiming;
	left: CodePane;
	right: CodePane;
	/** Scene-relative frame the line reveal starts at. Defaults to the first paragraph. */
	from?: number;
	accentLeft?: string;
	accentRight?: string;
}> = ({ scene, left, right, from, accentLeft = COLORS.dim, accentRight = COLORS.accent }) => {
	const frame = useCurrentFrame();
	const start = from ?? scene.paragraphs[0]?.startFrame ?? 0;

	return (
		<div style={{ display: "flex", gap: 26, height: "100%" }}>
			{[
				{ pane: left, accent: accentLeft },
				{ pane: right, accent: accentRight },
			].map(({ pane, accent }, col) => (
				<div
					key={pane.title}
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						background: COLORS.panel,
						border: `1px solid ${COLORS.border}`,
						borderRadius: 14,
						padding: "22px 26px",
						gap: 16,
					}}
				>
					<div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
						<Label color={accent}>{pane.title}</Label>
						{pane.note !== undefined ? (
							<span
								style={{
									fontFamily: FONT,
									fontSize: 20,
									color: COLORS.faint,
									marginLeft: "auto",
								}}
							>
								{pane.note}
							</span>
						) : null}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
						{pane.lines.map((line, i) => {
							// Left column leads, right column follows half a beat later.
							const at = start + i * 9 + col * 14;
							const p = easeOut(since(frame, at, 12));
							return (
								<div
									key={i}
									style={{
										opacity: p,
										translate: `${(1 - p) * 10}px 0px`,
										fontFamily: MONO,
										fontSize: 22,
										lineHeight: 1.55,
										whiteSpace: "pre",
										color: line.mark === true ? accent : COLORS.dim,
										background: line.mark === true ? `${accent}14` : "transparent",
										borderLeft:
											line.mark === true ? `2px solid ${accent}` : "2px solid transparent",
										paddingLeft: 12,
									}}
								>
									{line.text}
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};
