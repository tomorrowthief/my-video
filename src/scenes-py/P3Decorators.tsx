import { useSceneFrame } from "../components/Stage";
import type { SceneTiming } from "../types";
import { CodeCompare } from "./components/CodeCompare";
import { PracticeBox, type PracticeItem } from "./components/PracticeBox";

const PRACTICE: readonly PracticeItem[] = [
	{ text: "手写 @retry(次数, 间隔)", artifact: "能装饰任意函数、保留函数名、超限抛异常的装饰器" },
	{ text: "先写闭包，再写装饰器，最后才用 @", artifact: "一份能讲清 func = deco(func) 的笔记" },
];

export const P3Decorators: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active } = useSceneFrame(scene);
	if (active >= 5) {
		return <PracticeBox scene={scene} at={5} items={PRACTICE} />;
	}
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
			<CodeCompare
				scene={scene}
				from={scene.paragraphs[0].startFrame}
				left={{
					title: "手写装饰器",
					note: "先不用 @ 语法",
					lines: [
						{ text: "def retry(fn):" },
						{ text: "    def wrapper(*a, **kw):" },
						{ text: "        return fn(*a, **kw)" },
						{ text: "    return wrapper" },
						{ text: "" },
						{ text: "def fetch():" },
						{ text: "    ..." },
						{ text: "" },
						{ text: "fetch = retry(fetch)" },
					],
				}}
				right={{
					title: "为什么成立 / 标准答案",
					note: "装饰器就是一次赋值",
					lines: [
						{ text: "fetch = retry(fetch)", mark: true },
						{ text: "    # @retry 只是这行的语法糖" },
						{ text: "" },
						{ text: "# 三段式：" },
						{ text: "#   不带参 → 带参 → 类装饰器", mark: true },
						{ text: "" },
						{ text: "functools.wraps(fn)      # 保住名字", mark: true },
						{ text: "functools.lru_cache       # 一行缓存", mark: true },
						{ text: "functools.partial(fn, x)  # 固定参数", mark: true },
					],
				}}
			/>
		</div>
	);
};
