import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Fleeing, Forest, Tiger } from "./FableArt";

export const ForestScene = () => (
  <StoryFrame id="forest">
    <Forest />
    <SceneTitle note="百兽都住在这一片山林里。">大王巡山</SceneTitle>
    <Tiger x={1150} y={430} scale={1.15} />
    <Fleeing kind="deer" x={330} y={470} scale={0.8} flip />
    <Fleeing kind="rabbit" x={640} y={600} scale={0.72} flip />
    <Fleeing kind="boar" x={190} y={640} scale={0.8} flip />
  </StoryFrame>
);
