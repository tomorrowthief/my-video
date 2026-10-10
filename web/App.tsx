import { Player } from "@remotion/player";
import { useState } from "react";
import { COLORS, FONT, MONO } from "../src/theme";
import { VIDEOS } from "../src/videos";

/** Minutes:seconds for a frame count at a given rate. */
const runtime = (frames: number, fps: number): string => {
	const total = Math.round(frames / fps);
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export const App: React.FC = () => {
	const [index, setIndex] = useState(0);
	const video = VIDEOS[index];
	if (video === undefined) throw new Error("web: the registry is empty");

	return (
		<div
			style={{
				minHeight: "100vh",
				background: COLORS.bgDeep,
				color: COLORS.text,
				fontFamily: FONT,
				padding: "max(28px, env(safe-area-inset-top)) 20px 64px",
			}}
		>
			<div style={{ maxWidth: 1180, margin: "0 auto" }}>
				<h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px" }}>
					讲解视频
				</h1>
				<p style={{ color: COLORS.dim, margin: "0 0 26px", fontSize: 16 }}>
					在浏览器里实时渲染，可以拖时间轴
				</p>

				<div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
					{VIDEOS.map((v, i) => {
						const on = i === index;
						return (
							<button
								key={v.key}
								type="button"
								onClick={() => setIndex(i)}
								style={{
									cursor: "pointer",
									background: on ? COLORS.accentSoft : COLORS.panel,
									border: `1px solid ${on ? COLORS.accent : COLORS.border}`,
									color: on ? COLORS.accent : COLORS.dim,
									borderRadius: 11,
									padding: "11px 18px",
									fontFamily: FONT,
									fontSize: 16,
								}}
							>
								{v.title}
								<span style={{ fontFamily: MONO, fontSize: 13, marginLeft: 10, opacity: 0.75 }}>
									{runtime(v.timing.totalFrames, v.timing.fps)}
								</span>
							</button>
						);
					})}
				</div>

				<div
					style={{
						border: `1px solid ${COLORS.border}`,
						borderRadius: 14,
						overflow: "hidden",
						background: "#000",
					}}
				>
					<Player
						// Remounting per video keeps one video's playhead and buffered
						// narration from leaking into the next.
						key={video.key}
						component={video.Component}
						durationInFrames={video.timing.totalFrames}
						fps={video.timing.fps}
						compositionWidth={video.timing.width}
						compositionHeight={video.timing.height}
						style={{ width: "100%" }}
						controls
						doubleClickToFullscreen
						acknowledgeRemotionLicense
					/>
				</div>

				<p style={{ color: COLORS.faint, fontSize: 13, marginTop: 22, fontFamily: MONO }}>
					Remotion · 旁白时间轴决定节奏，改一句话整片自动重剪
				</p>
			</div>
		</div>
	);
};
