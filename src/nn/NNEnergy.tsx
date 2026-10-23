/**
 * 3D 神经网络能量流动图。无缝循环，无旁白。
 *
 * 黑白格栅 + 蓝色能量，相机固定在一个斜视角上，能量从左向右不断流过。
 *
 * 边、能量点、节点全部画在同一个 SVG 里，共用一个按深度排好的绘制列表。分开
 * 画会破掉遮挡关系：节点如果用 div + box-shadow、边用 SVG，就是两个独立的层叠
 * 上下文，节点会永远盖在所有边上面，立体感当场失效。
 *
 * 组件本身对尺度一无所知 —— 几何、密度、粗细全部来自传入的 Scene，所以 16:9
 * 的视频和 1:1 的头像走的是同一条渲染路径，不存在两份会各自跑偏的绘制代码。
 */

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { idle } from "./flow";
import { NN } from "./palette";
import { BAND_BLUR_ID, bandOf, BANDS, depthFactor, project, type Projected } from "./projection";
import { AVATAR, MAIN, PULSE_CORE, PULSE_HALO, type Scene } from "./scenes";

/** 能量点的权重门槛。弱边不发光，让画面说出"权重决定能量流多少"。 */
const PULSE_MIN = 0.22;

/** 一个待绘制的图元，已投影完、带好深度。 */
type Item = { readonly depth: number; readonly el: React.ReactNode };

export const NNScene: React.FC<{ readonly scene: Scene; readonly progress?: number }> = ({ scene, progress }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	// 归一化到 0..1。所有视觉量都是周期为 1 的 t 的函数 —— 无缝的全部依据。
	const t = progress ?? (frame % durationInFrames) / durationInFrames;

	const { width, height, yaw, pitch, lens, depthSpan, bandBlur, nodeR, edgeW } = scene;
	const { nodes, edges } = scene.network;
	const { arrival, nodeGlow, pulses } = scene.flow;

	const warm = arrival(t);
	const cx = width / 2;
	const cy = height / 2;
	const df = (depth: number): number => depthFactor(depth, depthSpan);

	// 所有节点先投影一次，边和能量点复用结果 —— 一个节点被几十条边引用，重复
	// 投影既浪费又有漂移风险。
	const pn = nodes.map((n) => project(n.pos, yaw, pitch, cx, cy, lens));
	// 激活来自节点自己的 at（由入边推出），不再是"波前扫到这一层"。
	const glow = nodes.map((n) => Math.min(1, nodeGlow(t, n.at) + idle(t, n.phase) * 0.5));

	const items: Item[] = [];

	for (const e of edges) {
		const a = pn[e.from] as Projected;
		const b = pn[e.to] as Projected;
		const from = nodes[e.from] as (typeof nodes)[number];
		// 边的深度取两端中点：按单端排序会让长边跳到错误的一侧。
		const depth = (a.depth + b.depth) / 2;
		const dim = 0.4 + df(depth) * 0.6;
		const w = e.weight;
		const ms = ((a.scale + b.scale) / 2) * edgeW;

		items.push({
			depth,
			el: (
				<line
					key={`e${e.from}-${e.to}`}
					x1={a.sx}
					y1={a.sy}
					x2={b.sx}
					y2={b.sy}
					stroke={NN.structure}
					strokeWidth={(0.7 + w * 0.9) * ms}
					opacity={(0.13 + w * 0.18) * dim}
				/>
			),
		});

		if (w < PULSE_MIN) continue;

		const live = pulses(t, from.at, e.transit);

		// 有能量在途时，整条边亮起来。取该边上最强的那个能量点作为强度 —— 用累加
		// 的话，同时挂两个点的边会比单点的边亮一倍，看着像它更粗，而不是更忙。
		//
		// 这条高亮线叠在上面那条底色线之上（同一深度，紧随其后入列），所以排序后
		// 两者必然相邻，不会被别的图元插进中间。
		let peak = 0;
		for (const { g } of live) if (g > peak) peak = g;
		if (peak > 0.02) {
			const lit = peak * w;
			items.push({
				depth,
				el: (
					<line
						key={`l${e.from}-${e.to}`}
						x1={a.sx}
						y1={a.sy}
						x2={b.sx}
						y2={b.sy}
						stroke={NN.energy}
						strokeWidth={(0.7 + w * 1.1) * ms}
						opacity={Math.min(0.85, lit * 0.9) * dim}
					/>
				),
			});
		}

		for (const { p, g: pg } of live) {
			const g = pg * w;
			if (g < 0.03) continue;
			const px = a.sx + (b.sx - a.sx) * p;
			const py = a.sy + (b.sy - a.sy) * p;
			const ps = a.scale + (b.scale - a.scale) * p;
			const pdim = 0.4 + df(a.depth + (b.depth - a.depth) * p) * 0.6;
			items.push({
				depth: a.depth + (b.depth - a.depth) * p,
				el: (
					<g key={`p${e.from}-${e.to}-${Math.round(p * 1000)}`}>
						<circle
							cx={px}
							cy={py}
							r={nodeR * PULSE_HALO * ps * (0.5 + g)}
							fill={NN.energy}
							opacity={g * 0.42 * pdim}
						/>
						<circle
							cx={px}
							cy={py}
							r={nodeR * PULSE_CORE * ps}
							fill={NN.energyHi}
							opacity={g * pdim}
						/>
					</g>
				),
			});
		}
	}

	for (const n of nodes) {
		const p = pn[n.id] as Projected;
		const dim = 0.32 + df(p.depth) * 0.68;
		const g = glow[n.id] as number;
		// 结构是白的，能量是蓝的：节点越亮越朝蓝色推，所以"亮"和"带电"是同一件事。
		//
		// 只画实心核，不画周边辉光。点加密之后，膨胀的淡圆会互相叠成一片连续的
		// 雾，格栅就看不见了 —— 亮度全部由颜色和不透明度承担，尺寸恒定。
		items.push({
			depth: p.depth,
			el: (
				<circle
					key={`n${n.id}`}
					cx={p.sx}
					cy={p.sy}
					r={nodeR * p.scale}
					fill={g > 0.55 ? NN.core : g > 0.12 ? NN.energyHi : NN.structure}
					opacity={(0.16 + g * 0.84) * dim}
				/>
			),
		});
	}

	// 画家算法：深度大的（远的）先画。SVG 没有 z-buffer，顺序就是遮挡关系。
	items.sort((a, b) => b.depth - a.depth);

	// 按深度带分组。带内保持已排好的顺序，带之间从远到近 —— 两级都单调，所以
	// 整体画家序不被分带破坏。
	const groups: Item[][] = Array.from({ length: BANDS }, () => []);
	for (const it of items) (groups[bandOf(df(it.depth))] as Item[]).push(it);

	return (
		<AbsoluteFill style={{ background: NN.bg }}>
			{/* 能量抵达输出端时，环境光微微一亮 —— 给"流到了"一个落点。 */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(${scene.glowSize} at 68% 50%, ${NN.energy}1f, transparent 64%)`,
					opacity: 0.35 + warm * 0.65,
				}}
			/>
			<svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
				<defs>
					{bandBlur.map((b, i) =>
						b > 0 ? (
							<filter
								key={i}
								id={BAND_BLUR_ID(scene.id, i)}
								x="-20%"
								y="-20%"
								width="140%"
								height="140%"
							>
								<feGaussianBlur stdDeviation={b} />
							</filter>
						) : null,
					)}
				</defs>
				{groups.map((group, i) => (
					<g
						key={i}
						filter={
							(bandBlur[i] as number) > 0 ? `url(#${BAND_BLUR_ID(scene.id, i)})` : undefined
						}
					>
						{group.map((it) => it.el)}
					</g>
				))}
			</svg>
			{/* 上下压黑，把格栅收进画面里，不让它顶到边框。 */}
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, ${NN.bg} 0%, transparent 20%, transparent 80%, ${NN.bg} 100%)`,
				}}
			/>
		</AbsoluteFill>
	);
};

/** 视频用的 16:9 大画面。 */
export const NNEnergy: React.FC = () => <NNScene scene={MAIN} />;

/** 头像 / README 用的 1:1 小画面。 */
export const NNAvatar: React.FC = () => <NNScene scene={AVATAR} />;
