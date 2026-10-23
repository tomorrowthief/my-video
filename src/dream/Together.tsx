import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Together = () => {
  const d = dreamTiming.scenes[4].durationInFrames;
  const turn = dreamTiming.scenes[4].paragraphs[1].startFrame - 20;
  return (
    <CinematicPage index={4}>
      <FilmShot
        asset="forest"
        alt="米米陪着妖精，一起编一个新故事"
        duration={turn}
        zoom={[1.035, 1.075]}
        focus="60% 55%"
      />
      <FilmShot
        asset="boat"
        alt="叶子船载着米米和妖精，驶过星海，远处是完整的梦中城堡"
        start={turn}
        duration={d - turn}
        zoom={[1.025, 1]}
        focus="60% 52%"
      />
    </CinematicPage>
  );
};
