import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Heat, Soldiers, Wilds } from "./HistoryArt";

export const ThirstyScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sway = Math.sin((frame / fps) * 1.6) * 3;
  return (
    <StoryFrame id="thirsty">
      <Wilds />
      <SceneTitle note="嘴唇发干，脚步越来越慢。">嗓子直冒烟</SceneTitle>
      <Soldiers x={330} y={590} scale={1.0} count={4} tired />
      <Heat x={480} y={960} />
      <Heat x={1050} y={990} />
      {[420, 720, 1010].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x + sway,
            top: 520 + (i % 2) * 40,
            fontSize: 40,
            color: "#5f87a8",
          }}
        >
          💧
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 380,
          width: 560,
          padding: "26px 32px",
          borderRadius: 30,
          background: "#fff8e9ee",
          border: "3px solid #e2cda8",
          fontSize: 42,
          color: "#6b5a3f",
          lineHeight: 1.7,
          textAlign: "center",
          transform: `rotate(${sway * 0.3}deg)`,
        }}
      >
        水袋空空荡荡
        <br />
        <span style={{ color: "#b08a4b" }}>一滴水也倒不出来了</span>
      </div>
    </StoryFrame>
  );
};
