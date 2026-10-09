import { Hero, Label, Mono, Panel, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO } from "../theme";
import type { SceneTiming } from "../types";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const HOTSPOTS = [
	{ name: "parse_row", pct: 46 },
	{ name: "normalize", pct: 24 },
	{ name: "sort_keys", pct: 13 },
	{ name: "read_csv", pct: 9 },
	{ name: "<built-in>", pct: 5 },
];

const RUNGS = [
	{ text: "换算法和数据结构", note: "收益最大" },
	{ text: "减少重复计算，加缓存", note: "第二" },
	{ text: "换 C 扩展库 / 向量化", note: "比如循环换 numpy" },
	{ text: "上并发", note: "放最后" },
	{ text: "微优化", note: "放最后" },
];

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给一个跑得慢的脚本跑 cProfile", artifact: "一份 top 热点清单" },
	{ text: "只优化第一名，再测一次", artifact: "数字动了才继续；没动就回去看 profiling" },
];

export const P8Profiling: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active <= 1) {
		return (
			<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Hero size={82}>顺序</Hero>
			</div>
		);
	}
	return (
		<div style={{ height: "100%", display: "flex", gap: 30, alignItems: "center" }}>
			<Panel pad="26px 30px" style={{ flex: 1 }}>
				<Label color={COLORS.accent} style={{ marginBottom: 20 }}>
					cProfile · 先看事实
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
					{HOTSPOTS.map((h, i) => (
						<Reveal key={h.name} at={scene.paragraphs[2].startFrame + i * 8} from="left">
							<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
								<Mono
									size={22}
									color={i === 0 ? COLORS.accent : COLORS.dim}
									style={{ flex: "0 0 210px" }}
								>
									{h.name}
								</Mono>
								<div style={{ flex: 1, height: 22, background: COLORS.bg, borderRadius: 5 }}>
									<div
										style={{
											width: `${h.pct * 2}%`,
											height: "100%",
											background: i === 0 ? COLORS.accent : COLORS.borderHi,
											borderRadius: 5,
										}}
									/>
								</div>
								<Mono size={20} color={COLORS.faint} style={{ flex: "0 0 60px" }}>
									{h.pct}%
								</Mono>
							</div>
						</Reveal>
					))}
				</div>
			</Panel>

			<Panel pad="26px 30px" style={{ flex: "0 0 640px" }}>
				<Label color={COLORS.ok} style={{ marginBottom: 20 }}>
					优化顺序
				</Label>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					{RUNGS.map((r, i) => {
						const late = i >= 3;
						const on = active >= 3 && (late ? active >= 4 : true);
						return (
							<div
								key={r.text}
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: 16,
									opacity: on ? (late ? 0.45 : 1) : 0.15,
									borderLeft: `3px solid ${late ? COLORS.danger : COLORS.ok}`,
									paddingLeft: 16,
								}}
							>
								<span
									style={{
										fontFamily: MONO,
										fontSize: 20,
										color: late ? COLORS.danger : COLORS.ok,
									}}
								>
									{i + 1}
								</span>
								<span style={{ fontFamily: FONT, fontSize: 26, color: COLORS.text }}>{r.text}</span>
								<span
									style={{
										fontFamily: MONO,
										fontSize: 18,
										color: COLORS.faint,
										marginLeft: "auto",
									}}
								>
									{r.note}
								</span>
							</div>
						);
					})}
				</div>
			</Panel>
		</div>
	);
};
