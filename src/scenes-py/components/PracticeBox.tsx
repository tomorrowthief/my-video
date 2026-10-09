import { Label, Mono, Panel, Reveal } from "../../components/Bits";
import { useSceneFrame } from "../../components/Stage";
import { COLORS, FONT, MONO } from "../../theme";
import type { SceneTiming } from "../../types";

export type PracticeItem = {
	/** The verifiable action. Imperative, concrete, starts with a verb. */
	readonly text: string;
	/** What you end up with. Shown pinned to the right. */
	readonly artifact: string;
};

/**
 * The "how to practise" panel every content scene ends on. The scene tasks
 * a fixed rhythm: whatever else changes, this box is always bottom-right.
 */
export const PracticeBox: React.FC<{
	scene: SceneTiming;
	items: readonly PracticeItem[];
	/** Paragraph index from which this box appears. */
	at: number;
	title?: string;
}> = ({ scene, items, at, title = "怎么练" }) => {
	const { active } = useSceneFrame(scene);
	const start = scene.paragraphs[at]?.startFrame ?? 0;
	const on = active >= at;

	return (
		<Reveal at={start} frames={16} from="left" style={{ height: "100%" }}>
			<Panel
				active={on}
				accent={COLORS.ok}
				pad="26px 30px"
				style={{ height: "100%", display: "flex", flexDirection: "column", opacity: on ? 1 : 0.35 }}
			>
				<Label color={COLORS.ok} style={{ marginBottom: 20 }}>
					{title}
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
					{items.map((item, i) => (
						<div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
								<span style={{ fontFamily: MONO, fontSize: 20, color: COLORS.ok, flex: "0 0 auto" }}>
									{i + 1}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.45 }}>
									{item.text}
								</span>
							</div>
							<div
								style={{
									marginLeft: 34,
									fontFamily: MONO,
									fontSize: 19,
									color: COLORS.dim,
									borderLeft: `2px solid ${COLORS.borderHi}`,
									paddingLeft: 14,
								}}
							>
								{item.artifact}
							</div>
						</div>
					))}
				</div>
				<div style={{ marginTop: "auto", paddingTop: 20 }}>
					<Mono size={18} color={COLORS.faint}>
						听懂不算会，留下东西才算
					</Mono>
				</div>
			</Panel>
		</Reveal>
	);
};
