import { useVideoConfig } from "remotion";
import { Bubble, SceneTitle, StoryFrame, ThoughtDots } from "../idioms/StoryArt";
import { Forest, Fox, Tiger } from "./FableArt";

export const TrickScene = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="trick">
      <Forest />
      <SceneTitle note="狐狸眼珠一转，计上心来。">
        天帝派来的王？
      </SceneTitle>
      <Fox
        x={210}
        y={520}
        scale={1.7}
        mode="scheme"
      />
      <ThoughtDots from={fps * 0.8} x={610} y={600} />
      <Tiger x={1080} y={520} scale={0.95} mode="shocked" />
      <Bubble x={260} y={150} width={700}>
        慢着！我是天帝派来的百兽之王，你敢吃我吗？
      </Bubble>
      <div
        style={{
          position: "absolute",
          left: 1310,
          top: 430,
          fontSize: 52,
          color: "#8b5a2a",
          fontWeight: 700,
        }}
      >
        ？
      </div>
    </StoryFrame>
  );
};
