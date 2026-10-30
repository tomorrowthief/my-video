import { useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Gusts, HillRoad, NorthWind, Sky, Traveler } from "./WindArt";

export const TightScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grip = 0.7 + Math.sin((frame / fps) * 2.2) * 0.2;
  return (
    <StoryFrame id="tight">
      <Sky />
      <HillRoad />
      <SceneTitle note="风越猛，手抓得越牢。">裹得更紧</SceneTitle>
      <NorthWind x={130} y={140} scale={1.15} blow={0.9} />
      <Traveler x={860} y={420} scale={1.2} grip={grip} />
      <Gusts strength={0.9} />
      <Bubble x={980} y={170} width={560}>
        呼——呼——
      </Bubble>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 830,
          fontSize: 36,
          color: "#8a8c6b",
          letterSpacing: 2,
        }}
      >
        旅人眯起眼睛，抱紧了外套
      </div>
    </StoryFrame>
  );
};
