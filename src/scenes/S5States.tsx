import { Chip, Label, Mono, Node, Panel, Reveal } from "../components/Bits";
import { CodeWindow, type CodeLine } from "../components/Code";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

const STATES = ["pending", "running", "waiting", "completing", "terminal"];
const OUTCOMES = [
	{ name: "completed", color: COLORS.ok },
	{ name: "failed", color: COLORS.danger },
	{ name: "aborted", color: COLORS.warn },
	{ name: "orphaned", color: COLORS.dim, scheduler: true },
	{ name: "faulted", color: COLORS.dim, scheduler: true },
];

const TERMINATE: readonly CodeLine[] = [
	{ n: 1029, text: "async #terminate(tx, record: AnyTaskRecord, outcome: SchedulerOutcome) {" },
	{ n: 1030, text: "  await this.#loadScopes(false);" },
	{ n: 1031, text: "  if (this.#ownedLive(overlayOf(tx)).has(record.id)) {" },
	{ n: 1032, text: '    tx.setTask(withState(record, { status: "completing", outcome }));' },
	{ n: 1033, text: "    return;" },
	{ n: 1034, text: "  }" },
	{ n: 1035, text: '  tx.setTask(withState(record, { status: "terminal", outcome }));' },
	{ n: 1036, text: "  await this.#settleOutcome(tx, record, outcome);" },
	{ n: 1037, text: "}" },
];

const RULES = [
	"终态 / completing / waiting → 停",
	"Session 正在关闭 → 停",
	"有 abort 标记 → 跑 abort handler",
	"未捕获错误 → 判 faulted",
	"有持久化进度 → 刷新快照 / 替换定义",
	"没有持久化进度 → 判 faulted",
];

export const S5States: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);

	// ── Phase A: the state machine itself ──────────────────────────────────
	if (active <= 4) {
		const chainIn = easeOut(since(frame, scene.paragraphs[2].startFrame, 20));
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 54 }}>
				<div>
					<Label style={{ marginBottom: 22 }}>Agent 的每一步 = 一个 task = 存储里的一行</Label>
					<div style={{ display: "flex", alignItems: "center", gap: 10, opacity: chainIn }}>
						{STATES.map((state, i) => (
							<span key={state} style={{ display: "flex", alignItems: "center", gap: 10 }}>
								{i > 0 ? (
									<span style={{ fontFamily: MONO, fontSize: 26, color: COLORS.faint }}>→</span>
								) : null}
								<Node
									active={state === "completing"}
									color={COLORS.warn}
									size={30}
									style={{ padding: "16px 30px" }}
								>
									{state}
								</Node>
							</span>
						))}
					</div>
					{active >= 4 ? (
						<Reveal at={scene.paragraphs[4].startFrame}>
							<div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
								<span style={{ fontFamily: MONO, fontSize: 24, color: COLORS.warn }}>
									completing
								</span>
								<span style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim }}>
									会延迟终态 —— 等子工作干完，再由
								</span>
								<Mono size={24} color={COLORS.accent}>
									#finalize
								</Mono>
								<span style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim }}>写终态</span>
							</div>
						</Reveal>
					) : null}
				</div>

				{active >= 3 ? (
					<Reveal at={scene.paragraphs[3].startFrame}>
						<div>
							<Label style={{ marginBottom: 18 }}>5 种终态结果</Label>
							<div style={{ display: "flex", gap: 14, alignItems: "center" }}>
								{OUTCOMES.map((outcome) => (
									<Node
										key={outcome.name}
										active
										color={outcome.color}
										size={26}
										style={{ padding: "14px 24px" }}
									>
										{outcome.name}
									</Node>
								))}
								<span style={{ fontFamily: FONT, fontSize: 22, color: COLORS.faint, marginLeft: 12 }}>
									（后两个只有调度器能写）
								</span>
							</div>
						</div>
					</Reveal>
				) : null}
			</div>
		);
	}

	// ── Phase B: #terminate and the scheduler-only rule ────────────────────
	if (active <= 9) {
		const focus = active === 5 ? [1031] : active === 6 ? [1032, 1035] : active === 7 ? [1031] : [];
		return (
			<div style={{ height: "100%", display: "flex", gap: 34 }}>
				<div style={{ flex: "0 0 900px" }}>
					<CodeWindow
						file="src/harness/scheduler.ts"
						lines={TERMINATE}
						focus={focus}
						fontSize={21}
						badge="#terminate"
						stagger={2}
					/>
				</div>
				<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
					{active >= 7 ? (
						<Reveal at={scene.paragraphs[7].startFrame}>
							<Panel active accent={COLORS.warn} pad="24px 28px">
								<Label color={COLORS.warn} style={{ marginBottom: 14 }}>
									为什么要延迟
								</Label>
								<div style={{ fontFamily: FONT, fontSize: 27, color: COLORS.text, lineHeight: 1.55 }}>
									「结束」和「被观察到结束」
									<br />
									之间隔着
									<span style={{ color: COLORS.warn }}>一整个子任务的生命周期</span>
								</div>
								<div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
									<Chip color={COLORS.dim} soft={COLORS.panel}>
										abort handler 需要地方跑
									</Chip>
									<Chip color={COLORS.dim} soft={COLORS.panel}>
										资源需要地方回收
									</Chip>
								</div>
							</Panel>
						</Reveal>
					) : (
						<Panel pad="24px 28px">
							<Label style={{ marginBottom: 14 }}>调度器先看一眼</Label>
							<div style={{ fontFamily: FONT, fontSize: 28, color: COLORS.text, lineHeight: 1.55 }}>
								你还有
								<span style={{ color: COLORS.accent }}>活着的子任务</span>
								吗？
							</div>
						</Panel>
					)}
					{active >= 8 ? (
						<Reveal at={scene.paragraphs[8].startFrame}>
							<Panel pad="22px 28px">
								<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text, lineHeight: 1.55 }}>
									任务自己只能写
									<span style={{ fontFamily: MONO, color: COLORS.ok }}> completed</span>
									<span style={{ fontFamily: MONO, color: COLORS.danger }}> failed</span>
									<span style={{ fontFamily: MONO, color: COLORS.warn }}> aborted</span>
								</div>
								<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text, marginTop: 12 }}>
									<span style={{ fontFamily: MONO, color: COLORS.accent }}>faulted</span> 和
									<span style={{ fontFamily: MONO, color: COLORS.accent }}> orphaned</span> 只有调度器能写
								</div>
							</Panel>
						</Reveal>
					) : null}
					{active >= 9 ? (
						<Reveal at={scene.paragraphs[9].startFrame}>
							<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
								<Chip color={COLORS.dim} soft={COLORS.panel}>
									abortRequested
								</Chip>
								<Mono size={22} color={COLORS.faint}>
									—— 标记位，不是状态
								</Mono>
							</div>
						</Reveal>
					) : null}
				</div>
			</div>
		);
	}

	// ── Phase C: the six precedence rules ──────────────────────────────────
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
				<Mono size={30} color={COLORS.accent}>
					#step
				</Mono>
				<span style={{ fontFamily: FONT, fontSize: 28, color: COLORS.dim }}>
					在变更线上同步判断 —— 优先级固定六条
				</span>
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
				{RULES.map((rule, i) => {
					const lit = active >= 11 + i;
					const last = i === 5;
					const color = last ? COLORS.warn : COLORS.accent;
					return (
						<div
							key={rule}
							style={{
								background: lit ? COLORS.panelHi : COLORS.panel,
								border: `1px solid ${lit ? color : COLORS.border}`,
								borderRadius: 14,
								padding: "20px 24px",
								opacity: lit || active < 11 ? 1 : 0.32,
								boxShadow: lit ? `0 0 28px ${color}2e` : "none",
							}}
						>
							<div style={{ fontFamily: MONO, fontSize: 20, color: lit ? color : COLORS.faint, marginBottom: 12 }}>
								{String(i + 1).padStart(2, "0")}
							</div>
							<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text, lineHeight: 1.5 }}>
								{rule}
							</div>
						</div>
					);
				})}
			</div>
			{active >= 17 ? (
				<Reveal at={scene.paragraphs[17].startFrame}>
					<div
						style={{
							padding: "20px 28px",
							borderRadius: 14,
							background: COLORS.warnSoft,
							border: `1px solid ${COLORS.warn}`,
							fontFamily: FONT,
							fontSize: 28,
							color: COLORS.text,
							lineHeight: 1.5,
						}}
					>
						转了一圈什么都没写下来 = 在
						<span style={{ color: COLORS.warn }}>死循环烧 token</span>
						—— 直接判死，防止复活之后失控
					</div>
				</Reveal>
			) : null}
		</div>
	);
};