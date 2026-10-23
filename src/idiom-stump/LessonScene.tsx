import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CareIcon,
  Character,
  SceneTitle,
  StoryFrame,
  clamp,
} from "../idioms/StoryArt";
import { Field } from "./StumpArt";

export const LessonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="lesson">
      <Field withered />
      <SceneTitle note="好运气是偶然，耕耘才是自己的。">
        运气与耕耘
      </SceneTitle>
      <Character
        who="xiaohe"
        pose={2}
        x={96}
        y={415}
        scale={0.92}
        rotation={Math.sin((frame / fps) * 0.9) * 0.8}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 350,
          width: 480,
          padding: "30px 36px",
          borderRadius: 40,
          background: "#fff8e9ee",
          border: "3px solid #e2cda8",
          fontSize: 45,
          lineHeight: 1.9,
          color: "#647e79",
          textAlign: "center",
          opacity: interpolate(frame, [fps * 0.4, fps * 1.4], [0, 1], clamp),
        }}
      >
        偶然的运气
        <br />
        <span style={{ color: "#b08a4b" }}>不会天天来敲门</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1255,
          top: 400,
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#647e79",
          }}
        >
          <CareIcon kind="water" size={86} />
          按时浇灌
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#9c8751",
          }}
        >
          <CareIcon kind="sun" size={86} />
          天天照料
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#7b885b",
          }}
        >
          <CareIcon kind="time" size={86} />
          耐心等待
        </div>
      </div>
    </StoryFrame>
  );
};
