import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Follow = () => {
  const d = dreamTiming.scenes[2].durationInFrames;
  const turn = dreamTiming.scenes[2].paragraphs[1].startFrame - 15;
  return (
    <CinematicPage index={2}>
      <FilmShot
        asset="bedroom"
        alt="米米闭上眼睛，静静等着妖精靠近"
        duration={turn}
        zoom={[1.035, 1.075]}
        focus="65% 54%"
      />
      <FilmShot
        asset="awake"
        alt="米米醒来坐在被窝里，望向窗边的小妖精"
        start={turn}
        duration={d - turn}
        zoom={[1.02, 1.06]}
        focus="63% 50%"
      />
    </CinematicPage>
  );
};
