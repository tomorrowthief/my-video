import { Chip, Label, Mono, Node, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

const DIMS = [
	{ key: "scope", values: ["session", "conversation", "task"] },
	{ key: "history", values: ["latest", "rewindable"] },
	{ key: "fork", values: ["current", "initial", "asOf"] },
];

const BUILTIN = ["pi.agent", "pi.provider", "pi.live", "pi.inbox", "pi.usage"];

const OPS = [
	{ label: "entry append", op: '["p", ["entries"], n, 0, [value]]' },
	{ label: "head marker", op: "prepend + trim suffix" },
	{ label: "documents", op: '["docs", kind] → …' },
];

export const S7Chord: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const inOps = active >= 6;
	const flow = easeOut(since(frame, scene.paragraphs[1].startFrame, 20));

	return (
		<div style={{ height: "100%", display: "flex", gap: 40 }}>
			<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
				{!inOps ? (
					<>
						<Label>document —— 不是历史，是当前状态</Label>
						<Panel active={active >= 1} accent={COLORS.accent} pad="26px 30px">
							<div style={{ display: "flex", alignItems: "center", gap: 16, opacity: flow }}>
								<Node active color={COLORS.ok} size={24}>
									base v3
								</Node>
								<Mono size={24} color={COLORS.faint}>
									+
								</Mono>
								<Node active color={COLORS.accent} size={24}>
									delta
								</Node>
								<Node active color={COLORS.accent} size={24}>
									delta
								</Node>
								<Mono size={24} color={COLORS.faint}>
									+
								</Mono>
								<Node active color={COLORS.accent} size={24}>
									delta
								</Node>
							</div>
							<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim, marginTop: 20 }}>
								Chord 跟踪的 JSON —— 记录里存基准，加一串增量
							</div>
						</Panel>

						{active >= 2 ? (
							<Reveal at={scene.paragraphs[2].startFrame}>
								<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
									{DIMS.map((dim, i) => (
										<div key={dim.key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
											<Mono size={23} color={COLORS.dim} style={{ width: 110 }}>
												{dim.key}
											</Mono>
											{dim.values.map((value) => (
												<Chip
													key={value}
													color={active >= 2 + Math.min(i, 1) ? COLORS.accent2 : COLORS.faint}
													soft={active >= 2 + Math.min(i, 1) ? COLORS.accent2Soft : COLORS.panel}
												>
													{value}
												</Chip>
											))}
										</div>
									))}
								</div>
							</Reveal>
						) : null}

						{active >= 4 ? (
							<Reveal at={scene.paragraphs[4].startFrame}>
								<div>
									<Label style={{ marginBottom: 14 }}>内置 document</Label>
									<div style={{ display: "flex", gap: 12 }}>
										{BUILTIN.map((name) => (
											<Chip key={name} color={COLORS.accent} soft={COLORS.accentSoft}>
												{name}
											</Chip>
										))}
									</div>
								</div>
							</Reveal>
						) : null}
					</>
				) : (
					<>
						<Label>前端不需要知道怎么订阅存储</Label>
						<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
							<Node active color={COLORS.ok} size={24}>
								Storage.commit
							</Node>
							<Mono size={26} color={COLORS.faint}>
								→
							</Mono>
							<Node active color={COLORS.accent2} size={24}>
								publication
							</Node>
							<Mono size={26} color={COLORS.faint}>
								→
							</Mono>
							<Node active color={COLORS.accent} size={24}>
								view.ts 推导 ops
							</Node>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
							{OPS.map((row, i) => (
								<div key={row.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: active >= 7 + Math.min(i, 1) ? 1 : 0.35 }}>
									<Mono size={21} color={COLORS.dim} style={{ width: 180 }}>
										{row.label}
									</Mono>
									<Mono size={21} color={COLORS.accent}>
										{row.op}
									</Mono>
								</div>
							))}
						</div>
						{active >= 8 ? (
							<Reveal at={scene.paragraphs[8].startFrame}>
								<div
									style={{
										marginTop: 8,
										padding: "20px 28px",
										borderRadius: 14,
										background: COLORS.accentSoft,
										border: `1px solid ${COLORS.accent}`,
										fontFamily: FONT,
										fontSize: 30,
										color: COLORS.text,
										lineHeight: 1.5,
									}}
								>
									UI 状态和存储状态
									<br />
									是<span style={{ color: COLORS.accent }}>同一个东西的两种投影</span>
								</div>
							</Reveal>
						) : null}
					</>
				)}
			</div>

			<div style={{ flex: "0 0 520px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
				<Panel pad="24px 28px">
					<Label style={{ marginBottom: 16 }}>
						{inOps ? "view.ts" : "src/documents.ts"}
					</Label>
					<Mono size={21} color={COLORS.dim} style={{ display: "block", lineHeight: 1.8 }}>
						{inOps ? (
							<>
								advance(publication) → Op[]
								<br />
								<span style={{ color: COLORS.faint }}>// follower 落后时用根替换</span>
								<br />
								fullSource: ["r", value]
							</>
						) : (
							<>
								defineDoc{"{ kind, version, scope, history, fork }"}
								<br />
								<span style={{ color: COLORS.faint }}>// 版本升高时应用 migrate</span>
								<br />
								materializeDocumentValue()
							</>
						)}
					</Mono>
				</Panel>
				<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
					<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
						prepare
					</Chip>
					<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
						adopt
					</Chip>
					<Chip color={COLORS.danger} soft={COLORS.dangerSoft}>
						abort
					</Chip>
					<Mono size={19} color={COLORS.faint}>
						草稿在回调 settle 时全部撤销
					</Mono>
				</div>
			</div>
		</div>
	);
};