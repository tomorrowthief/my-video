import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Forest, Fox, Tiger } from "./FableArt";

export const LessonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = interpolate(frame, [fps * 0.4, fps * 1.4], [0, 1], clamp);
  return (
    <StoryFrame id="lesson">
      <Forest />
      <SceneTitle note="大家怕的，是狐狸身后的老虎。">
        威风是谁的？
      </SceneTitle>
      <Fox x={150} y={620} scale={0.95} mode="scheme" />
      <Tiger x={620} y={560} scale={0.8} />
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 600,
          fontSize: 44,
          color: "#7b885b",
          fontWeight: 700,
          opacity: show,
        }}
      >
        借 →
      </div>
      <div
        style={{
          position: "absolute",
          left: 1210,
          top: 380,
          width: 540,
          padding: "30px 36px",
          borderRadius: 40,
          background: "#fff8e9ee",
          border: "3px solid #e2cda8",
          fontSize: 43,
          lineHeight: 1.9,
          color: "#647e79",
          textAlign: "center",
          opacity: show,
        }}
      >
        动物们逃走的理由
        <br />
        <span style={{ color: "#b08a4b", fontSize: 38 }}>
          是老虎，不是狐狸
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1230,
          top: 705,
          fontSize: 34,
          color: "#8a8c6b",
          lineHeight: 1.7,
        }}
      >
        借来的威风吓住了别人，
        <br />
        却不是自己的本领。
      </div>
    </StoryFrame>
  );
};
