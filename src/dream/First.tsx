import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const First = () => {
  const d = dreamTiming.scenes[5].durationInFrames;
  const turn = dreamTiming.scenes[5].paragraphs[1].startFrame - 15;
  return (
    <CinematicPage index={5}>
      <FilmShot
        asset="fairy-sleep"
        alt="小妖精在树洞的叶子床上安睡，梦瓶里第一次亮起自己的梦"
        duration={d}
        zoom={[1, 1.06]}
        focus="52% 57%"
      />
      <FilmShot
        asset="boat"
        alt="妖精梦见自己和米米一起乘船驶过星星海"
        start={turn}
        duration={d - turn}
        zoom={[1, 1.045]}
        focus="61% 54%"
      />
    </CinematicPage>
  );
};
