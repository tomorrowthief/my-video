import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

const DESIGNS = [
	"completing 延迟终态",
	"poisoned Session",
	"ReadAfterWrite",
	"abort 用标记不用递归",
	"partial 输出也持久化",
	"两阶段工具执行",
];

export const S9Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const endIn = easeOut(since(frame, scene.paragraphs[6].startFrame, 22));

	if (active >= 6) {
		return (
			<div
				style={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					gap: 34,
					opacity: endIn,
					translate: `0px ${(1 - endIn) * 24}px`,
				}}
			>
				<Label>开源仓库</Label>
				<div style={{ fontFamily: MONO, fontSize: 52, color: COLORS.accent, letterSpacing: "-0.01em" }}>
					github.com/earendil-works/pi
				</div>
				<div style={{ fontFamily: MONO, fontSize: 32, color: COLORS.dim }}>packages/durable</div>
				<div style={{ display: "flex", gap: 14, marginTop: 8 }}>
					<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
						docs/spec.md
					</Chip>
					<Chip color={COLORS.dim} soft={COLORS.panel}>
						4747 行 · 8 条不变式
					</Chip>
					<Chip color={COLORS.dim} soft={COLORS.panel}>
						31 个可运行示例
					</Chip>
				</div>
				{active >= 7 ? (
					<Reveal at={scene.paragraphs[7].startFrame}>
						<div
							style={{
								marginTop: 22,
								padding: "22px 40px",
								borderRadius: 16,
								background: COLORS.warnSoft,
								border: `1px solid ${COLORS.warn}`,
								fontFamily: FONT,
								fontSize: 34,
								color: COLORS.text,
							}}
						>
							建议从 spec 的
							<span style={{ color: COLORS.warn }}>第 8 条不变式</span>
							开始读
						</div>
					</Reveal>
				) : null}
			</div>
		);
	}

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
			<div>
				<Label style={{ marginBottom: 20 }}>一个观察</Label>
				<div style={{ fontFamily: FONT, fontSize: 52, color: COLORS.text, lineHeight: 1.35 }}>
					两万行代码的复杂度，几乎全部来自
					<br />
					一个约束：<span style={{ color: COLORS.accent }}>任何时刻断电，都要正确</span>
				</div>
			</div>

			{active >= 2 ? (
				<Reveal at={scene.paragraphs[2].startFrame}>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
						{DESIGNS.map((design, i) => (
							<Reveal key={design} at={scene.paragraphs[2].startFrame + i * 6}>
								<Chip color={COLORS.dim} soft={COLORS.panel}>
									{design}
								</Chip>
							</Reveal>
						))}
					</div>
				</Reveal>
			) : null}

			{active >= 3 ? (
				<Reveal at={scene.paragraphs[3].startFrame}>
					<Panel active accent={COLORS.accent2} pad="26px 32px">
						<div style={{ fontFamily: FONT, fontSize: 34, color: COLORS.text, lineHeight: 1.5 }}>
							这些设计单看都挺怪的 —— 把「断电」放在前提里，
							<br />
							它们全是被<span style={{ color: COLORS.accent2 }}>推出来</span>的，不是被设计出来的
						</div>
					</Panel>
				</Reveal>
			) : null}

			{active >= 4 ? (
				<Reveal at={scene.paragraphs[4].startFrame}>
					<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
						<Mono size={26} color={COLORS.warn}>
							建议
						</Mono>
						<span style={{ fontFamily: FONT, fontSize: 30, color: COLORS.text }}>
							先把你的不变式写下来，一条一条编号
						</span>
						{active >= 5 ? (
							<Reveal at={scene.paragraphs[5].startFrame}>
								<span style={{ fontFamily: FONT, fontSize: 28, color: COLORS.dim }}>
									—— 很多纠结的取舍，写的时候就已经有答案了
								</span>
							</Reveal>
						) : null}
					</div>
				</Reveal>
			) : null}
		</div>
	);
};