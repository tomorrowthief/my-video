import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { HillRoad, Sky, Traveler } from "./WindArt";

export const TravelerScene = () => (
  <StoryFrame id="traveler">
    <Sky />
    <HillRoad />
    <SceneTitle note="山路上走来一位旅人。">厚厚的外套</SceneTitle>
    <Traveler x={700} y={420} scale={1.1} grip={0.6} />
    <Bubble x={1060} y={170} width={640}>
      谁能让旅人脱下外套，谁的本领就大。
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
      北风先来，还是太阳先来？
    </div>
  </StoryFrame>
);
