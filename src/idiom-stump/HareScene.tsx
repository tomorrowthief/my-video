import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, Seedling, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Field, Hare, ImpactStars, Stump } from "./StumpArt";

export const HareScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 第 4.5 秒左右撞上树桩：前段狂奔，之后躺倒冒星星。
  const hitAt = Math.round(fps * 4.5);
  const running = frame < hitAt;
  const dash = interpolate(frame, [0, hitAt], [-120, 1030], clamp);
  const bounce = running
    ? Math.abs(Math.sin((frame / fps) * 6)) * 26
    : interpolate(frame, [hitAt, hitAt + fps * 0.6], [0, 10], clamp);
  const shake = interpolate(
    frame,
    [hitAt, hitAt + 6, hitAt + 14, hitAt + 22, hitAt + 30],
    [0, -3, 3, -1.5, 0],
    clamp,
  );
  return (
    <StoryFrame id="hare">
      <Field />
      <SceneTitle note="一只野兔飞快地跑了过来。">砰！撞上树桩</SceneTitle>
      <Stump x={1230} y={545} scale={1.12} shake={shake} />
      <Seedling x={230} y={520} scale={0.82} />
      <Seedling x={480} y={490} scale={0.74} />
      <Seedling x={700} y={516} scale={0.88} />
      <Hare
        x={running ? dash : 1085}
        y={620 - bounce}
        scale={running ? 0.78 : 0.9}
        mode={running ? "run" : "dizzy"}
        flip={!running}
      />
      <ImpactStars at={hitAt} x={1330} y={540} />
    </StoryFrame>
  );
};
