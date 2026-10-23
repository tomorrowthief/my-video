import { interpolate, useCurrentFrame } from "remotion";
import { clamp, StoryFrame } from "../idioms/StoryArt";
import { General, Plum, Wilds } from "./HistoryArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="opening">
      <Wilds scorch={false} />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          right: -180,
          top: -180,
          background: "#e6ecd7",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 193,
          fontSize: 133,
          fontWeight: 800,
          letterSpacing: 8,
          color: "#6b4c2a",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        望梅止渴
      </div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 365,
          color: "#929174",
          fontSize: 42,
          letterSpacing: 5,
        }}
      >
        想一想，也能止渴
      </div>
      <General x={1330} y={430} scale={1.1} />
      <Plum x={1080} y={280} scale={0.62} />
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 402,
          fontSize: 34,
          color: "#8a6a3f",
          letterSpacing: 3,
        }}
      >
        三国小故事 · 取材《世说新语》
      </div>
    </StoryFrame>
  );
};
