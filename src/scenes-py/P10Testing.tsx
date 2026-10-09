import { Label, Mono, Panel } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT } from "../theme";
import type { SceneTiming } from "../types";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { TreeCompare } from "./components/TreeCompare";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "给最核心的函数补测试，边界写全", artifact: "一个测试文件，覆盖正常 + 边界 + 异常" },
	{ text: "接上 ruff / mypy / pre-commit", artifact: "提交前跑不过就提交不了" },
];

const TOOLING = [
	"ruff check .        # 风格 + 一部分 bug",
	"mypy src            # 类型",
	"pre-commit install  # 挂在提交前",
	"",
	"# CI 最小版：每次 push 跑一遍",
	"pytest -q && ruff check .",
];

export const P10Testing: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active < 1) {
		return null;
	}
	if (active >= 3) {
		return (
			<div
				style={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 24,
				}}
			>
				<Panel pad="26px 32px">
					<Label color={COLORS.accent} style={{ marginBottom: 20 }}>
						静态检查与 CI
					</Label>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{TOOLING.map((line, i) => (
							<Mono
								key={i}
								size={23}
								color={i >= 4 ? COLORS.ok : COLORS.dim}
								style={{ whiteSpace: "pre" }}
							>
								{line}
							</Mono>
						))}
					</div>
				</Panel>
				<div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
					<Mono size={21} color={COLORS.warn}>
						先测试，后工具
					</Mono>
					<span style={{ fontFamily: FONT, fontSize: 23, color: COLORS.dim }}>
						—— 工具保证不了逻辑对不对
					</span>
				</div>
			</div>
		);
	}
	return (
		<TreeCompare
			scene={scene}
			at={1}
			tree={[
				{ prefix: "", name: "myproj/", mark: true },
				{ prefix: "├─ ", name: "src/myproj/core.py", note: "被测对象" },
				{ prefix: "└─ ", name: "tests/", note: "测试", mark: true },
				{ prefix: "   ├─ ", name: "test_core.py", mark: true },
				{ prefix: "   └─ ", name: "conftest.py", note: "共享 fixture" },
			]}
			snippet={{
				title: "test_core.py",
				mark: [1, 5, 8],
				lines: [
					"def test_normal():",
					'    assert parse("a b") == {...}',
					"",
					"@pytest.fixture",
					"def tmp_csv(tmp_path): ...",
					"",
					'@pytest.mark.parametrize("raw,expected", [',
					'    ("", {}),',
					'    ("a", {"a": 1}),',
					"])",
					"def test_cases(raw, expected): ...",
				],
			}}
		/>
	);
};
