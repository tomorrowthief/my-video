import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { DustStreaks, Forest, Fox, Tiger } from "./FableArt";

export const ParadeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 狐狸昂首在前，老虎半信半疑地跟在后面，一路向右。
  const march = interpolate(frame, [0, fps * 10], [0, 120], clamp);
  return (
    <StoryFrame id="parade">
      <Forest />
      <SceneTitle note="跟在我后面，走一圈看看。">
        狐狸走在前面
      </SceneTitle>
      <Fox x={300 + march} y={560} scale={1.25} mode="strut" />
      <Tiger x={760 + march * 0.92} y={470} scale={1.0} />
      <DustStreaks x={980 + march} y={880} />
      <div
        style={{
          position: "absolute",
          left: 980,
          top: 360,
          width: 330,
          padding: "18px 30px",
          borderRadius: 24,
          background: "#fff8e9e8",
          border: "3px solid #e2cda8",
          fontSize: 37,
          color: "#8b8d67",
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        百兽见了我们
        <br />
        谁敢不逃？
      </div>
      <div
        style={{
          position: "absolute",
          left: 1470,
          top: 560,
          fontSize: 37,
          color: "#a08b60",
        }}
      >
        （半信半疑……）
      </div>
    </StoryFrame>
  );
};
