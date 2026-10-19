import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bubble,
  Character,
  Garden,
  SceneTitle,
  Seedling,
  StoryFrame,
  clamp,
} from "./StoryArt";

export const GardenScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="garden">
      <Garden />
      <SceneTitle note="菜园里，冒出了一片嫩绿。">快快长大吧</SceneTitle>
      <Character
        who="farmer"
        x={1195}
        y={294}
        scale={1.03}
        rotation={Math.sin((frame / fps) * 0.9) * 0.7}
      />
      <Seedling
        x={260}
        y={522}
        scale={0.9}
        growth={interpolate(frame, [0, fps * 1.5], [0.85, 1], clamp)}
      />
      <Seedling x={545} y={485} scale={0.84} />
      <Seedling x={821} y={515} scale={1} />
      <Seedling x={460} y={660} scale={0.71} />
      <Seedling x={1064} y={660} scale={0.7} />
      <Bubble x={1180} y={150} width={510}>
        小苗呀，快长高！
      </Bubble>
    </StoryFrame>
  );
};
