import { Chip, Label, Mono, Node, Panel, Reveal } from "../components/Bits";
import { CodeWindow, type CodeLine } from "../components/Code";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const TASKS = [
	{ id: "pi.generation", verb: "想", detail: "流式生成、工具轮次、边界", color: COLORS.accent },
	{ id: "pi.tool", verb: "做", detail: "两阶段执行、重放策略", color: COLORS.accent2 },
	{ id: "pi.compaction", verb: "压缩", detail: "选、总结、重试", color: COLORS.warn },
];

const TOOL_CODE: readonly CodeLine[] = [
	{ n: 87, text: "// call 阶段：记录意图，还没有执行" },
	{ n: 88, text: 'const intent = { phase: "execute", arguments: final, replay: tool.replay ?? "unsafe" } as const;' },
	"⋯",
	{ n: 95, text: "// execute 阶段：只有恢复的时候才会走到这里" },
	{ n: 96, text: "const { arguments: args, replay } = task.state.checkpoint;" },
	"⋯",
	{ n: 98, text: 'if (replay === "safe" && tool?.replay === "safe") {' },
	{ n: 99, text: "  // 存储里记的策略、当前代码的策略，都是 safe → 真的重放" },
	{ n: 100, text: "} else {" },
	{ n: 101, text: "  // 否则：从已提交的槽位判定 interrupted，落 failed" },
	{ n: 102, text: "}" },
];

const TASK_STRIP: React.FC<{ active: number; current: number }> = ({ active, current }) => (
	<div style={{ display: "flex", gap: 14 }}>
		{TASKS.map((task, i) => {
			const on = i === current;
			return (
				<div
					key={task.id}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: "10px 20px",
						borderRadius: 11,
						background: on ? COLORS.panelHi : "transparent",
						border: `1px solid ${on ? task.color : COLORS.border}`,
						opacity: on ? 1 : 0.32,
					}}
				>
					<span style={{ fontFamily: FONT, fontSize: 22, color: task.color }}>{task.verb}</span>
					<span style={{ fontFamily: MONO, fontSize: 22, color: on ? task.color : COLORS.dim }}>
						{task.id}
					</span>
				</div>
			);
		})}
		<span style={{ display: "none" }}>{active}</span>
	</div>
);

export const S6Tasks: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);

	// ── Overview ───────────────────────────────────────────────────────────
	if (active === 0) {
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
				<div style={{ fontFamily: FONT, fontSize: 42, color: COLORS.text }}>
					内置任务三个，正好覆盖 Agent 循环的三件事
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
					{TASKS.map((task, i) => (
						<Reveal key={task.id} at={scene.paragraphs[0].startFrame + i * 10} from="scale">
							<Panel active accent={task.color} pad="30px 32px">
								<div style={{ fontFamily: FONT, fontSize: 64, color: task.color, marginBottom: 16 }}>
									{task.verb}
								</div>
								<Mono size={24} color={task.color}>
									{task.id}
								</Mono>
								<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim, marginTop: 14 }}>
									{task.detail}
								</div>
							</Panel>
						</Reveal>
					))}
				</div>
			</div>
		);
	}

	// ── pi.generation ──────────────────────────────────────────────────────
	if (active <= 6) {
		const phases = ["prepare", "request", "retry", "poll", "tools"];
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>
				<TASK_STRIP active={active} current={0} />
				<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
					<Label>checkpoint union</Label>
					{phases.map((phase) => {
						const on =
							(phase === "prepare" && active >= 2) ||
							(phase === "request" && active >= 4) ||
							phase === "retry" ||
							phase === "poll" ||
							phase === "tools";
						return (
							<Chip key={phase} color={on ? COLORS.accent : COLORS.faint} soft={on ? COLORS.accentSoft : COLORS.panel}>
								{phase}
							</Chip>
						);
					})}
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
					<Panel active={active === 2 || active === 3} accent={COLORS.accent} pad="24px 28px">
						<Label color={COLORS.accent} style={{ marginBottom: 14 }}>
							prepare
						</Label>
						<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.55 }}>
							渲染 prompt section、算 <span style={{ fontFamily: MONO }}>pi.system</span> 补丁、判断压缩
						</div>
						{active >= 3 ? (
							<div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
								<Chip color={COLORS.warn} soft={COLORS.warnSoft}>
									blocking
								</Chip>
								<Mono size={22} color={COLORS.faint}>
									→ 起 compaction 子任务并等它
								</Mono>
							</div>
						) : null}
					</Panel>
					<Panel active={active >= 4} accent={COLORS.accent2} pad="24px 28px">
						<Label color={COLORS.accent2} style={{ marginBottom: 14 }}>
							request
						</Label>
						<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.55 }}>
							partial 输出也持久化，按{" "}
							<span style={{ fontFamily: MONO }}>partialIntervalMs</span> 节流
						</div>
						<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim, marginTop: 16 }}>
							同一时刻只有一个提交在飞
						</div>
						{active >= 5 ? (
							<Reveal at={scene.paragraphs[5].startFrame}>
								<div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
									<Mono size={23} color={COLORS.accent2}>
										convertPartial()
									</Mono>
									<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text, marginTop: 12, lineHeight: 1.5 }}>
										半截输出 → 一条{" "}
										<span style={{ color: COLORS.warn, fontFamily: MONO }}>aborted</span>{" "}
										的 assistant entry
									</div>
								</div>
							</Reveal>
						) : null}
					</Panel>
				</div>
				{active >= 6 ? (
					<Reveal at={scene.paragraphs[6].startFrame}>
						<div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.text }}>
							模型说了一半的话，也是<span style={{ color: COLORS.accent }}>持久的历史</span>
						</div>
					</Reveal>
				) : null}
			</div>
		);
	}

	// ── pi.tool ────────────────────────────────────────────────────────────
	if (active <= 14) {
		const recovered = active >= 10;
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
				<TASK_STRIP active={active} current={1} />
				<div style={{ display: "flex", gap: 30 }}>
					<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
						{/* call lane */}
						<div
							style={{
								borderRadius: 14,
								border: `1px solid ${active <= 9 ? COLORS.accent : COLORS.border}`,
								background: active <= 9 ? `${COLORS.accent}12` : "transparent",
								padding: "16px 22px",
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
								<Chip color={COLORS.accent} soft={COLORS.accentSoft}>
									phase 1 · call
								</Chip>
								<Mono size={20} color={COLORS.faint}>
									正常执行时走这里
								</Mono>
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
								{["解析工具", "校验参数", "beforeTool 钩子"].map((s) => (
									<Node key={s} mono={false} size={23} active={active >= 8}>
										{s}
									</Node>
								))}
							</div>
							{active >= 9 ? (
								<Reveal at={scene.paragraphs[9].startFrame}>
									<div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
										<Mono size={22} color={COLORS.faint}>
											→
										</Mono>
										<Node active color={COLORS.accent} size={23}>
											commit intent
										</Node>
										<Mono size={21} color={COLORS.dim}>
											{`{ phase: "execute", arguments, replay }`}
										</Mono>
									</div>
									<div style={{ fontFamily: FONT, fontSize: 22, color: COLORS.warn, marginTop: 12 }}>
										只是记录意图 —— 还没有执行
									</div>
								</Reveal>
							) : null}
						</div>

						{/* execute lane */}
						<div
							style={{
								borderRadius: 14,
								border: `1px solid ${recovered ? COLORS.accent2 : COLORS.border}`,
								background: recovered ? `${COLORS.accent2}12` : "transparent",
								padding: "16px 22px",
								opacity: recovered ? 1 : 0.4,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
								<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
									phase 2 · execute
								</Chip>
								<Mono size={20} color={COLORS.accent2}>
									只有恢复的时候才会走到这里
								</Mono>
							</div>
							{recovered ? (
								<>
									<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
										<Mono size={22} color={COLORS.text}>
											stored.replay === "safe"
										</Mono>
										<Mono size={22} color={COLORS.faint}>
											&amp;&amp;
										</Mono>
										<Mono size={22} color={COLORS.text}>
											current.replay === "safe"
										</Mono>
									</div>
									{active >= 11 ? (
										<div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
											<Node active color={COLORS.ok} size={23}>
												真的重放
											</Node>
											<Mono size={20} color={COLORS.faint}>
												/
											</Mono>
											<Node active color={COLORS.danger} size={23}>
												interrupted → failed
											</Node>
										</div>
									) : null}
								</>
							) : (
								<Mono size={21} color={COLORS.faint}>
									断电重启后才会进入这个分支
								</Mono>
							)}
						</div>
					</div>

					<div style={{ flex: "0 0 830px" }}>
						<CodeWindow
							file="src/harness/tool.ts"
							lines={TOOL_CODE}
							focus={active >= 9 ? [88] : []}
							fontSize={19}
							badge="pi.tool"
							stagger={2}
						/>
					</div>
				</div>
				{active >= 13 ? (
					<Reveal at={scene.paragraphs[13].startFrame}>
						<div style={{ display: "flex", gap: 18 }}>
							<Panel active accent={COLORS.ok} pad="16px 24px" style={{ flex: 1 }}>
								<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text }}>
									幂等 → 标 <span style={{ fontFamily: MONO, color: COLORS.ok }}>replay: "safe"</span>
								</div>
								<div style={{ fontFamily: FONT, fontSize: 22, color: COLORS.dim, marginTop: 8 }}>
									断电之后可以接着跑
								</div>
							</Panel>
							<Panel active accent={COLORS.danger} pad="16px 24px" style={{ flex: 1 }}>
								<div style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text }}>
									有副作用 → 标 <span style={{ fontFamily: MONO, color: COLORS.danger }}>unsafe</span>
								</div>
								<div style={{ fontFamily: FONT, fontSize: 22, color: COLORS.dim, marginTop: 8 }}>
									宁可报失败，也不重复执行
								</div>
							</Panel>
						</div>
					</Reveal>
				) : null}
			</div>
		);
	}

	// ── pi.compaction ──────────────────────────────────────────────────────
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
			<TASK_STRIP active={active} current={2} />
			<div style={{ display: "flex", gap: 14, alignItems: "center" }}>
				<Label>三阶段</Label>
				{["select", "summarize", "retry"].map((s, i) => (
					<Chip key={s} color={active >= 15 + i ? COLORS.warn : COLORS.faint} soft={active >= 15 + i ? COLORS.warnSoft : COLORS.panel}>
						{s}
					</Chip>
				))}
			</div>
			<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
				<Panel active accent={COLORS.warn} pad="26px 30px" style={{ flex: 1 }}>
					<Label color={COLORS.warn} style={{ marginBottom: 18 }}>
						select 的约束
					</Label>
					<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
						<Node active color={COLORS.accent} size={23}>
							assistant
						</Node>
						<Mono size={26} color={COLORS.danger}>
							⊘
						</Mono>
						<Node active color={COLORS.accent2} size={23}>
							tool result
						</Node>
					</div>
					{active >= 17 ? (
						<Reveal at={scene.paragraphs[17].startFrame}>
							<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.text, marginTop: 20, lineHeight: 1.5 }}>
								拆开 = 一半「我要调用工具」、一半没有结果
								<br />
								<span style={{ color: COLORS.danger }}>非法序列</span>；也不能从裸 tool result 开始
							</div>
						</Reveal>
					) : null}
				</Panel>
				{active >= 18 ? (
					<Reveal at={scene.paragraphs[18].startFrame} style={{ flex: 1 }}>
						<Panel pad="26px 30px">
							<Label style={{ marginBottom: 18 }}>摘要</Label>
							<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
								<Chip color={COLORS.accent} soft={COLORS.accentSoft}>
									&lt;summary&gt; … &lt;/summary&gt;
								</Chip>
								<Chip color={COLORS.dim} soft={COLORS.panel}>
									cacheRetention: "none"
								</Chip>
							</div>
							<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim, marginTop: 18 }}>
								新生成的摘要进缓存没有意义
							</div>
						</Panel>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};