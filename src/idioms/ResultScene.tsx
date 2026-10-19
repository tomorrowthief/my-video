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

export const ResultScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const droop = interpolate(frame, [fps * 0.4, fps * 3], [0, 1], clamp);
  return (
    <StoryFrame id="result">
      <Garden />
      <SceneTitle note="第二天，小苗低下了头。">根，离开了泥土</SceneTitle>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 390,
          width: 560,
          height: 425,
          borderRadius: 48,
          background: "#fff8e9ed",
          border: "3px solid #e2cda8",
        }}
      >
        <Seedling x={129} y={-3} scale={1.35} lift={55} droop={droop} roots />
        <div
          style={{
            position: "absolute",
            left: 340,
            top: 290,
            fontSize: 33,
            color: "#a07951",
            lineHeight: 1.45,
          }}
        >
          根被拔松
          <br />
          吸水受影响
        </div>
      </div>
      <Seedling x={842} y={500} scale={1.05} lift={50} droop={droop} />
      <Seedling x={1025} y={645} scale={0.7} lift={50} droop={droop} />
      <Character who="farmer" pose={2} x={1230} y={328} scale={0.98} />
      <Bubble x={1220} y={150} width={550}>
        原来，我太着急了。
      </Bubble>
    </StoryFrame>
  );
};
