import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedBoat } from "./painted/Boat";
import { PaintedHollow } from "./painted/Hollow";
export const First = () => {
  const d = dreamTiming.scenes[5].durationInFrames;
  const turn = dreamTiming.scenes[5].paragraphs[1].startFrame - 15;
  return (
    <CinematicPage index={5} dreamDust={false}>
      <PaintedHollow
        duration={turn + 24}
        label="小妖精在树洞的苔藓小床上安睡，梦瓶里第一次亮起它自己的梦"
      />
      <PaintedBoat
        start={turn}
        duration={d - turn}
        label="妖精梦见自己和米米一起乘着叶子船驶过星星海"
      />
    </CinematicPage>
  );
};
