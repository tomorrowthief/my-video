import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedBedroom } from "./painted/Bedroom";
export const Ending = () => {
  const s = dreamTiming.scenes[7];
  return (
    <CinematicPage index={7} dreamDust={false}>
      <PaintedBedroom
        mode="ending"
        duration={s.durationInFrames}
        turn={s.paragraphs[1].startFrame}
        label="米米在被窝里翻开绘本，妖精带着小花站在书边，窗外的星星眨了眨眼"
      />
    </CinematicPage>
  );
};
