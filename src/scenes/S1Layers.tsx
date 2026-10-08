import { Chip, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";

const LAYERS = [
	{
		name: "Extensions / Env / Tools",
		detail: "工具、prompt section、hook、wrap、执行环境",
		chips: ["tools", "sections", "hooks", "wraps", "NodeExecutionEnv"],
		color: COLORS.accent2,
		soft: COLORS.accent2Soft,
	},
	{
		name: "Harness",
		detail: "任务调度器、会话生命周期、agent 配置",
		chips: ["TaskScheduler", "Conversation", "Agent", "Registry"],
		color: COLORS.accent,
		soft: COLORS.accentSoft,
	},
	{
		name: "Session",
		detail: "一条变更线 + 原子提交",
		chips: ["#enqueue", "Transaction", "publish"],
		color: COLORS.warn,
		soft: COLORS.warnSoft,
	},
	{
		name: "Storage",
		detail: "唯一真相",
		chips: ["Memory", "JSONL", "SQLite", "Durable Object"],
		color: COLORS.ok,
		soft: "#122a1c",
	},
];

export const S1Layers: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);
	// Paragraph 2 lights Storage, 3 Session, 4 Harness, 5 Extensions.
	const litIndex = active <= 1 ? -1 : Math.min(3 - (active - 2), 3);
	const lit = litIndex >= 0 ? LAYERS[litIndex] : undefined;
	const stacked = active >= 6;

	return (
		<div style={{ height: "100%", display: "flex", gap: 46 }}>
			<div style={{ flex: "0 0 720px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
				{active <= 1 ? (
					<div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 8 }}>
						<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
							<Chip color={COLORS.accent} soft={COLORS.accentSoft}>
								@earendil-works/pi-durable
							</Chip>
							<Chip color={COLORS.dim} soft={COLORS.panel}>
								1.0.4
							</Chip>
							<Chip color={COLORS.warn} soft={COLORS.warnSoft}>
								experimental
							</Chip>
						</div>
						<Mono size={22} color={COLORS.dim}>
							Durable conversation, task, and document runtime for Pi
						</Mono>
						<div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
							<Label>不是</Label>
							<Chip color={COLORS.faint} soft={COLORS.panel}>
								UI
							</Chip>
							<Chip color={COLORS.faint} soft={COLORS.panel}>
								CLI
							</Chip>
							<Label>是</Label>
							<Chip color={COLORS.accent2} soft={COLORS.accent2Soft}>
								runtime
							</Chip>
						</div>
					</div>
				) : null}

				{LAYERS.map((layer, i) => {
					const on = lit === layer;
					return (
						<div
							key={layer.name}
							style={{
								background: on ? layer.soft : COLORS.panel,
								border: `1px solid ${on ? layer.color : COLORS.border}`,
								borderRadius: 14,
								padding: "20px 26px",
								display: "flex",
								alignItems: "center",
								gap: 20,
								boxShadow: on ? `0 0 34px ${layer.color}33` : "none",
								translate: on ? "10px 0px" : "0px 0px",
							}}
						>
							<span style={{ fontFamily: MONO, fontSize: 20, color: on ? layer.color : COLORS.faint }}>
								{4 - i}
							</span>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 30,
									color: on ? layer.color : COLORS.dim,
									flex: "0 0 auto",
								}}
							>
								{layer.name}
							</span>
							<span style={{ fontFamily: FONT, fontSize: 24, color: COLORS.dim, marginLeft: "auto" }}>
								{layer.detail}
							</span>
						</div>
					);
				})}

				{stacked ? (
					<Reveal at={scene.paragraphs[6].startFrame}>
						<div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
							<Mono size={22} color={COLORS.accent}>
								↑
							</Mono>
							<span style={{ fontFamily: FONT, fontSize: 25, color: COLORS.text }}>
								每一层只依赖下面一层
							</span>
							<Mono size={20} color={COLORS.faint}>
								—— 这是后面所有设计的前提
							</Mono>
						</div>
					</Reveal>
				) : null}
			</div>

			<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
				{lit !== undefined ? (
					<Panel active accent={lit.color} pad="30px 34px">
						<Label color={lit.color} style={{ marginBottom: 18 }}>
							{lit.name}
						</Label>
						<div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.text, marginBottom: 26 }}>
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
					<Panel pad="30px 34px">
						<Mono size={22} color={COLORS.faint}>
							src/index.ts —— 唯一的公开面
						</Mono>
					</Panel>
				)}
				<div style={{ marginTop: 22, display: "flex", gap: 12, alignItems: "center" }}>
					<Mono size={20} color={COLORS.faint}>
						frame {frame}
					</Mono>
				</div>
			</div>
		</div>
	);
};