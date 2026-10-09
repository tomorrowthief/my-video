import { Hero, Mono, Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT } from "../theme";
import type { SceneTiming } from "../types";

const WEEKS = [
	{ label: "W1", topic: "数据模型 + 装饰器", artifact: "自定义类实现 3 协议 + 手写 @retry", from: 1 },
	{ label: "W2", topic: "生成器与迭代", artifact: "大文件脚本改流式", from: 2 },
	{ label: "W3", topic: "类型系统", artifact: "200 行以上、mypy 全绿", from: 2 },
	{ label: "W4", topic: "并发", artifact: "串行 / 线程 / 进程对比表", from: 3 },
	{ label: "W5", topic: "性能", artifact: "profiling 报告 + 实际优化结果", from: 3 },
	{ label: "W6", topic: "工程化 · 结构", artifact: "规范的包", from: 4 },
	{ label: "W7", topic: "工程化 · 质量", artifact: "测试 + ruff/mypy/pre-commit + CI", from: 4 },
	{ label: "W8", topic: "方向", artifact: "一个你自己想用的小工具", from: 5 },
];

export const P12Outro: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);

	if (active >= 7) {
		return (
			<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Hero size={72} color={COLORS.accent}>
					听懂不算会，留下东西才算
				</Hero>
			</div>
		);
	}

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
			<div style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 6 }}>
				<Hero size={44}>八周</Hero>
				<Mono size={24} color={COLORS.dim}>
					每周一个能拿出来的东西
				</Mono>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				{WEEKS.map((w, i) => {
					const on = active >= w.from;
					return (
						<Reveal key={w.label} at={scene.paragraphs[w.from].startFrame + i * 5} from="left">
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 20,
									opacity: on ? 1 : 0.22,
									background: on ? COLORS.panelHi : "transparent",
									border: `1px solid ${on ? COLORS.borderHi : COLORS.border}`,
									borderLeft: `3px solid ${on ? COLORS.ok : COLORS.border}`,
									borderRadius: 11,
									padding: "12px 22px",
								}}
							>
								<Mono size={22} color={on ? COLORS.ok : COLORS.faint} style={{ flex: "0 0 54px" }}>
									{w.label}
								</Mono>
								<span
									style={{
										fontFamily: FONT,
										fontSize: 27,
										color: COLORS.text,
										flex: "0 0 330px",
									}}
								>
									{w.topic}
								</span>
								<Mono size={20} color={on ? COLORS.dim : COLORS.faint}>
									{w.artifact}
								</Mono>
							</div>
						</Reveal>
					);
				})}
			</div>
			{active >= 6 ? (
				<Reveal at={scene.paragraphs[6].startFrame}>
					<Mono size={23} color={COLORS.accent2}>
						↑ 八周之后，你手里会有七个能给别人看的东西
					</Mono>
				</Reveal>
			) : null}
		</div>
	);
};
