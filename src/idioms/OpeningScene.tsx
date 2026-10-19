import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, StoryFrame, clamp } from "./StoryArt";
import { StoryBook } from "./StoryBook";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="opening">
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
          width: 340,
          height: 340,
          borderRadius: "50%",
          left: -160,
          bottom: -150,
          background: "#efd9a5",
          opacity: 0.45,
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
          color: "#50633e",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        拔苗助长
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
        长大，有自己的节奏
      </div>
      <Character
        who="xiaohe"
        x={132}
        y={443}
        scale={0.78}
        rotation={Math.sin((frame / fps) * 1.3) * 1.2}
      />
      <div
        style={{
          position: "absolute",
          left: 510,
          top: 558,
          color: "#8b906d",
          fontSize: 35,
          letterSpacing: 3,
        }}
      >
        你好呀，
        <br />
        <span style={{ fontSize: 52, color: "#667d4e", fontWeight: 700 }}>
          我是小禾
        </span>
      </div>
      <StoryBook />
    </StoryFrame>
  );
};
