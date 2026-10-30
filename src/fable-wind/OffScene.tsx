import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { HillRoad, Sky, SunChar, Traveler, WarmBeams } from "./WindArt";

export const OffScene = () => (
  <StoryFrame id="off">
    <Sky warm={1} />
    <HillRoad warm={1} />
    <SceneTitle note="额头上冒了汗。">自己脱下外套</SceneTitle>
    <SunChar x={1400} y={130} scale={1.1} warm={1} />
    <WarmBeams warm={1} />
    <Traveler x={700} y={420} scale={1.2} grip={0} draped />
    <div
      style={{
        position: "absolute",
        left: 1060,
        top: 560,
        padding: "12px 26px",
        borderRadius: 20,
        background: "#fff8e9d8",
        color: "#a08b60",
        fontSize: 34,
      }}
    >
      暖和了，外套搭在肩上就好
    </div>
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 850,
        fontSize: 36,
        color: "#8a8c6b",
        letterSpacing: 2,
      }}
    >
      没人逼他，他自己解开了纽扣
    </div>
  </StoryFrame>
);
