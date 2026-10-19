import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CareIcon,
  Character,
  Garden,
  SceneTitle,
  Seedling,
  StoryFrame,
  clamp,
} from "./StoryArt";

export const LessonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="lesson">
      <Garden washed />
      <SceneTitle note="急着成功，用错办法，反而把事情弄糟。">
        这就叫“拔苗助长”
      </SceneTitle>
      <Character who="xiaohe" pose={2} x={96} y={415} scale={0.92} />
      <Seedling
        x={786}
        y={352}
        scale={1.48}
        growth={interpolate(frame, [fps * 1.5, fps * 10], [0.68, 1.22], clamp)}
      />
      <div
        style={{
          position: "absolute",
          left: 1255,
          top: 400,
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#647e79",
          }}
        >
          <CareIcon kind="water" size={86} />
          合适的水分
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#9c8751",
          }}
        >
          <CareIcon kind="sun" size={86} />
          充足的阳光
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 25,
            fontSize: 45,
            color: "#7b885b",
          }}
        >
          <CareIcon kind="time" size={86} />
          成长的时间
        </div>
      </div>
    </StoryFrame>
  );
};
