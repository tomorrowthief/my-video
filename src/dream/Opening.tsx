import { CinematicPage, FilmShot } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
export const Opening = () => {
  const d = dreamTiming.scenes[0].durationInFrames;
  return (
    <CinematicPage index={0} title dreamDust={false}>
      <FilmShot
        asset="castle"
        alt="月光下的城堡全景、湖面与山脚小镇"
        duration={d * 0.57}
        zoom={[1, 1.018]}
        focus="65% 46%"
      />
      <FilmShot
        asset="house"
        alt="小女孩住的石头房子，妖精飞向亮着暖灯的阁楼"
        start={Math.round(d * 0.53)}
        duration={d * 0.47}
        zoom={[1, 1.06]}
        focus="72% 36%"
      />
    </CinematicPage>
  );
};
