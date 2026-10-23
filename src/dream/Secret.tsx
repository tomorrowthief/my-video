import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Secret = () => (
  <CinematicPage index={3}>
    <FilmShot
      asset="forest"
      alt="米米和妖精坐在古树下，满树悬挂着金色梦瓶"
      duration={dreamTiming.scenes[3].durationInFrames}
      zoom={[1, 1.07]}
      focus="60% 55%"
    />
  </CinematicPage>
);
