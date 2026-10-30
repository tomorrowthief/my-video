import { useCurrentFrame } from "remotion";
import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { General, Soldiers } from "../history/HistoryArt";
import { ArrowRain, Fog, Stockade, StrawBoat } from "./ArrowsArt";

export const ArrowsScene = () => {
  const frame = useCurrentFrame();
  const caught = Math.min(7, Math.floor(frame / 12));
  return (
    <StoryFrame id="arrows">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg,#6b7883 0%,#98a2ab 62%,#79898f 100%)",
        }}
      />
      <Fog density={0.3} />
      <SceneTitle note="曹操不许出战，只叫放箭。">万箭齐发</SceneTitle>
      <Stockade x={1440} y={480} scale={0.8} />
      <General x={1310} y={330} scale={0.85} pointing flip />
      <Soldiers x={1450} y={480} scale={0.72} count={3} flip />
      <Bubble x={1150} y={150} width={620}>
        雾里恐有埋伏，放箭！
      </Bubble>
      <StrawBoat x={240} y={590} scale={1} arrows={caught} />
      <ArrowRain count={10} angle={-24} />
    </StoryFrame>
  );
};
