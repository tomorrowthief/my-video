import { useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { General, River, Soldiers, Wilds } from "./HistoryArt";

export const FoundScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hop = Math.abs(Math.sin((frame / fps) * 4)) * 10;
  return (
    <StoryFrame id="found">
      <Wilds scorch={false} />
      <River />
      <SceneTitle note="队伍加快脚步，终于找到了水源。">
        痛快喝个够
      </SceneTitle>
      <General x={180} y={430 + hop * 0.4} scale={1.05} />
      <Soldiers x={640} y={590 + hop} scale={0.9} count={3} />
      <Bubble x={200} y={150} width={560}>
        有水啦！大家喝个够！
      </Bubble>
      <div
        style={{
          position: "absolute",
          left: 1520,
          top: 780,
          fontSize: 40,
          color: "#5f87a8",
        }}
      >
        🏞️ 真清凉
      </div>
    </StoryFrame>
  );
};
