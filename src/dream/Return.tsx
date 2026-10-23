import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Return = () => {
  const d = dreamTiming.scenes[6].durationInFrames;
  const turn = dreamTiming.scenes[6].paragraphs[1].startFrame - 15;
  return (
    <CinematicPage index={6}>
      <FilmShot
        asset="castle"
        alt="第二个夜晚，金色的梦回到城堡山脚下每一扇窗前"
        duration={turn}
        zoom={[1.025, 1]}
        focus="61% 52%"
      />
      <FilmShot
        asset="house"
        alt="妖精又回到米米的家，暖黄色的卧室窗户亮在夜色里"
        start={turn}
        duration={d - turn}
        zoom={[1, 1.055]}
        focus="73% 38%"
      />
    </CinematicPage>
  );
};
