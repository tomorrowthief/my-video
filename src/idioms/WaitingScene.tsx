import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Bubble,
  Character,
  Garden,
  SceneTitle,
  Seedling,
  StoryFrame,
} from "./StoryArt";

export const WaitingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="waiting">
      <Garden />
      <SceneTitle note="才过了一天，农夫就等不及了。">
        怎么还不长呀？
      </SceneTitle>
      <div
        style={{
          position: "absolute",
          top: 365,
          left: 150,
          width: 315,
          padding: "15px 28px",
          borderRadius: 22,
          background: "#fff8e9e8",
          color: "#8b8d67",
          fontSize: 37,
          textAlign: "center",
        }}
      >
        昨天 → 今天
      </div>
      <Character
        who="farmer"
        x={1160 + Math.sin((frame / fps) * 2) * 16}
        y={301}
        scale={1.03}
        rotation={Math.sin((frame / fps) * 2) * 2}
      />
      <Seedling x={310} y={540} scale={1} />
      <Seedling x={615} y={490} scale={0.9} />
      <Seedling x={860} y={570} scale={0.96} />
      <Bubble x={1120} y={150} width={540}>
        我来“帮帮”你们！
      </Bubble>
    </StoryFrame>
  );
};
