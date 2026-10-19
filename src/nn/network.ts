/**
 * 网络的几何、拓扑与激活时刻。
 *
 * 布局：层沿 X 轴从左到右排开，每一层是 Y-Z 平面上的一张规整网格（竖向 ×
 * 纵深）。节点位置完全固定、无抖动 —— 要的是一个精密的格栅，而不是有机生长
 * 的形状。
 *
 * 点亮的时刻不是按层给的，而是**沿边推出来的**：每条边有自己的传输时长，节点
 * 在第一个能量点真正抵达时亮起。于是同一层的节点先后错开，入边多、边权重高的
 * 先亮 —— 这个先后关系是拓扑的后果，不是加在层上的装饰。
 *
 * 渲染路径里一个 Math.random() 都不能有：那会让每帧都是一张不同的网络，导出
 * 结果是闪烁的雪花。这里唯一的"随机"是边权重和传输时长，来自种子哈希，构建
 * 时定稿。
 *
 * 整个模块是一个纯工厂：同一套拓扑规则要生成两张不同尺度的网络（16:9 主场景
 * 和 1:1 头像），所以几何参数一律从 config 进来，不写成模块常数。
 */

import type { Vec3 } from "./projection";

/** 整数 → [0,1) 的确定性哈希。无状态：给定 i 永远得到同样的值。 */
const hash = (i: number): number => {
	let h = (i + 0x9e3779b9) | 0;
	h = (h ^ (h >>> 16)) * 0x85ebca6b;
	h = (h ^ (h >>> 13)) * 0xc2b2ae35;
	h = h ^ (h >>> 16);
	return ((h >>> 0) % 100000) / 100000;
};

export type NetworkConfig = {
	/** 层内竖向行数。 */
	readonly rows: number;
	/** 层内纵深列数。这一维撑起立体感。 */
	readonly cols: number;
	/**
	 * 层数。决定流动的节拍（波前要穿过几个间隙），改它会连带改掉时间设计 ——
	 * 想调密度优先改 rows/cols。
	 */
	readonly layers: number;
	/** 层间距（沿 X，即流动方向）。 */
	readonly layerX: number;
	/** 层内竖向间距。 */
	readonly rowY: number;
	/** 层内纵深间距。 */
	readonly colZ: number;
	/**
	 * 边的保留门槛：权重低于它的边不画。
	 *
	 * 全连接的边数是节点数的平方量级，画出来是一块均匀的灰雾，格栅结构反而看
	 * 不见了。门槛要随节点数反向收紧，让画面上的边数大致恒定 —— 密度该由点来
	 * 承担，边只负责说明连接关系。
	 */
	readonly keep: number;
};

export type Node = {
	readonly id: number;
	readonly layer: number;
	readonly pos: Vec3;
	/** 常驻微光的相位，让格栅不整体同步呼吸。 */
	readonly phase: number;
	/**
	 * 激活时刻（深度空间）。由入边传播算出，见 buildActivation。
	 * 输入层是注入时刻，其余层是"第一个能量点抵达"的时刻。
	 */
	readonly at: number;
};

export type Edge = {
	readonly from: number;
	readonly to: number;
	/** 0..1。映射到线宽、不透明度，以及边上能量点的亮度。 */
	readonly weight: number;
	/** 传输时长（深度空间）。能量点走完这条边所需的"距离"。 */
	readonly transit: number;
};

/** 一张构建好的网络。所有字段只读，构建后不再变。 */
export type Network = {
	readonly nodes: readonly Node[];
	readonly edges: readonly Edge[];
	/** 入边查询。绘制层用它算节点亮度该归功于哪条边。 */
	readonly incoming: (id: number) => readonly Edge[];
	/**
	 * 激活时刻的最大值。波前的行程上限要据此定 —— 按层数定的话，传输慢的边会
	 * 把末端节点推到名义值之后，它们的拖尾就被循环切断了。
	 */
	readonly atMax: number;
	readonly layers: number;
	/** 相邻层之间的间隙数 = 能量要穿过的段数。 */
	readonly gaps: number;
};

/** 还没算出激活时刻的节点。 */
type Raw = Omit<Node, "at">;

/**
 * 传输时长的离散幅度（占名义值的比例）。
 *
 * 这是"真实感"的来源：所有边等速的话，整层还是会同时亮起 —— 只是晚一点。有了
 * 快慢不同的边，能量就是先沿快边抵达、再被慢边补齐，同一层于是自然散开。
 */
const TRANSIT_SPREAD = 0.55;

export const buildNetwork = (cfg: NetworkConfig): Network => {
	const { rows, cols, layers, layerX, rowY, colZ, keep } = cfg;
	if (layers < 2) throw new Error("network: 至少要两层才有流动。");
	const gaps = layers - 1;
	/** 一个间隙的名义传输时长。 */
	const transit = 1 / gaps;

	const raw: Raw[] = [];
	let id = 0;
	for (let layer = 0; layer < layers; layer++) {
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				// 行列都居中，所以各层对齐在同一根轴上。
				const u = rows === 1 ? 0 : row - (rows - 1) / 2;
				const v = cols === 1 ? 0 : col - (cols - 1) / 2;
				raw.push({
					id,
					layer,
					pos: {
						x: (layer - (layers - 1) / 2) * layerX,
						y: u * rowY,
						z: v * colZ,
					},
					phase: hash(id * 13 + 5) * Math.PI * 2,
				});
				id++;
			}
		}
	}

	const edges: Edge[] = [];
	let seed = 0;
	for (const from of raw) {
		if (from.layer === layers - 1) continue;
		for (const to of raw) {
			if (to.layer !== from.layer + 1) continue;
			const w = hash(seed * 31 + 3);
			const jitter = hash(seed * 7 + 101);
			seed++;
			if (w < keep) continue;
			// 重映射到 0..1，否则保留的边权重全挤在门槛附近，对比度浪费掉了。
			const weight = (w - keep) / (1 - keep);
			// 强边快、弱边慢，再叠一点离散让同权重的边也不完全同步。
			const speed = 0.45 + weight * 0.4 + jitter * 0.3;
			edges.push({ from: from.id, to: to.id, weight, transit: (transit * TRANSIT_SPREAD) / speed });
		}
	}

	// 补边：随机取舍会让相当一部分节点一条入边都不剩（实测约三成）。那些节点只能
	// 退回"按层的名义时刻"，于是它们是齐刷刷亮的 —— 正是要避免的那种假。
	//
	// 所以给每个这样的节点补一条入边，连它在上一层里空间最近的节点。补最近的而不
	// 是随便一条：长边会横穿整个格栅，在斜视角下很显眼。一个节点只补一条，边数只
	// 增加这些孤立节点的数量，稀疏的观感不受影响。
	const hasIn = new Set(edges.map((e) => e.to));
	for (const to of raw) {
		if (to.layer === 0 || hasIn.has(to.id)) continue;
		let near = -1;
		let best = Infinity;
		for (const from of raw) {
			if (from.layer !== to.layer - 1) continue;
			const dy = from.pos.y - to.pos.y;
			const dz = from.pos.z - to.pos.z;
			const d = dy * dy + dz * dz;
			if (d < best) {
				best = d;
				near = from.id;
			}
		}
		if (near < 0) continue;
		// 补的边给中等权重：它代表"这个节点确实被连上了"，不该抢强边的视觉重量。
		const weight = 0.3 + hash(to.id * 53 + 7) * 0.25;
		const speed = 0.45 + weight * 0.4 + hash(to.id * 11 + 83) * 0.3;
		edges.push({ from: near, to: to.id, weight, transit: (transit * TRANSIT_SPREAD) / speed });
	}

	const inEdges: Edge[][] = raw.map(() => []);
	for (const e of edges) (inEdges[e.to] as Edge[]).push(e);

	// 沿边推出每个节点的激活时刻。
	//
	// 输入层在 0 注入（层内也错开一点，否则第一层仍是齐刷刷亮起）。其余节点取
	// min(入边起点的激活时刻 + 该边传输时长) —— 即最早抵达的那个能量点。取 min
	// 而不是 max 或均值：节点该在**第一个**信号到达时就亮，而不是等所有信号凑齐。
	//
	// 逐层推进即可，不需要通用最短路：边只连相邻层，所以按 layer 升序扫一遍时，
	// 每条入边的起点必然已经定稿。
	const at = new Array<number>(raw.length).fill(Infinity);
	// 注入时刻按竖向位置铺开：读起来像一道斜扫进来的信号，而不是一堵墙。按实际
	// 竖向跨度归一化，而不是写死一个像素值 —— 改 rowY 时这里自动跟上。
	const half = ((rows - 1) / 2) * rowY || 1;
	for (const n of raw) {
		if (n.layer === 0) at[n.id] = (n.pos.y / half) * 0.05 + hash(n.id * 17 + 29) * 0.03;
	}
	// 输入层可能出现负值（y 为负），整体平移到 0 起步。
	let base = Infinity;
	for (const n of raw) if (n.layer === 0) base = Math.min(base, at[n.id] as number);
	for (const n of raw) if (n.layer === 0) at[n.id] = (at[n.id] as number) - base;

	for (let layer = 1; layer < layers; layer++) {
		for (const n of raw) {
			if (n.layer !== layer) continue;
			let best = Infinity;
			for (const e of inEdges[n.id] as Edge[]) {
				const cand = (at[e.from] as number) + e.transit;
				if (cand < best) best = cand;
			}
			// 补边之后这里基本不会再触发，但留着兜底：没有入边的节点给一个按层的
			// 名义时刻，让它仍然参与流动，而不是永远暗着（那会在格栅上留下死点）。
			at[n.id] = best === Infinity ? layer * transit : best;
		}
	}

	const nodes: readonly Node[] = raw.map((n) => ({ ...n, at: at[n.id] as number }));
	return {
		nodes,
		edges,
		incoming: (i) => inEdges[i] as Edge[],
		atMax: nodes.reduce((m, n) => (n.at > m ? n.at : m), 0),
		layers,
		gaps,
	};
};
