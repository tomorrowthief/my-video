import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedBedroom } from "./painted/Bedroom";
export const Follow = () => {
  const s = dreamTiming.scenes[2];
  return (
    <CinematicPage index={2} dreamDust={false}>
      <PaintedBedroom
        mode="follow"
        duration={s.durationInFrames}
        turn={s.paragraphs[1].startFrame - 15}
        label="米米眯着眼偷看，等妖精靠近时坐起来说：我看见你啦"
      />
    </CinematicPage>
  );
};
