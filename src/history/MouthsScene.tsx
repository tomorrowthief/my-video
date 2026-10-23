import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Plum, Soldiers, Wilds } from "./HistoryArt";

export const MouthsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const juicy = interpolate(frame, [fps * 0.5, fps * 1.8], [0, 1], clamp);
  return (
    <StoryFrame id="mouths">
      <Wilds />
      <SceneTitle note="一想到酸酸的梅子，嘴里生出了口水。">
        想想就流口水
      </SceneTitle>
      <Plum x={220} y={330} scale={0.9} />
      <Soldiers x={620} y={560} scale={0.95} count={4} />
      {[760, 1020, 1280].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 420 + (i % 2) * 60,
            fontSize: 46,
            color: "#5f87a8",
            opacity: juicy,
            translate: `0px ${(1 - juicy) * 20}px`,
          }}
        >
          💧
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 560,
          fontSize: 44,
          color: "#a5604a",
          fontWeight: 700,
          opacity: juicy,
        }}
      >
        呀——好酸！
      </div>
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 330,
          width: 520,
          padding: "26px 32px",
          borderRadius: 30,
          background: "#fff8e9ee",
          border: "3px solid #e2cda8",
          fontSize: 40,
          color: "#6b5a3f",
          lineHeight: 1.8,
          textAlign: "center",
          opacity: juicy,
        }}
      >
        口水冒出来，
        <br />
        <span style={{ color: "#5f7a48" }}>脚下也来了力气</span>
      </div>
    </StoryFrame>
  );
};
