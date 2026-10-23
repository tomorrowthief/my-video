import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Character, SceneTitle, Seedling, StoryFrame, clamp } from "../idioms/StoryArt";
import { Field, Stump, Weeds } from "./StumpArt";

export const EmptyScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const droop = interpolate(frame, [0, fps * 4], [0.6, 1], clamp);
  return (
    <StoryFrame id="empty">
      <Field withered />
      <SceneTitle note="庄稼枯了，杂草长了一地。">
        什么也没等到
      </SceneTitle>
      <Stump x={1230} y={545} scale={1.12} />
      <Character who="farmer" pose={2} x={780} y={450} scale={0.92} rotation={-2} />
      <Seedling x={230} y={530} scale={0.8} droop={droop} />
      <Seedling x={480} y={500} scale={0.72} droop={droop} />
      <Seedling x={700} y={535} scale={0.84} droop={droop} />
      <Weeds x={250} y={700} scale={1.1} />
      <Weeds x={560} y={760} scale={0.9} />
      <Weeds x={880} y={710} scale={1.2} />
      <Bubble x={760} y={150} width={620}>
        唉，连一只兔子也没有……
      </Bubble>
    </StoryFrame>
  );
};
