/**
 * 3D → 2D 透视投影。
 *
 * 没有引入 three.js：这个画面本质是"发光的点和线"，一个针孔相机模型就够
 * 表达，而且纯函数意味着逐帧完全确定 —— 导出时不需要配 WebGL renderer。
 *
 * 这里的函数全部无状态、不读模块级的场景常数：同一套数学要同时服务 16:9 的
 * 主场景和 1:1 的头像场景，尺度不同的那些量一律从参数进来。
 */

export type Vec3 = { readonly x: number; readonly y: number; readonly z: number };

/** 投影后的屏幕坐标，外加绘制需要的深度信息。 */
export type Projected = {
	readonly sx: number;
	readonly sy: number;
	/** 透视系数：近 > 1，远 < 1。用来缩放半径和线宽。 */
	readonly scale: number;
	/** 相机空间深度。画家算法排序用，大的先画。 */
	readonly depth: number;
};

/**
 * 针孔相机的两个尺度参数。
 *
 * `dist` 是相机到原点的距离，`focal` 是焦距；两者同量级 → 中等透视，不会鱼眼
 * 也不会扁平。场景尺寸变了就得一起变：场景缩小而 dist 不变的话透视会被压平。
 */
export type Lens = { readonly dist: number; readonly focal: number };

/**
 * 绕 Y 轴转 `yaw`、绕 X 轴转 `pitch` 后做针孔投影。
 *
 * 先 yaw 后 pitch 的顺序是刻意的：yaw 是主运动（左右摆），pitch 是叠加的小
 * 幅点头。反过来会让点头的方向随摆动而倾斜，看着像相机在歪。
 */
export const project = (
	p: Vec3,
	yaw: number,
	pitch: number,
	cx: number,
	cy: number,
	lens: Lens,
): Projected => {
	const cosY = Math.cos(yaw);
	const sinY = Math.sin(yaw);
	const x1 = p.x * cosY + p.z * sinY;
	const z1 = -p.x * sinY + p.z * cosY;

	const cosP = Math.cos(pitch);
	const sinP = Math.sin(pitch);
	const y2 = p.y * cosP - z1 * sinP;
	const z2 = p.y * sinP + z1 * cosP;

	// z2 + dist 恒为正：场景半径远小于 dist，所以不会出现除零或翻转。
	const scale = lens.focal / (z2 + lens.dist);
	return { sx: cx + x1 * scale, sy: cy + y2 * scale, scale, depth: z2 };
};

/**
 * depth → 0（最远）..1（最近）。空气透视和景深都从这个值派生，这样两者
 * 永远一致，不会出现"远处很暗但很清晰"的矛盾。
 *
 * `span` 是场景在相机空间的深度半幅，必须跟实际布局匹配：定得过大的话所有元素
 * 都挤进中间那个深度带，景深和空气透视就全失效了。它不是常数 —— 纵深的主要来源
 * 是层的 X 跨度经 yaw 旋转投到 z 上的分量，层数、层间距、yaw 任一个变了它都得跟着变。
 * 所以由场景配置算出来传进来，见 scenes.ts 的 depthSpanOf。
 */
export const depthFactor = (depth: number, span: number): number => {
	// 注意是 (span − depth)：depth 越大越远，而这个值越大越近。
	const t = (span - depth) / (span * 2);
	return t < 0 ? 0 : t > 1 ? 1 : t;
};

/** 景深带数量。三个滤镜而不是每元素一个 —— 几百个 SVG 滤镜跑不动。 */
export const BANDS = 3;

/**
 * 把 depthFactor 切成 BANDS 个连续的带，0 是最远。
 *
 * 带必须在深度上连续（而不是按层或按元素类型分组），否则跨带的画家序会
 * 错 —— 后画的带会整体盖住前一带，远处的节点就跑到近处前面去了。
 */
export const bandOf = (df: number): number => {
	const b = Math.floor(df * BANDS);
	return b < 0 ? 0 : b >= BANDS ? BANDS - 1 : b;
};

/**
 * 景深滤镜的 DOM id，按场景隔开。
 *
 * SVG 的 `url(#id)` 是全文档解析的：两个场景如果用同名 id（Studio 的预览里、或
 * 同一页放两个 Player 时就会同时存在），后者会被解析到前者的滤镜上 —— 画面不
 * 报错，只是模糊半径悄悄用错了那一份。
 */
export const BAND_BLUR_ID = (sceneId: string, band: number): string => `nnb-${sceneId}-${band}`;
