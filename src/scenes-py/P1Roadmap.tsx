import { Chip, Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const LAYERS = [
	{
		name: "生态方向",
		detail: "Web / 数据 / AI，三条路选一条",
		chips: ["FastAPI", "polars", "模型 API"],
		color: COLORS.warn,
		soft: COLORS.warnSoft,
	},
	{
		name: "工程化",
		detail: "让别人能用、能改、能信任",
		chips: ["pyproject", "pytest", "ruff", "CI"],
		color: COLORS.ok,
		soft: "#122a1c",
	},
	{
		name: "并发与性能",
		detail: "同步思维的分水岭",
		chips: ["GIL", "多进程", "asyncio", "cProfile"],
		color: COLORS.accent2,
		soft: COLORS.accent2Soft,
	},
	{
		name: "语言内核",
		detail: "决定后面所有东西的理解上限",
		chips: ["数据模型", "装饰器", "生成器", "类型"],
		color: COLORS.accent,
		soft: COLORS.accentSoft,
	},
];

const STEPS = [
	{ n: "1", text: "读官方文档的对应章节", note: "不是教程，是 docs" },
	{ n: "2", text: "写最小复现，跑通，再故意弄坏", note: "看它报什么错" },
	{ n: "3", text: "读真实库的源码，看它在哪用", note: "搜用法，不读全篇" },
	{ n: "4", text: "真实项目里用上，留下产物", note: "听懂不算会" },
];

export const P1Roadmap: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	// Paragraph 1 lights the innermost layer, and it moves outward from there.
	const litIndex = active >= 1 && active <= 4 ? 3 - (active - 1) : -1;
	const lit = litIndex >= 0 ? LAYERS[litIndex] : undefined;
	// Steps light at paragraphs 5, 6 (two of them) and 7.
	const stepLit = active < 5 ? -1 : active === 5 ? 0 : active === 6 ? 2 : 4;

	return (
		<div style={{ height: "100%", display: "flex", gap: 46 }}>
			<div
				style={{
					flex: "0 0 860px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 12,
				}}
			>
				{LAYERS.map((layer, i) => {
					const on = lit === layer;
					const revealAt = scene.paragraphs[0].startFrame + i * 10;
					return (
						<Reveal key={layer.name} at={revealAt} from="left">
							<div
								style={{
									background: on ? layer.soft : COLORS.panel,
									border: `1px solid ${on ? layer.color : COLORS.border}`,
									borderRadius: 14,
									padding: "18px 26px",
									display: "flex",
									alignItems: "center",
									gap: 20,
									translate: on ? "12px 0px" : "0px 0px",
									boxShadow: on ? `0 0 34px ${layer.color}33` : "none",
								}}
							>
								<span
									style={{
										fontFamily: FONT,
										fontSize: 30,
										color: on ? layer.color : COLORS.dim,
										flex: "0 0 auto",
									}}
								>
									{layer.name}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 23, color: COLORS.dim }}>
									{layer.detail}
								</span>
							</div>
						</Reveal>
					);
				})}
				<Reveal at={scene.paragraphs[0].startFrame} style={{ marginTop: 6 }}>
					<Mono size={21} color={COLORS.faint}>
						↑ 每一层只建立在下层之上
					</Mono>
				</Reveal>
			</div>

			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 20,
				}}
			>
				{lit !== undefined ? (
					<Panel active accent={lit.color} pad="28px 32px">
						<Label color={lit.color} style={{ marginBottom: 16 }}>
							{lit.name}
						</Label>
						<div style={{ fontFamily: FONT, fontSize: 29, color: COLORS.text, marginBottom: 24 }}>
							{lit.detail}
						</div>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
							{lit.chips.map((c) => (
								<Chip key={c} color={lit.color} soft={lit.soft}>
									{c}
								</Chip>
							))}
						</div>
					</Panel>
				) : (
					<Panel pad="28px 32px">
						<Label style={{ marginBottom: 18 }}>走法 · 每个知识点都这么过</Label>
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							{STEPS.map((step, i) => {
								const on = i < stepLit;
								return (
									<div
										key={step.n}
										style={{
											display: "flex",
											gap: 16,
											alignItems: "baseline",
											opacity: on ? 1 : 0.3,
											borderLeft: `3px solid ${on ? COLORS.ok : COLORS.border}`,
											paddingLeft: 16,
										}}
									>
										<span style={{ fontFamily: MONO, fontSize: 20, color: COLORS.ok }}>
											{step.n}
										</span>
										<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
											<span style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text }}>
												{step.text}
											</span>
											<span style={{ fontFamily: MONO, fontSize: 18, color: COLORS.faint }}>
												{step.note}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</Panel>
				)}
				{active >= 7 ? (
					<Reveal at={scene.paragraphs[7].startFrame} from="scale">
						<Hero size={34} color={COLORS.accent}>
							听懂不算会，留下东西才算
						</Hero>
					</Reveal>
				) : null}
			</div>
		</div>
	);
};
