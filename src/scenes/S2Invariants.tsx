import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

const INVARIANTS = [
	"One Session commit is atomic across all record and document writes.",
	"A document update is published only after its storage commit succeeds.",
	"All visible progress is durable. There is no volatile publication path.",
	"External effects do not run inside the Session mutation transaction.",
	"Entries and IDs are immutable and never reused after a committed write.",
	"Document drafts are fully revoked when their transaction callback settles.",
	"The mutation line remains held through storage settlement and adoption.",
	"An uncertain storage failure is fatal to the open Session.",
];

export const S2Invariants: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	// p5 -> #1, p6 -> #3, p7 -> #8
	const picked = active === 5 ? 0 : active === 6 ? 2 : active >= 7 ? 7 : -1;
	const ruleIn = easeOut(since(frame, scene.paragraphs[1].startFrame, 18));

	return (
		<div style={{ height: "100%", display: "flex", gap: 44 }}>
			<div style={{ flex: "0 0 700px", display: "flex", flexDirection: "column", gap: 22 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
					<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
						docs/spec.md
					</Chip>
					<Label>规范性文档 · 4747 行</Label>
				</div>

				<Panel active={active >= 1} accent={COLORS.accent2} pad="26px 30px">
					<Label color={COLORS.accent2} style={{ marginBottom: 16 }}>
						核心规则
					</Label>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 22,
							lineHeight: 1.62,
							color: COLORS.text,
							opacity: ruleIn,
						}}
					>
						A Session <span style={{ color: "#b39dff" }}>atomically commits</span> immutable entries,
						<br />
						full task records, and Chord-tracked documents.
						<br />
						<span style={{ color: COLORS.accent, fontWeight: 600 }}>
							Only committed state is observable.
						</span>
					</div>
				</Panel>

				{active >= 2 ? (
					<Reveal at={scene.paragraphs[2].startFrame}>
						<Panel pad="22px 30px">
							<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.6 }}>
								内存里没有
								<span style={{ color: COLORS.danger }}>「半成品」</span>
								的分发路径
							</div>
							{active >= 3 ? (
								<div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
									{["进度", "UI 更新", "watch 回调", "事件流"].map((t) => (
										<Chip key={t} color={COLORS.dim} soft={COLORS.panel}>
											{t}
										</Chip>
									))}
									<Mono size={21} color={COLORS.faint}>
										→ 全部来自已落盘的记录
									</Mono>
								</div>
							) : null}
						</Panel>
					</Reveal>
				) : null}
			</div>

			<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
					<Label color={active >= 4 ? COLORS.warn : COLORS.faint}>8 条编号不变式</Label>
					{active >= 4 && active < 5 ? (
						<Mono size={20} color={COLORS.faint}>
							挑三条
						</Mono>
					) : null}
				</div>
				{INVARIANTS.map((text, i) => {
					const on = picked === i;
					const ago = active >= 4;
					return (
						<div
							key={i}
							style={{
								display: "flex",
								gap: 16,
								alignItems: "baseline",
								padding: "9px 16px",
								borderRadius: 10,
								background: on ? COLORS.warnSoft : "transparent",
								border: `1px solid ${on ? COLORS.warn : "transparent"}`,
								opacity: on ? 1 : ago ? 0.42 : 0.18,
							}}
						>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 19,
									color: on ? COLORS.warn : COLORS.faint,
									width: 22,
									textAlign: "right",
									flex: "0 0 auto",
								}}
							>
								{i + 1}
							</span>
							<span
								style={{
									fontFamily: MONO,
									fontSize: on ? 20 : 18,
									lineHeight: 1.45,
									color: on ? COLORS.text : COLORS.dim,
								}}
							>
								{text}
							</span>
						</div>
					);
				})}
				{active >= 8 ? (
					<Reveal at={scene.paragraphs[8].startFrame}>
						<div
							style={{
								marginTop: 8,
								padding: "14px 20px",
								borderRadius: 10,
								background: COLORS.warnSoft,
								border: `1px solid ${COLORS.warn}`,
								fontFamily: FONT,
								fontSize: 25,
								color: COLORS.warn,
							}}
						>
							记住第 8 条 —— 结尾会回到它
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};