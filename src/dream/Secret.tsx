import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedForest } from "./painted/Forest";
export const Secret = () => {
  const s = dreamTiming.scenes[3];
  return (
    <CinematicPage index={3} dreamDust={false}>
      <PaintedForest
        mode="secret"
        duration={s.durationInFrames}
        turn={s.paragraphs[1].startFrame}
        label="月光森林里，古树枝头挂满发光的梦瓶，妖精的小床却只有黑暗"
      />
    </CinematicPage>
  );
};
