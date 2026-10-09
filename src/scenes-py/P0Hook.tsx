import { Bullets, Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const CODE = [
	"def top_words(path):",
	"    text = open(path).read()",
	"    counts = {}",
	"    for w in text.split():",
	"        counts[w] = counts.get(w, 0) + 1",
	"    return sorted(counts.items(),",
	"                  key=lambda kv: -kv[1])[:10]",
];

const PROBLEMS = ["文件大了吃满内存", "函数直接读磁盘，没法测", "调用方拿不到中间结果"];

const DESTINATIONS = ["数据模型", "生成器", "工程化"];

const LAYERS = ["语言内核", "并发与性能", "工程化", "生态方向"];

export const P0Hook: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
			{active <= 1 ? (
				<div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
					<Panel pad="26px 30px" style={{ flex: "0 0 760px" }}>
						<Label style={{ marginBottom: 16 }}>已经用了两年 Python</Label>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{CODE.map((line, i) => (
								<Reveal key={i} at={i * 5}>
									<div
										style={{
											fontFamily: MONO,
											fontSize: 24,
											lineHeight: 1.5,
											whiteSpace: "pre",
											color: COLORS.dim,
										}}
									>
										{line}
									</div>
								</Reveal>
							))}
						</div>
					</Panel>
					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							gap: 16,
							opacity: active === 1 ? 1 : 0,
						}}
					>
						<Label color={COLORS.warn}>但</Label>
						{PROBLEMS.map((p, i) => (
							<Reveal key={p} at={scene.paragraphs[1].startFrame + i * 12} from="left">
								<div
									style={{
										background: COLORS.warnSoft,
										border: `1px solid ${COLORS.warn}55`,
										borderRadius: 12,
										padding: "16px 22px",
										fontFamily: FONT,
										fontSize: 26,
										color: COLORS.text,
									}}
								>
									{p}
								</div>
							</Reveal>
						))}
					</div>
				</div>
			) : null}

			{active === 2 ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
					<Hero>这些问题，语法书里都不教</Hero>
					<div style={{ display: "flex", gap: 18, alignItems: "center" }}>
						<Mono size={24} color={COLORS.faint}>
							答案在
						</Mono>
						{DESTINATIONS.map((d, i) => (
							<Reveal key={d} at={scene.paragraphs[2].startFrame + 20 + i * 12} from="scale">
								<div
									style={{
										background: COLORS.accentSoft,
										border: `1px solid ${COLORS.accent}`,
										borderRadius: 12,
										padding: "14px 26px",
										fontFamily: MONO,
										fontSize: 28,
										color: COLORS.accent,
									}}
								>
									{d}
								</div>
							</Reveal>
						))}
					</div>
				</div>
			) : null}

			{active === 3 ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
					<Hero>进阶卡住的原因</Hero>
					<Bullets
						items={[
							{ text: "不是某个语法没学会" },
							{ text: "是没人告诉你，接下来该碰哪些东西" },
							{ text: "以及，碰到什么程度算会了" },
						]}
						active={2}
					/>
				</div>
			) : null}

			{active >= 4 ? (
				<div style={{ display: "flex", gap: 48, alignItems: "center" }}>
					<div style={{ flex: "0 0 620px", display: "flex", flexDirection: "column", gap: 10 }}>
						{LAYERS.map((l, i) => (
							<Reveal key={l} at={scene.paragraphs[4].startFrame + i * 10}>
								<div
									style={{
										background: COLORS.panel,
										border: `1px solid ${COLORS.border}`,
										borderRadius: 12,
										padding: "16px 26px",
										fontFamily: FONT,
										fontSize: 28,
										color: i === 0 ? COLORS.accent : COLORS.dim,
									}}
								>
									{l}
								</div>
							</Reveal>
						))}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
						<Hero size={52}>Python 进阶路线图</Hero>
						<Mono size={24} color={COLORS.dim}>
							15 分钟 · 10 个知识点 · 每个都带可验证的练法
						</Mono>
					</div>
				</div>
			) : null}
		</div>
	);
};
