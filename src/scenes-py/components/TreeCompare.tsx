import { useCurrentFrame } from "remotion";
import { Label } from "../../components/Bits";
import { COLORS, FONT, MONO, easeOut, since } from "../../theme";
import type { SceneTiming } from "../../types";

export type TreeNode = {
	/** Tree-drawing prefix, e.g. "│  ├─ ". Spaces matter: pre is preserved. */
	readonly prefix: string;
	readonly name: string;
	readonly note?: string;
	readonly mark?: boolean;
};

export type TreeSnippet = {
	readonly title: string;
	readonly lines: readonly string[];
	readonly mark?: readonly number[];
};

/**
 * The engineering motif: the shape of a project on the left, the file that
 * makes that shape work on the right. Both sides light up together, because
 * the point is always that the layout and the config agree.
 */
export const TreeCompare: React.FC<{
	scene: SceneTiming;
	tree: readonly TreeNode[];
	snippet: TreeSnippet;
	/** Paragraph index that lights the whole thing; lines reveal from here. */
	at: number;
}> = ({ scene, tree, snippet, at }) => {
	const frame = useCurrentFrame();
	const start = scene.paragraphs[at]?.startFrame ?? 0;

	return (
		<div style={{ display: "flex", gap: 26, height: "100%" }}>
			<div
				style={{
					flex: 1,
					background: COLORS.panel,
					border: `1px solid ${COLORS.border}`,
					borderRadius: 14,
					padding: "22px 26px",
					display: "flex",
					flexDirection: "column",
					gap: 14,
				}}
			>
				<Label color={COLORS.accent2}>项目结构</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					{tree.map((node, i) => {
						const p = easeOut(since(frame, start + i * 6, 12));
						return (
							<div
								key={i}
								style={{
									opacity: p,
									translate: `${(1 - p) * 8}px 0px`,
									display: "flex",
									alignItems: "baseline",
									gap: 10,
									fontFamily: MONO,
									fontSize: 23,
									lineHeight: 1.5,
								}}
							>
								<span style={{ color: COLORS.faint, whiteSpace: "pre" }}>{node.prefix}</span>
								<span style={{ color: node.mark === true ? COLORS.accent2 : COLORS.text }}>
									{node.name}
								</span>
								{node.note !== undefined ? (
									<span
										style={{
											fontFamily: FONT,
											fontSize: 19,
											color: COLORS.dim,
											marginLeft: "auto",
										}}
									>
										{node.note}
									</span>
								) : null}
							</div>
						);
					})}
				</div>
			</div>

			<div
				style={{
					flex: 1,
					background: COLORS.panel,
					border: `1px solid ${COLORS.border}`,
					borderRadius: 14,
					padding: "22px 26px",
					display: "flex",
					flexDirection: "column",
					gap: 14,
				}}
			>
				<Label color={COLORS.accent}>{snippet.title}</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					{snippet.lines.map((line, i) => {
						const isMark = snippet.mark?.includes(i) === true;
						const p = easeOut(since(frame, start + i * 7, 12));
						return (
							<div
								key={i}
								style={{
									opacity: p,
									fontFamily: MONO,
									fontSize: 22,
									lineHeight: 1.55,
									whiteSpace: "pre",
									color: isMark ? COLORS.accent : COLORS.dim,
									background: isMark ? `${COLORS.accent}14` : "transparent",
									borderLeft: `2px solid ${isMark ? COLORS.accent : "transparent"}`,
									paddingLeft: 12,
								}}
							>
								{line}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
