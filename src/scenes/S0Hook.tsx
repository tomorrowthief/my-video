import { Chip, Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";

const CrashTrack: React.FC<{ frame: number; dead: boolean }> = ({ frame, dead }) => {
	const TURNS = 14;
	const progress = Math.min(frame / 34, TURNS);
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
			{Array.from({ length: TURNS }, (_, i) => {
				const reached = progress > i;
				const isLast = i === TURNS - 1;
				const lit = reached && !dead;
				return (
					<div
						key={i}
						style={{
							width: isLast ? 58 : 46,
							height: isLast ? 58 : 46,
							borderRadius: 10,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontFamily: MONO,
							fontSize: 17,
							color: dead && isLast ? COLORS.danger : lit ? COLORS.accent : COLORS.faint,
							background: dead && isLast ? COLORS.dangerSoft : lit ? COLORS.accentSoft : COLORS.panel,
							border: `1px solid ${
								dead && isLast ? COLORS.danger : lit ? COLORS.borderHi : COLORS.border
							}`,
						}}
					>
						{dead && isLast ? "✕" : i + 1}
					</div>
				);
			})}
		</div>
	);
};

export const S0Hook: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	const titled = active >= 3;
	const titleIn = easeOut(since(frame, scene.paragraphs[3].startFrame, 20));

	if (titled) {
		return (
			<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
				<div style={{ opacity: titleIn, translate: `0px ${(1 - titleIn) * 26}px` }}>
					<Label style={{ marginBottom: 18 }}>源码解读</Label>
					<Hero size={96} style={{ letterSpacing: "-0.02em" }}>
						<span style={{ fontFamily: MONO, color: COLORS.accent }}>pi-durable</span>
					</Hero>
					<Hero size={52} color={COLORS.text} style={{ marginTop: 14 }}>
						把 Agent 循环重写成
						<span style={{ color: COLORS.accent2 }}>可恢复的状态机</span>
					</Hero>
				</div>
				<div style={{ display: "flex", gap: 16, marginTop: 52, opacity: easeOut(since(frame, scene.paragraphs[5].startFrame, 18)) }}>
					{["它保证什么", "为什么这么设计", "源码长什么样"].map((t) => (
						<Panel key={t} pad="16px 28px">
							<span style={{ fontFamily: FONT, fontSize: 28, color: COLORS.text }}>{t}</span>
						</Panel>
					))}
				</div>
			</div>
		);
	}

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 46 }}>
			<div>
				<Label style={{ marginBottom: 22 }}>场景</Label>
				<Hero size={42} color={COLORS.dim}>
					Agent 跑到一半，进程没了
				</Hero>
				<div style={{ marginTop: 34 }}>
					<CrashTrack frame={frame} dead={active >= 1} />
				</div>
				<div style={{ marginTop: 26, height: 46, display: "flex", gap: 14, alignItems: "center" }}>
					{active >= 1 ? (
						<>
							<span style={{ fontFamily: FONT, fontSize: 30, color: COLORS.danger }}>进程被 kill</span>
							<Mono size={22} color={COLORS.faint}>
								· 第 12 个工具调用，第 40 轮
							</Mono>
						</>
					) : null}
				</div>
			</div>

			{active >= 1 ? (
				<Reveal at={0} frames={1} style={{ opacity: 1 }}>
					<div style={{ display: "flex", gap: 16 }}>
						{["token 超限", "用户取消"].map((t, i) => (
							<Reveal key={t} at={scene.paragraphs[1].startFrame + i * 12}>
								<Panel pad="14px 26px">
									<span style={{ fontFamily: FONT, fontSize: 27, color: COLORS.warn }}>{t}</span>
								</Panel>
							</Reveal>
						))}
					</div>
				</Reveal>
			) : null}

			{active >= 2 ? (
				<Reveal at={scene.paragraphs[2].startFrame}>
					<div style={{ display: "flex", alignItems: "center", gap: 20 }}>
						<Label>传统做法</Label>
						<Chip color={COLORS.dim} soft={COLORS.panel}>
							重新开始
						</Chip>
						<Mono size={22} color={COLORS.faint}>
							或
						</Mono>
						<Chip color={COLORS.dim} soft={COLORS.panel}>
							try/catch + 状态文件
						</Chip>
						<Mono size={22} color={COLORS.faint}>
							然后祈祷
						</Mono>
					</div>
				</Reveal>
			) : null}
		</div>
	);
};