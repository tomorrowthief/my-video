import { Reveal } from "../components/Bits";
import { useSceneFrame } from "../components/Stage";
import { COLORS, FONT, MONO, easeInOut, easeOut, since } from "../theme";
import type { SceneTiming } from "../types";
import { MATH_COLORS } from "./palette";

const METHODS = [
	{ name: "列表法", essence: "试出规律", at: 2, color: MATH_COLORS.chicken },
	{ name: "假设法", essence: "用规律算", at: 3, color: MATH_COLORS.key },
	{ name: "抬腿法", essence: "把规律变成动作", at: 4, color: MATH_COLORS.rabbit },
] as const;

export const M4Converge: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
	const { active, frame } = useSceneFrame(scene);

	// One interpolation drives the whole ending: the three columns slide towards
	// the middle and dim, and the sentence they share rises out of the gap.
	const conv = easeInOut(since(frame, scene.paragraphs[5].startFrame, 34));
	const answer = easeOut(since(frame, 0, 24));

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 46 }}>
			<div style={{ display: "flex", alignItems: "baseline", gap: 28, opacity: answer * (1 - conv * 0.7) }}>
				<span style={{ fontFamily: FONT, fontSize: 38, color: COLORS.dim }}>三种办法，同一个答案</span>
				<span style={{ fontFamily: MONO, fontSize: 56, color: MATH_COLORS.rabbit }}>12 只兔</span>
			</div>

			<div style={{ position: "relative", height: 300 }}>
				<div style={{ display: "flex", gap: 36, justifyContent: "space-between" }}>
					{METHODS.map((method, i) => {
						const lit = active >= method.at;
						return (
							<div
								key={method.name}
								style={{
									flex: 1,
									padding: "32px 34px",
									borderRadius: 18,
									background: lit ? COLORS.panelHi : COLORS.panel,
									border: `1px solid ${lit ? method.color : COLORS.border}`,
									boxShadow: lit ? `0 0 34px ${method.color}2e` : "none",
									opacity: (lit ? 1 : 0.34) * (1 - conv * 0.82),
									translate: `${(1 - i) * conv * 320}px 0px`,
								}}
							>
								<div
									style={{
										fontFamily: FONT,
										fontSize: 34,
										color: lit ? method.color : COLORS.faint,
										marginBottom: 18,
									}}
								>
									{method.name}
								</div>
								<div style={{ fontFamily: FONT, fontSize: 28, color: COLORS.text, lineHeight: 1.45 }}>
									{method.essence}
								</div>
							</div>
						);
					})}
				</div>

				{conv > 0.01 ? (
					<div
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							opacity: conv,
							scale: String(0.86 + conv * 0.14),
						}}
					>
						<div
							style={{
								padding: "38px 54px",
								borderRadius: 20,
								background: MATH_COLORS.keySoft,
								border: `1px solid ${MATH_COLORS.key}`,
								boxShadow: `0 0 60px ${MATH_COLORS.key}33`,
								textAlign: "center",
							}}
						>
							<div
								style={{
									fontFamily: FONT,
									fontSize: 21,
									letterSpacing: "0.18em",
									color: MATH_COLORS.key,
									marginBottom: 18,
								}}
							>
								说到底，讲的是同一句话
							</div>
							<div style={{ fontFamily: FONT, fontSize: 56, color: COLORS.text, lineHeight: 1.3 }}>
								一只<span style={{ color: MATH_COLORS.rabbit }}>兔</span>，比一只
								<span style={{ color: MATH_COLORS.chicken }}>鸡</span>，多{" "}
								<span style={{ color: MATH_COLORS.key }}>2 只脚</span>
							</div>
						</div>
					</div>
				) : null}
			</div>

			{active >= 1 && conv < 0.5 ? (
				<Reveal at={scene.paragraphs[1].startFrame}>
					<div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.faint, opacity: 1 - conv * 2 }}>
						再回头看一眼它们
					</div>
				</Reveal>
			) : null}
		</div>
	);
};
