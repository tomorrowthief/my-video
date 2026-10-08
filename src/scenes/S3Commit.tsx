import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { CodeWindow, type CodeLine } from "../components/Code";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const LINES: readonly CodeLine[] = [
	{ n: 405, text: "async #runCommit<T>(" },
	{ n: 406, text: "  change: (tx: Transaction) => T | Promise<T>," },
	{ n: 407, text: "  context: Context," },
	{ n: 408, text: "): Promise<T> {" },
	"⋯",
	{ n: 412, text: "  const tx = new Transaction(this.#host, context, scope);" },
	{ n: 414, text: "  try {" },
	{ n: 415, text: "    result = await change(tx);" },
	{ n: 416, text: "  } catch (error) {" },
	{ n: 417, text: "    await tx.settleFailure();" },
	{ n: 418, text: "    throw error;" },
	{ n: 419, text: "  }" },
	{ n: 420, text: "  const writes = await tx.settleSuccess();" },
	{ n: 421, text: "  if (writes.length === 0) { tx.discard(); return result; }" },
	"⋯",
	{ n: 425, text: "  let seq: Seq;" },
	{ n: 426, text: "  try {" },
	{ n: 427, text: "    // Once admitted, caller cancellation does not interrupt Storage settlement." },
	{ n: 428, text: "    seq = await this.#storage.commit(writes, withoutAbortSignal(context));" },
	{ n: 429, text: "  } catch (error) {" },
	{ n: 430, text: "    tx.discard();" },
	{ n: 432, text: "    if (!(error instanceof StorageRejected)) this.#poison = { error };" },
	{ n: 433, text: "    throw error;" },
	{ n: 434, text: "  }" },
	"⋯",
	{ n: 437, text: "    documents = tx.adopt(seq);" },
	"⋯",
	{ n: 443, text: "  this.#publish(seq, writes, documents, context);" },
	{ n: 444, text: "  return result;" },
	{ n: 445, text: "}" },
];

const STEPS = [
	{ name: "callback", detail: "只登记意图，不写", lines: [412, 415], color: COLORS.accent },
	{ name: "settleSuccess", detail: "草稿全部收敛或撤销", lines: [420], color: COLORS.warn },
	{ name: "storage.commit", detail: "唯一真正落盘的地方", lines: [428], color: COLORS.accent2 },
	{ name: "adopt(seq)", detail: "内存指针换到已提交版本", lines: [437], color: COLORS.ok },
	{ name: "publish", detail: "此刻才对外可见", lines: [443], color: COLORS.accent },
];

const Diverge: React.FC<{ frame: number }> = ({ frame }) => {
	const p = Math.min(frame / 60, 1);
	const gap = p * 120;
	return (
		<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 34 }}>
			<Label>问题</Label>
			<div style={{ fontFamily: FONT, fontSize: 40, color: COLORS.text, lineHeight: 1.4 }}>
				内存先改，再异步落盘 —— 中间断电，两边就<span style={{ color: COLORS.danger }}>分叉</span>了
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
				{[
					{ label: "内存", y: -gap, color: COLORS.accent },
					{ label: "存储", y: gap, color: COLORS.accent2 },
				].map((track) => (
					<div key={track.label} style={{ display: "flex", alignItems: "center", gap: 22 }}>
						<span style={{ fontFamily: FONT, fontSize: 26, color: track.color, width: 70 }}>
							{track.label}
						</span>
						<div style={{ position: "relative", flex: 1, height: 6, background: COLORS.border, borderRadius: 3 }}>
							<div
								style={{
									position: "absolute",
									left: 0,
									top: 0,
									height: 6,
									width: `${Math.min(p * 100, 68)}%`,
									background: track.color,
									borderRadius: 3,
								}}
							/>
							<div
								style={{
									position: "absolute",
									left: "68%",
									top: track.y / 4,
									height: 6,
									width: `${Math.max(p * 32, 0)}%`,
									background: track.color,
									borderRadius: 3,
									opacity: 0.55,
								}}
							/>
						</div>
						<span style={{ fontFamily: MONO, fontSize: 22, color: COLORS.faint, width: 90 }}>
							{track.y < 0 ? "已更新" : "旧的"}
						</span>
					</div>
				))}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 16, opacity: Math.min(p * 1.6, 1) }}>
				<span style={{ fontSize: 34 }}>⚡</span>
				<span style={{ fontFamily: FONT, fontSize: 28, color: COLORS.danger }}>断电点</span>
				<Mono size={22} color={COLORS.faint}>
					内存和存储从此不再一致，且无法判断谁对
				</Mono>
			</div>
		</div>
	);
};

export const S3Commit: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const step =
		active <= 3 ? -1 : active <= 4 ? 0 : active <= 6 ? 1 : active <= 9 ? 2 : active === 10 ? 3 : 4;
	const focus =
		active >= 4
			? [...(STEPS[step].lines as number[]), ...(active === 8 ? [427] : []), ...(active === 10 ? [435, 440] : [])]
			: [];

	if (active <= 1) {
		return <Diverge frame={frame - scene.paragraphs[0].startFrame} />;
	}

	return (
		<div style={{ height: "100%", display: "flex", gap: 34 }}>
			<div style={{ flex: 1, minWidth: 0 }}>
				<CodeWindow
					file="src/session/session.ts"
					lines={LINES}
					focus={focus}
					fontSize={18}
					badge={active >= 4 ? `步骤 ${step + 1} / 5` : "节选"}
					stagger={1.5}
					enterAt={scene.paragraphs[2].startFrame}
				/>
			</div>
			<div style={{ flex: "0 0 560px", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
				{active === 2 ? (
					<Reveal at={scene.paragraphs[2].startFrame}>
						<Panel active accent={COLORS.warn} pad="22px 26px">
							<Label color={COLORS.warn} style={{ marginBottom: 14 }}>
								串行化
							</Label>
							<Mono size={22} color={COLORS.text} style={{ display: "block", lineHeight: 1.7 }}>
								#enqueue(() =&gt; ...) 挂在 #tail 上
							</Mono>
							<div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center" }}>
								<Chip color={COLORS.dim} soft={COLORS.panel}>
									提交 A
								</Chip>
								<Mono size={20} color={COLORS.faint}>
									→
								</Mono>
								<Chip color={COLORS.warn} soft={COLORS.warnSoft}>
									#tail
								</Chip>
								<Mono size={20} color={COLORS.faint}>
									→
								</Mono>
								<Chip color={COLORS.dim} soft={COLORS.panel}>
									提交 B
								</Chip>
							</div>
							<div style={{ fontFamily: FONT, fontSize: 24, color: COLORS.text, marginTop: 18 }}>
								同一 Session 里，任意两次提交
								<span style={{ color: COLORS.warn }}>不会并发</span>
							</div>
						</Panel>
					</Reveal>
				) : (
					STEPS.map((s, i) => {
						const on = active >= 4 && i === step;
						const past = active >= 4 && i < step;
						return (
							<div
								key={s.name}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 16,
									background: on ? COLORS.panelHi : "transparent",
									border: `1px solid ${on ? s.color : COLORS.border}`,
									borderRadius: 12,
									padding: "13px 20px",
									opacity: on ? 1 : past ? 0.6 : 0.3,
									boxShadow: on ? `0 0 26px ${s.color}33` : "none",
								}}
							>
								<span
									style={{
										fontFamily: MONO,
										fontSize: 20,
										color: on ? s.color : COLORS.faint,
										width: 20,
									}}
								>
									{i + 1}
								</span>
								<span
									style={{
										fontFamily: MONO,
										fontSize: 24,
										color: on ? s.color : COLORS.dim,
										width: 210,
									}}
								>
									{s.name}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 21, color: COLORS.dim }}>{s.detail}</span>
							</div>
						);
					})
				)}
				{active === 12 ? (
					<Reveal at={scene.paragraphs[12].startFrame}>
						<div
							style={{
								marginTop: 6,
								padding: "16px 20px",
								borderRadius: 12,
								background: COLORS.accentSoft,
								border: `1px solid ${COLORS.accent}`,
								fontFamily: FONT,
								fontSize: 25,
								color: COLORS.text,
								lineHeight: 1.5,
							}}
						>
							<span style={{ fontFamily: MONO, color: COLORS.accent }}>publish</span> 排在链条最后
							<br />
							没有任何一条更短的路径
						</div>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};