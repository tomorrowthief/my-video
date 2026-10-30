import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate } from "remotion";
import { clamp, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Cocoon, Mantis, Mulberry, Silkworm } from "./SilkArt";

export const LungeScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 一扑：冲向茧，叶一晃，扑空
  const t = Math.min(1, frame / (fps * 1.2));
  const pounce = interpolate(t, [0, 0.45, 0.6, 1], [0, 0.9, 0.35, 0.15], clamp);
  const gust = Math.sin(frame / 9) * 3;
  return (
    <StoryFrame id="lunge">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
        }}
      />
      <SceneTitle note="猛地一扑！">就差一点点</SceneTitle>
      <Mulberry sway={2} />
      <Cocoon x={780} y={180} scale={0.9} sway={gust} />
      <Silkworm x={290} y={560} scale={0.9} />
      <Mantis
        x={620 + pounce * 260}
        y={420 + pounce * 120}
        scale={1}
        lunge={pounce}
        arms="raised"
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 1000 + i * 130,
            top: 300 + i * 60,
            width: 90 + i * 30,
            height: 10,
            borderRadius: 5,
            background: "#b7c69a",
            opacity: 0.6 - i * 0.15,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 640,
          fontSize: 46,
          fontWeight: 800,
          color: "#a08b60",
          letterSpacing: 4,
          opacity: pounce > 0.4 ? 1 : 0.25,
        }}
      >
        哎呀！差一点！
      </div>
    </StoryFrame>
  );
};
