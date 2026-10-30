import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Fog, StrawBoat, Stockade } from "./ArrowsArt";

export const FogScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sail = (frame / fps) * 26;
  return (
    <StoryFrame id="fog">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg,#5c6b76 0%,#8b96a0 62%,#71828c 100%)",
        }}
      />
      <Fog density={0.62} />
      <Stockade x={1380} y={470} scale={0.9} />
      <StrawBoat x={-120 + sail} y={640} scale={0.85} covered />
      <StrawBoat x={-560 + sail} y={560} scale={0.7} covered />
      {[1120, 760, 420].map((x, i) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 210 + i * 40,
            fontSize: 42,
            color: "#cfd6da",
            letterSpacing: 6,
            opacity: 0.8 - i * 0.18,
          }}
        >
          雾
        </div>
      ))}
      <SceneTitle note="第三天四更，对面看不见人。">大雾锁江</SceneTitle>
    </StoryFrame>
  );
};
