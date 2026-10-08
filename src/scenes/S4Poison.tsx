import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { CodeWindow, type CodeLine } from "../components/Code";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT } from "../theme";
import type { SceneTiming } from "../types";

const LINES: readonly CodeLine[] = [
	{ n: 420, text: "  const writes = await tx.settleSuccess();" },
	"⋯",
	{ n: 426, text: "  try {" },
	{ n: 428, text: "    seq = await this.#storage.commit(writes, withoutAbortSignal(context));" },
	{ n: 429, text: "  } catch (error) {" },
	{ n: 430, text: "    tx.discard();" },
	{
		n: 431,
		text: "    // Callback errors never reach this branch; StorageRejected alone guarantees that no batch effect committed.",
	},
	{ n: 432, text: "    if (!(error instanceof StorageRejected)) this.#poison = { error };" },
	{ n: 433, text: "    throw error;" },
	{ n: 434, text: "  }" },
	"⋯",
	{ n: 436, text: "  try {" },
	{ n: 437, text: "    documents = tx.adopt(seq);" },
	{ n: 438, text: "  } catch (error) {" },
	{ n: 439, text: "    // Storage already committed; a failed adoption leaves memory behind durable state." },
	{ n: 440, text: "    this.#poison = { error };" },
	{ n: 441, text: "    throw error;" },
	{ n: 442, text: "  }" },
	"⋯",
	{ n: 545, text: "  if (this.#poison !== undefined) {" },
	{
		n: 546,
		text: '    throw new Error("Session is poisoned by a failed commit after storage admission; reopen it", {',
	},
	{ n: 547, text: "      cause: this.#poison.error," },
	{ n: 548, text: "    });" },
];

const CHECKS = [
	{
		name: "ReadAfterWrite",
		text: "写过表之后再读表，直接抛",
		note: "读到的是旧快照，是在错误前提上做决策",
	},
	{
		name: "owner 校验",
		text: "任务不能在自己结束的提交里创建子工作",
		note: "owner 必须是活的非终态任务",
	},
	{ name: "一个文档一条指令", text: "一次提交里，一个文档只有一条内容指令", note: "否则无法定义合并语义" },
	{ name: "delta 版本匹配", text: "增量必须挂着同版本的基准", note: "base 版本不一致就拒" },
];

export const S4Poison: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	const focus =
		active === 0
			? [432, 440]
			: active === 1
				? [432]
				: active === 2
					? [431, 432]
					: active === 3
						? [439, 440]
						: active === 4
							? [546]
							: [];

	if (active <= 5) {
		return (
			<div style={{ height: "100%", display: "flex", gap: 32 }}>
				<div style={{ flex: 1, minWidth: 0 }}>
					<CodeWindow
						file="src/session/session.ts"
						lines={LINES}
						focus={focus}
						fontSize={18}
						badge="节选"
						stagger={1.2}
					/>
				</div>
				<div style={{ flex: "0 0 430px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
					{active === 0 ? (
						<Panel pad="20px 24px">
							<Label style={{ marginBottom: 12 }}>两处 catch，同一行</Label>
							<Mono size={20} color={COLORS.text}>
								this.#poison = {"{ error }"}
							</Mono>
						</Panel>
					) : null}
					{active >= 1 ? (
						<Panel active accent={COLORS.ok} pad="20px 24px">
							<Label color={COLORS.ok} style={{ marginBottom: 12 }}>
								StorageRejected 是承诺
							</Label>
							<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.5 }}>
								这一批
								<span style={{ color: COLORS.ok }}>什么都没写进去</span>
								<br />
								→ 回滚是安全的
							</div>
						</Panel>
					) : null}
					{active >= 3 ? (
						<Reveal at={scene.paragraphs[3].startFrame}>
							<Panel active accent={COLORS.danger} pad="20px 24px">
								<Label color={COLORS.danger} style={{ marginBottom: 12 }}>
									其他情况
								</Label>
								<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, lineHeight: 1.5 }}>
									存储已接受、内存没跟上
									<br />
									<span style={{ color: COLORS.danger }}>没有安全的恢复路径</span>
								</div>
							</Panel>
						</Reveal>
					) : null}
					{active >= 5 ? (
						<Reveal at={scene.paragraphs[5].startFrame}>
							<div
								style={{
									padding: "18px 24px",
									borderRadius: 12,
									background: COLORS.dangerSoft,
									border: `1px solid ${COLORS.danger}`,
									fontFamily: FONT,
									fontSize: 27,
									color: COLORS.text,
									lineHeight: 1.5,
								}}
							>
								宁可整会话报废
								<br />
								也不让内存与存储分叉
							</div>
						</Reveal>
					) : null}
				</div>
			</div>
		);
	}

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
			<div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
				<Label color={COLORS.accent2}>提交之前就把冲突拒掉</Label>
				<Mono size={21} color={COLORS.faint}>
					Transaction 里的校验 —— 代价只是重试一次回调
				</Mono>
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
				{CHECKS.map((check, i) => {
					// p7 → check 1, p8 → check 2, p9 lights the remaining two.
					const lit = active >= 9 || (active >= 7 && i <= active - 7);
					return (
						<Panel key={check.name} active={lit} accent={COLORS.accent2} pad="20px 26px" style={{ opacity: lit || active < 7 ? 1 : 0.35 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
								<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
									{check.name}
								</Chip>
								{lit ? <Mono size={19} color={COLORS.accent2}>拒绝</Mono> : null}
							</div>
							<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text, marginBottom: 6 }}>
								{check.text}
							</div>
							<div style={{ fontFamily: FONT, fontSize: 21, color: COLORS.dim }}>{check.note}</div>
						</Panel>
					);
				})}
			</div>
			{active >= 10 ? (
				<Reveal at={scene.paragraphs[10].startFrame}>
					<div style={{ display: "flex", gap: 20, marginTop: 6 }}>
						<Panel active accent={COLORS.ok} pad="18px 26px" style={{ flex: 1 }}>
							<Label color={COLORS.ok} style={{ marginBottom: 10 }}>
								提交前拒绝
							</Label>
							<div style={{ fontFamily: FONT, fontSize: 28, color: COLORS.text }}>重试一次回调</div>
						</Panel>
						<Panel active accent={COLORS.danger} pad="18px 26px" style={{ flex: 1 }}>
							<Label color={COLORS.danger} style={{ marginBottom: 10 }}>
								提交后失败
							</Label>
							<div style={{ fontFamily: FONT, fontSize: 28, color: COLORS.text }}>整个 Session 报废</div>
						</Panel>
					</div>
				</Reveal>
			) : null}
		</div>
	);
};