import { useCurrentFrame } from "remotion";
import { SceneTitle, StoryFrame, ThoughtDots } from "../idioms/StoryArt";
import { Mulberry, Silkworm } from "./SilkArt";

export const SpinScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="spin">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
        }}
      />
      <SceneTitle note="蚕安安静静地吐丝。">一天，又一天</SceneTitle>
      <Mulberry sway={0.6} />
      <Silkworm x={760} y={560} scale={1.6} spinning flip />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 1480 + i * 64,
            top: 180 + Math.sin((frame + i * 20) / 26) * 12,
            fontSize: 40 + i * 8,
            color: "#a8b47b",
            opacity: 0.8 - i * 0.2,
          }}
        >
          一
        </div>
      ))}
      <ThoughtDots from={12} x={1240} y={700} />
      <div
        style={{
          position: "absolute",
          left: 1210,
          top: 760,
          fontSize: 34,
          color: "#8a8c6b",
          letterSpacing: 2,
        }}
      >
        不着急，织一点是一点
      </div>
    </StoryFrame>
  );
};
