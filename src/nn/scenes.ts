/**
 * 场景配置：同一套引擎的两个取景。
 *
 * MAIN 是 16:9 的大画面，密度拉满，给视频用。AVATAR 是 1:1 的小画面，节点少
 * 一半以上、单个更大 —— 头像和 README 里的图会被缩到一两百像素显示，主场景那
 * 四百多个点在那个尺寸下会糊成一团噪点。
 *
 * 两者共用 network / flow / projection，只有几何尺度和绘制粗细不同。
 */

import { createFlow, type Flow } from "./flow";
import { buildNetwork, type Network, type NetworkConfig } from "./network";
import type { Lens } from "./projection";

export type Scene = {
	/** 场景标识。用来给 SVG 滤镜的 id 加前缀，见 BAND_BLUR_ID。 */
	readonly id: string;
	readonly width: number;
	readonly height: number;
	readonly fps: number;
	readonly durationInFrames: number;
	/**
	 * 方位角。取正值，于是沿 +X 的输出端朝观众这一侧偏 —— 能量一路从远处的小格栅
	 * 流向近处的大格栅，景深本身成了流动方向的一部分。
	 *
	 * 角度压到这么小，立体感就主要靠透视缩放和空气透视来背，而不是靠"看得见侧
	 * 面"。好处是流动方向保持水平，层与层读起来是整齐的竖列。
	 */
	readonly yaw: number;
	/** 极轻的俯视。只要够让每层在纵深方向铺开的那一维不完全退化成一条线。 */
	readonly pitch: number;
	readonly lens: Lens;
	/**
	 * 深度半幅。几何上的真实半幅见 geometricDepthSpan()，但这里刻意取得更小：
	 * 远近两端因此会夹到 0 / 1，中段的对比被拉开 —— 空气透视和景深读起来更果断。
	 * 取真实值的话整场的明暗差会平掉一半。
	 */
	readonly depthSpan: number;
	/** 每带的模糊半径，远处更糊。单位是 SVG 用户坐标。 */
	readonly bandBlur: readonly number[];
	/** 节点基准半径（再乘透视系数）。能量点的尺寸按固定比例从它派生。 */
	readonly nodeR: number;
	/** 边的基准线宽（再乘透视系数和权重）。 */
	readonly edgeW: number;
	/** 环境光的尺寸，跟画幅走。 */
	readonly glowSize: string;
	readonly network: Network;
	readonly flow: Flow;
};

/** 能量点的尺寸相对 nodeR 的比例：外圈淡光 / 亮核。 */
export const PULSE_HALO = 1.09;
export const PULSE_CORE = 0.37;

/**
 * 布局在相机空间的真实深度半幅。只用来核对 depthSpan 有没有定得荒唐 ——
 * 见 verify.ts。
 */
export const geometricDepthSpan = (cfg: NetworkConfig, yaw: number, pitch: number): number => {
	const x = ((cfg.layers - 1) / 2) * cfg.layerX;
	const y = ((cfg.rows - 1) / 2) * cfg.rowY;
	const z = ((cfg.cols - 1) / 2) * cfg.colZ;
	const z1 = Math.abs(x * Math.sin(yaw)) + Math.abs(z * Math.cos(yaw));
	return Math.abs(y * Math.sin(pitch)) + z1 * Math.cos(pitch);
};

const deg = (d: number): number => (d * Math.PI) / 180;

/** 主场景：2560×1440，6 层 × 11×7 = 462 个节点。 */
const MAIN_NET: NetworkConfig = {
	rows: 11,
	cols: 7,
	layers: 6,
	// 这三个间距随画布一起放大（2560×1440 相对 1920×1080 是 1.33 倍）。
	layerX: 320,
	rowY: 62,
	colZ: 66,
	keep: 0.985,
};

const mainNetwork = buildNetwork(MAIN_NET);

export const MAIN: Scene = {
	id: "main",
	width: 2560,
	height: 1440,
	fps: 30,
	durationInFrames: 14 * 30,
	yaw: deg(13),
	pitch: deg(5),
	lens: { dist: 1180, focal: 1180 },
	depthSpan: 180,
	bandBlur: [2.6, 0.9, 0],
	nodeR: 4.6,
	// 1.0 = 不缩放。边宽的基准形状写在组件里，这里只是各场景的倍率。
	edgeW: 1,
	glowSize: "1000px 700px",
	network: mainNetwork,
	flow: createFlow(mainNetwork.atMax),
};

/**
 * 头像场景：1024×1024，4 层 × 8×4 = 128 个节点。
 *
 * 层数从 6 减到 4：方形画幅横向放不下六列而不挤。节点数减到约四分之一、单个
 * 半径放大到 1.6 倍 —— 缩到 200px 显示时仍然看得出是一张网，而不是一片麻点。
 * 模糊也压掉一半：小尺寸下景深模糊只会让人觉得图没对上焦。
 */
const AVATAR_NET: NetworkConfig = {
	rows: 8,
	cols: 4,
	layers: 4,
	layerX: 180,
	rowY: 70,
	colZ: 72,
	// 节点少 → 相邻层之间的配对数也少（8×4 的两层间是 1024 对 × 3 个间隙）。
	// 门槛要相应放松，否则剩不下几条边。
	keep: 0.94,
};

const avatarNetwork = buildNetwork(AVATAR_NET);

export const AVATAR: Scene = {
	id: "avatar",
	width: 1024,
	height: 1024,
	// GIF 的帧率上限实际在 20 左右（延迟是 1/100 秒的整数倍，50fps 以上没法均匀）。
	// 直接按 20fps 设计，导出时就不用抽帧，循环的无缝也不会被抽坏。
	fps: 20,
	durationInFrames: 8 * 20,
	yaw: deg(13),
	pitch: deg(5),
	// 场景比主场景小得多，lens 要跟着缩，否则透视会被压平成正交投影。
	lens: { dist: 700, focal: 700 },
	depthSpan: 95,
	bandBlur: [1.2, 0.4, 0],
	nodeR: 7.5,
	// 画幅只有主场景的四成宽，线宽得按比例加粗，否则缩到 200px 显示时边就消失了。
	edgeW: 1.35,
	glowSize: "520px 420px",
	network: avatarNetwork,
	flow: createFlow(avatarNetwork.atMax),
};
