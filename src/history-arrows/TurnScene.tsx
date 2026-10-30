import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate } from "remotion";
import { clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Fog, RiverNight, StrawBoat } from "./ArrowsArt";

export const TurnScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const home = (frame / fps) * 60;
  const turning = interpolate(frame, [0, 30], [1, 0], clamp);
  return (
    <StoryFrame id="turn">
      <RiverNight pale />
      <SceneTitle note="调过头来，另一面接着受箭。">满载而归</SceneTitle>
      <StrawBoat x={340 + home} y={600} scale={1} arrows={7} />
      <StrawBoat x={-260 + home} y={540} scale={0.8} arrows={6} />
      <div
        style={{
          position: "absolute",
          left: 1210,
          top: 330,
          fontSize: 40,
          color: "#5f6d74",
          letterSpacing: 3,
          opacity: 1 - turning,
        }}
      >
        雾快散了，收兵回营
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 620 + i * 90,
            top: 240 + (i % 3) * 46,
            width: 10,
            height: 64,
            borderRadius: 4,
            background: "#4c3b28",
            rotate: "24deg",
            opacity: 0.28,
          }}
        />
      ))}
      <Fog density={0.12} />
    </StoryFrame>
  );
};
