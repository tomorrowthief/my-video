import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bubble,
  Character,
  Seedling,
  SceneTitle,
  StoryFrame,
  ThoughtDots,
} from "../idioms/StoryArt";
import { Field, Stump } from "./StumpArt";

export const WaitingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="waiting">
      <Field dusk />
      <SceneTitle note="锄头一扔，他天天守在树桩旁。">
        坐等好运
      </SceneTitle>
      <Stump x={1230} y={545} scale={1.12} />
      <Character
        who="farmer"
        pose={1}
        x={760 + Math.sin((frame / fps) * 1.4) * 10}
        y={430}
        scale={0.9}
        rotation={Math.sin((frame / fps) * 1.4) * 1.2}
      />
      <ThoughtDots from={fps * 1.2} x={1060} y={700} />
      <Seedling x={220} y={530} scale={0.8} />
      <Seedling x={470} y={500} scale={0.72} />
      <div
        style={{
          position: "absolute",
          top: 365,
          left: 150,
          width: 315,
          padding: "15px 28px",
          borderRadius: 22,
          background: "#fff8e9e8",
          color: "#8b8d67",
          fontSize: 37,
          textAlign: "center",
        }}
      >
        白天 → 天黑 → 又白天
      </div>
      <Bubble x={1080} y={150} width={560}>
        兔子呀，快来撞树桩！
      </Bubble>
    </StoryFrame>
  );
};
