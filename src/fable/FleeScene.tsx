import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { DustStreaks, Fleeing, Forest, Fox, Tiger } from "./FableArt";

export const FleeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stagger = Math.sin((frame / fps) * 2.2);
  return (
    <StoryFrame id="flee">
      <Forest deep />
      <SceneTitle note="动物们看见的，是狐狸身后的老虎。">
        全都跑光了！
      </SceneTitle>
      <Fleeing kind="deer" x={1180 + stagger * 12} y={340} scale={0.95} flip />
      <Fleeing kind="boar" x={1000 - stagger * 10} y={560} scale={0.95} flip />
      <Fleeing kind="rabbit" x={1420 + stagger * 16} y={660} scale={0.9} flip />
      <DustStreaks x={1050} y={300} />
      <DustStreaks x={940} y={760} />
      <Fox x={180} y={590} scale={1.1} mode="strut" />
      <Tiger x={560} y={500} scale={1.05} mode="shocked" />
      {[1230, 1470, 1050].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: [260, 480, 580][i],
            fontSize: 44,
            color: "#8b5a2a",
            fontWeight: 700,
            opacity: 0.85,
          }}
        >
          逃呀——！
        </div>
      ))}
    </StoryFrame>
  );
};
