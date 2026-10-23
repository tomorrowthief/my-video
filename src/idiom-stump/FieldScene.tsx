import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bubble,
  Character,
  Seedling,
  SceneTitle,
  StoryFrame,
} from "../idioms/StoryArt";
import { Field, Stump } from "./StumpArt";

export const FieldScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="field">
      <Field />
      <SceneTitle note="锄地、浇水、除杂草，样样认真。">
        一分耕耘
      </SceneTitle>
      <Stump x={1560} y={620} scale={0.9} />
      <Character
        who="farmer"
        x={1150}
        y={294}
        scale={1.03}
        rotation={Math.sin((frame / fps) * 0.9) * 0.7}
      />
      <Seedling x={230} y={520} scale={0.9} />
      <Seedling x={500} y={488} scale={0.82} />
      <Seedling x={760} y={516} scale={0.98} />
      <Seedling x={420} y={660} scale={0.7} />
      <Seedling x={980} y={665} scale={0.7} />
      <Bubble x={1140} y={150} width={520}>
        庄稼活儿，一天也不能偷懒。
      </Bubble>
    </StoryFrame>
  );
};
