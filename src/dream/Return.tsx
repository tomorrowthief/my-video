import { CinematicPage } from "./CinematicPage";
import { dreamTiming } from "./DreamArt";
import { PaintedCastleView, PaintedCottage } from "./painted/Town";
export const Return = () => {
  const d = dreamTiming.scenes[6].durationInFrames;
  const turn = dreamTiming.scenes[6].paragraphs[1].startFrame - 15;
  return (
    <CinematicPage index={6} dreamDust={false}>
      <PaintedCastleView
        mode="return"
        duration={turn + 24}
        label="第二个夜晚，金色的梦和鲸鱼、城堡一起飞回小镇每一扇窗前"
      />
      <PaintedCottage
        mode="return"
        start={turn}
        duration={d - turn}
        label="妖精带着一朵小花，轻轻敲了敲米米的窗"
      />
    </CinematicPage>
  );
};
