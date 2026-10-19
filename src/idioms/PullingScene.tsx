import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bubble,
  Character,
  Garden,
  SceneTitle,
  Seedling,
  StoryFrame,
  clamp,
} from "./StoryArt";

export const PullingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lift = interpolate(frame, [fps * 1.6, fps * 4.1], [0, 56], {
    ...clamp,
    easing: Easing.bezier(0.42, 0, 0.25, 1),
  });
  return (
    <StoryFrame id="pulling">
      <Garden />
      <SceneTitle note="他弯下腰，想到了一个“好办法”。">
        高了一点点？
      </SceneTitle>
      <Character
        who="farmer"
        pose={1}
        x={900}
        y={300 - lift * 0.25}
        scale={1.08}
        rotation={-lift * 0.035}
      />
      <Seedling x={1150} y={530} scale={1.1} lift={lift} />
      <Seedling
        x={630}
        y={545}
        scale={1}
        lift={interpolate(frame, [fps * 4.7, fps * 6.5], [0, 56], clamp)}
      />
      <Seedling
        x={342}
        y={592}
        scale={0.9}
        lift={interpolate(frame, [fps * 7, fps * 8.5], [0, 56], clamp)}
      />
      <Bubble x={1350} y={330} width={350}>
        高了！高了！
      </Bubble>
      <div
        style={{
          position: "absolute",
          left: 1545,
          top: 560,
          color: "#a17449",
          fontSize: 36,
          opacity: interpolate(frame, [fps * 2, fps * 4], [0, 1], clamp),
        }}
      >
        ↑ 被拔高了
      </div>
    </StoryFrame>
  );
};
