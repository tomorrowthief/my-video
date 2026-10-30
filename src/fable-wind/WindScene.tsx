import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Gusts, HillRoad, LeavesFly, NorthWind, Sky, Traveler } from "./WindArt";

export const WindScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blow = 0.6 + Math.sin((frame / fps) * 2.4) * 0.25;
  return (
    <StoryFrame id="wind">
      <Sky />
      <HillRoad />
      <SceneTitle note="北风鼓起腮帮子。">呼——</SceneTitle>
      <NorthWind x={240} y={180} scale={1.25} blow={blow} />
      <Traveler x={1180} y={420} scale={1.05} grip={0.8} />
      <Gusts strength={blow} />
      <LeavesFly strength={blow} />
    </StoryFrame>
  );
};
