import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedCastleView, PaintedCottage } from "./painted/Town";
export const Opening = () => {
  const d = dreamTiming.scenes[0].durationInFrames;
  const turn = Math.round(d * 0.53);
  return (
    <CinematicPage index={0} title dreamDust={false}>
      <PaintedCastleView
        mode="opening"
        duration={turn + 24}
        label="月光下的城堡、湖面与山脚小镇，岸边一扇小窗还亮着"
      />
      <PaintedCottage
        mode="opening"
        start={turn}
        duration={d - turn}
        label="提着玻璃瓶的小妖精，悄悄飞向米米家亮着灯的阁楼窗"
      />
    </CinematicPage>
  );
};
