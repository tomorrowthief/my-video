import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedBedroom } from "./painted/Bedroom";
export const Collect = () => {
  const s = dreamTiming.scenes[1];
  return (
    <CinematicPage index={1} dreamDust={false}>
      <PaintedBedroom
        mode="collect"
        duration={s.durationInFrames}
        turn={s.paragraphs[1].startFrame}
        label="米米在阁楼卧室里安睡，妖精把她的梦装进玻璃瓶"
      />
    </CinematicPage>
  );
};
