import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Collect = () => (
  <CinematicPage index={1}>
    <FilmShot
      asset="bedroom"
      alt="真实儿童模样的米米安睡在阁楼卧室，妖精提着梦瓶来到枕边"
      duration={dreamTiming.scenes[1].durationInFrames}
      zoom={[1, 1.065]}
      focus="63% 54%"
    />
  </CinematicPage>
);
