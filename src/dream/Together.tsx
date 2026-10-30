import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedBoat } from "./painted/Boat";
import { PaintedForest } from "./painted/Forest";
export const Together = () => {
  const d = dreamTiming.scenes[4].durationInFrames;
  const turn = dreamTiming.scenes[4].paragraphs[1].startFrame - 20;
  return (
    <CinematicPage index={4} dreamDust={false}>
      <PaintedForest
        mode="together"
        duration={turn + 24}
        label="米米坐到妖精身边，两人一起编一个新故事"
      />
      <PaintedBoat start={turn} duration={d - turn} />
    </CinematicPage>
  );
};
