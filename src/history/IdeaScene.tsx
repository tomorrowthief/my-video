import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, SceneTitle, StoryFrame, ThoughtDots } from "../idioms/StoryArt";
import { General, Soldiers, Wilds } from "./HistoryArt";

export const IdeaScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bulb = interpolate(frame, [fps * 0.8, fps * 1.6], [0, 1], clamp);
  return (
    <StoryFrame id="idea">
      <Wilds />
      <SceneTitle note="曹操骑在马上，脑筋一转。">有办法了！</SceneTitle>
      <General x={700} y={430} scale={1.25} />
      <ThoughtDots from={fps * 0.6} x={1120} y={360} />
      <div
        style={{
          position: "absolute",
          left: 1170,
          top: 240,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#f0ca6d",
          border: "6px solid #d8b45c",
          opacity: bulb,
          translate: `0px ${(1 - bulb) * 16}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
        }}
      >
        💡
      </div>
      <div
        style={{
          position: "absolute",
          left: 1340,
          top: 300,
          fontSize: 38,
          color: "#8a6a3f",
          opacity: bulb,
        }}
      >
        前面……有！
      </div>
      <Soldiers x={100} y={700} scale={0.7} count={2} tired />
    </StoryFrame>
  );
};
