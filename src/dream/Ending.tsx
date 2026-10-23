import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Ending = () => (
  <CinematicPage index={7}>
    <FilmShot
      asset="storybook"
      alt="米米在被窝里翻开绘本，妖精带着小花站在书页上"
      duration={dreamTiming.scenes[7].durationInFrames}
      zoom={[1.045, 1]}
      focus="60% 53%"
    />
  </CinematicPage>
);
