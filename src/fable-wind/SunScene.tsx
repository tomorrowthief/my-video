import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { HillRoad, Sky, SunChar, Traveler, WarmBeams } from "./WindArt";

export const SunScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const warm = Math.min(1, frame / (fps * 2));
  return (
    <StoryFrame id="sun">
      <Sky warm={warm} />
      <HillRoad warm={warm} />
      <SceneTitle note="太阳不急不忙。">暖暖的阳光</SceneTitle>
      <SunChar x={1380} y={140} scale={1.15} warm={warm} />
      <WarmBeams warm={warm} />
      <Traveler x={760} y={420} scale={1.15} grip={0.5 * (1 - warm)} />
    </StoryFrame>
  );
};
