import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { General, PlumGrove, Soldiers, Wilds } from "./HistoryArt";

export const PlumScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 马鞭一指，远处的梅林渐渐显形。
  const grove = interpolate(frame, [fps * 0.6, fps * 2.4], [0, 1], clamp);
  return (
    <StoryFrame id="plum">
      <Wilds />
      <SceneTitle note="他抽出马鞭，朝前面一指。">前面有梅林！</SceneTitle>
      <PlumGrove x={1020} y={380} scale={0.9} appear={grove} />
      <General x={520} y={440} scale={1.2} pointing />
      <Bubble x={330} y={150} width={760}>
        前面有一大片梅林！梅子又酸又甜，好吃极了！
      </Bubble>
      <Soldiers x={120} y={780} scale={0.6} count={3} />
    </StoryFrame>
  );
};
