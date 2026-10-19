/**
 * 能量节奏：时间 → 亮度。纯函数，不碰 React。
 *
 * 相机固定之后，画面的全部生命都来自能量本身，所以这里是**连续流**而不是单次
 * 呼吸：WAVES 道波前错开相位、不断从左向右滚过网络。任一时刻都有能量在途，
 * 没有死拍。
 *
 * 无缝由构造保证：每道波前的相位是 `t + k/WAVES` 取小数部分，t 走完 0→1 时
 * 整组波前恰好轮转一个身位，回到起始构型。
 *
 * 行程上限取决于具体网络的最晚激活时刻，所以这里是个工厂：createFlow(atMax)
 * 把那个量闭进去，同一套节奏于是能服务不同规模的网络。
 */

/** 0..1 平滑插值，两端斜率为 0。 */
const smoothstep = (x: number): number => {
	const u = x < 0 ? 0 : x > 1 ? 1 : x;
	return u * u * (3 - 2 * u);
};

/** 同时在途的波前数量。3 道 → 画面大约总有一道在网络中段。 */
export const WAVES = 3;

/** 能量抵达后的快起（深度空间单位）。 */
const ATTACK = 0.055;
/** 慢落。比 ATTACK 长得多，所以亮起是"砰"，褪去是"渗"。 */
const RELEASE = 0.2;
/**
 * 余辉：慢落之后还挂着的一层余温，衰减到 0 的额外行程。
 *
 * 比 RELEASE 长一倍半，峰值只有三成 —— 所以读起来是"刚才这里过电了"的痕迹，
 * 而不是第二次亮起。没有这一段的话，波前过去之后画面立刻回到静止格栅，流动
 * 看着像在空网格上平移，而不是在网络里留下轨迹。
 */
const EMBER = 0.5;
/** 余辉段的起始亮度。慢落降到这里就交棒，余下由余辉慢慢收干。 */
const EMBER_PEAK = 0.26;

/**
 * 波前经过时的亮度包络，参数是"波前已越过我多远"。
 *
 * 负 = 还没到，正 = 已过去。区间外恒为 0，各段都用 smoothstep，所以
 * a = −ATTACK、0、RELEASE 三处斜率均为 0 —— 包络全程 C¹ 连续，无折角。
 */
export const envelope = (a: number): number => {
	if (a < -ATTACK || a > RELEASE + EMBER) return 0;
	if (a < 0) return smoothstep((a + ATTACK) / ATTACK);
	// 慢落只降到 EMBER_PEAK，剩下的交给余辉段 —— 两段在 a = RELEASE 处值和斜率
	// 都对得上（smoothstep 在 x=1 处导数为 0），所以接缝看不出来。
	if (a <= RELEASE) return 1 - smoothstep(a / RELEASE) * (1 - EMBER_PEAK);
	return EMBER_PEAK * (1 - smoothstep((a - RELEASE) / EMBER));
};

/**
 * 波前的行程范围。两端各留出包络的全长，所以一道波前是从"完全还没影响到输入
 * 层"滚到"输出层的拖尾也彻底褪尽"。不这样留白的话，波前会在网络边缘带着亮度
 * 凭空出现或消失。
 */
const MARGIN = ATTACK + RELEASE + EMBER + 0.05;
const WF_FROM = -MARGIN;

/**
 * 常驻微光：永不为零，周期恰为 1。保证格栅在波前间隙里也看得见。
 *
 * 基值调高后，未激活的点阵本身就是可读的结构，而不是只能靠能量经过才看得见。
 */
export const idle = (t: number, phase: number): number =>
	0.3 + 0.08 * Math.sin(t * Math.PI * 2 + phase);

/** 一个在边上飞行的能量点：位置 0..1，以及亮度权重。 */
export type Pulse = { readonly p: number; readonly g: number };

/**
 * 拖尾采样数（不含头部）。
 *
 * 流水感来自"同一个点在边上留下的一串残影"：沿运动方向回退几个采样，亮度递
 * 减。4 个足够连成一条线而不是一串珠子，再多就只是增加图元数。
 */
const TRAIL = 4;
/** 拖尾在边上的总长（占整条边的比例）。 */
const TRAIL_SPAN = 0.17;

/** 一套绑定到具体网络的节奏函数。 */
export type Flow = {
	/** 归一化时间 → 第 k 道波前的位置。等速：连续流不该有加减速。 */
	readonly wavefront: (t: number, k: number) => number;
	/** 节点亮度。参数是它自己的激活时刻（由入边沿网络推出来的）。 */
	readonly nodeGlow: (t: number, at: number) => number;
	/** 输出层抵达的强度。用于整场的环境光微微一亮。 */
	readonly arrival: (t: number) => number;
	/** 某条边上所有在途的能量点（含拖尾残影）。 */
	readonly pulses: (t: number, fromAt: number, transit: number) => readonly Pulse[];
};

export const createFlow = (atMax: number): Flow => {
	/**
	 * 上限按最晚激活的节点定，不按层数 —— 传输慢的边会把末端节点推到名义值之后，
	 * 照层数算的话它们的拖尾会被循环切断。
	 */
	const wfTo = atMax + MARGIN;
	if (wfTo < atMax + RELEASE + EMBER) throw new Error(`flow: 行程上限太小，余辉会被砍断。`);

	const wavefront = (t: number, k: number): number => {
		const phase = (t + k / WAVES) % 1;
		return WF_FROM + (wfTo - WF_FROM) * phase;
	};

	// 取 max 而不是求和：两道波前叠在一起时求和会过曝成一片白，而 max 保持
	// "最近那道波前有多强"的读感。
	const peak = (t: number, at: number): number => {
		let g = 0;
		for (let k = 0; k < WAVES; k++) {
			const e = envelope(wavefront(t, k) - at);
			if (e > g) g = e;
		}
		return g;
	};

	return {
		wavefront,
		nodeGlow: peak,
		arrival: (t) => peak(t, atMax),
		/**
		 * 从起点节点的激活时刻出发，走完 transit 抵达终点 —— 于是能量点离开的那一刻
		 * 正是起点亮起的那一刻，抵达的那一刻正是终点可能亮起的那一刻。因果关系因此
		 * 在画面上是闭合的：先看到点飞过来，然后那个节点才亮。
		 *
		 * 一条边上可能同时有多个点（WAVES 道波前），所以返回数组。
		 */
		pulses: (t, fromAt, transit) => {
			const out: Pulse[] = [];
			for (let k = 0; k < WAVES; k++) {
				const head = (wavefront(t, k) - fromAt) / transit;
				if (head < 0 || head > 1) continue;
				// i = 0 是头部，之后沿运动方向往后退 —— 残影落在刚走过的地方，所以读
				// 起来是"流过去"，而不是"推着一团雾"。
				for (let i = 0; i <= TRAIL; i++) {
					const p = head - (i / TRAIL) * TRAIL_SPAN;
					// 退到起点之前就不画了：拖尾不该挂在上一条边上。
					if (p < 0) break;
					// sin 让两端为 0，所以能量点不会在边的端点上突然冒出来；
					// 后一项让残影随距离衰减，头最亮。
					out.push({ p, g: Math.sin(p * Math.PI) * (1 - i / (TRAIL + 1)) ** 1.7 });
				}
			}
			return out;
		},
	};
};

// 构造条件的自检：改了上面任何常数而破坏了前提，模块加载就报错，而不是等到
// 导出后用肉眼发现画面边缘在闪。
if (WF_FROM > -ATTACK) throw new Error(`flow.ts: WF_FROM=${WF_FROM} 太大，波前会带着亮度出现。`);
