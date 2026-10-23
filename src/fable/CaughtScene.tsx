import { useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Forest, Fox, Tiger } from "./FableArt";

export const CaughtScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tremble = Math.sin((frame / fps) * 9) * 2;
  return (
    <StoryFrame id="caught">
      <Forest deep />
      <SceneTitle note="一只狐狸被扑住了。">跑不掉啦</SceneTitle>
      <Tiger x={880} y={430} scale={1.3} mode="prowl" />
      <Fox x={1060} y={745} scale={0.9} />
      <div
        style={{
          position: "absolute",
          left: 1075,
          top: 660,
          fontSize: 46,
          color: "#8b5a2a",
          translate: `0px ${tremble}px`,
        }}
      >
        ！
      </div>
      <Bubble x={1130} y={150} width={620}>
        哈哈，今天的午餐有着落啦！
      </Bubble>
    </StoryFrame>
  );
};
