import { interpolate, useCurrentFrame } from "remotion";
import { clamp, StoryFrame } from "../idioms/StoryArt";
import { NorthWind, Sky, SunChar } from "./WindArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="opening">
      <Sky />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: -260,
          top: -260,
          background: "#e6ecd7",
          opacity: 0.6,
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
          color: "#5f6a72",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        北风与太阳
      </div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 365,
          color: "#7b8063",
          fontSize: 42,
          letterSpacing: 5,
        }}
      >
        谁的本领大？
      </div>
      <NorthWind x={620} y={240} scale={0.9} blow={0.5} />
      <SunChar x={1420} y={220} scale={0.9} warm={0.4} />
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 330,
          fontSize: 64,
          fontWeight: 800,
          color: "#8a8c6b",
        }}
      >
        VS
      </div>
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 905,
          fontSize: 34,
          color: "#819566",
          letterSpacing: 3,
        }}
      >
        伊索寓言 · 第一集
      </div>
    </StoryFrame>
  );
};
