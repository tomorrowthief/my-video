import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Character,
  SceneTitle,
  Seedling,
  StoryFrame,
  ThoughtDots,
  storyTiming,
} from "./StoryArt";

export const GuessScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const paragraph = storyTiming.scenes[4].paragraphs[0];
  return (
    <StoryFrame id="guess">
      <SceneTitle note="别着急说答案，先仔细看看。">
        小苗真的长大了吗？
      </SceneTitle>
      <Character
        who="xiaohe"
        pose={1}
        x={130}
        y={391}
        scale={0.98}
        rotation={Math.sin(frame / fps) * 0.6}
      />
      <div
        style={{
          position: "absolute",
          left: 687,
          top: 365,
          width: 430,
          height: 385,
          borderRadius: 48,
          background: "#edeed9",
          border: "3px solid #d7ddbe",
        }}
      >
        <Seedling x={105} y={0} scale={1.03} />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            width: "100%",
            textAlign: "center",
            fontSize: 39,
            color: "#7c8967",
          }}
        >
          原来的小苗
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1195,
          top: 365,
          width: 430,
          height: 385,
          borderRadius: 48,
          background: "#f5ead1",
          border: "3px solid #e8d9b7",
        }}
      >
        <Seedling x={105} y={0} scale={1.03} lift={56} />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            width: "100%",
            textAlign: "center",
            fontSize: 39,
            color: "#a0895a",
          }}
        >
          被拔高的小苗
        </div>
      </div>
      <ThoughtDots
        from={paragraph.startFrame + paragraph.durationInFrames}
        x={1116}
        y={801}
      />
    </StoryFrame>
  );
};
