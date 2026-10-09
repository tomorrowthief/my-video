import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";
import { TreeCompare } from "./components/TreeCompare";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "把散装脚本改成 src layout 的包", artifact: "一个 pip install -e . 之后能导入的包" },
	{ text: "把踩到的坑记下来", artifact: "相对导入 / 模块找不到 / 路径写死，各一条" },
];

export const P9Structure: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	if (active < 1) {
		return null;
	}
	return (
		<TreeCompare
			scene={scene}
			at={1}
			tree={[
				{ prefix: "", name: "myproj/", mark: true },
				{ prefix: "├─ ", name: "src/myproj/", note: "代码", mark: true },
				{ prefix: "│  ├─ ", name: "__init__.py" },
				{ prefix: "│  └─ ", name: "core.py" },
				{ prefix: "├─ ", name: "tests/", note: "测试" },
				{ prefix: "├─ ", name: "pyproject.toml", note: "项目与依赖", mark: true },
				{ prefix: "└─ ", name: "uv.lock", note: "锁定的版本" },
			]}
			snippet={{
				title: "pyproject.toml",
				mark: [0, 6, 9],
				lines: [
					"[project]",
					'name = "myproj"',
					'version = "0.1.0"',
					'requires-python = ">=3.12"',
					"",
					"[project.scripts]",
					'myproj = "myproj.core:main"',
					"",
					"[dependency-groups]",
					'dev = ["pytest", "ruff", "mypy"]',
				],
			}}
		/>
	);
};
