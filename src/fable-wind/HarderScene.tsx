import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Gusts, HillRoad, LeavesFly, NorthWind, Sky, Traveler } from "./WindArt";

export const HarderScene = () => (
  <StoryFrame id="harder">
    <Sky />
    <HillRoad />
    <SceneTitle note="北风用尽全身力气。">吹得脸都红了</SceneTitle>
    <NorthWind x={110} y={120} scale={1.4} blow={1} />
    <Traveler x={900} y={430} scale={1.15} grip={1} collar={1} />
    <Gusts strength={1} />
    <LeavesFly strength={1} />
    <div
      style={{
        position: "absolute",
        left: 940,
        top: 300,
        fontSize: 40,
        color: "#8c9099",
        letterSpacing: 2,
        rotate: "-4deg",
      }}
    >
      竖起衣领，缩着脖子
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
      用尽力气，也没能吹开外套
    </div>
  </StoryFrame>
);
