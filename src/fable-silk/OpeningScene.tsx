import { interpolate, useCurrentFrame } from "remotion";
import { clamp, StoryFrame } from "../idioms/StoryArt";
import { Mantis, Mulberry, Silkworm } from "./SilkArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="opening">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          right: -180,
          top: -180,
          background: "#e6ecd7",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 193,
          fontSize: 133,
          fontWeight: 800,
          letterSpacing: 8,
          color: "#5f7a48",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        蚕与螳螂
      </div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 365,
          color: "#7b8063",
          fontSize: 42,
          letterSpacing: 5,
        }}
      >
        一个慢慢织，一个急着抢
      </div>
      <Mulberry sway={1} />
      <Silkworm x={1080} y={300} scale={0.9} spinning />
      <Mantis x={1240} y={620} scale={0.75} arms="up" />
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 402,
          fontSize: 34,
          color: "#6b7a52",
          letterSpacing: 3,
        }}
      >
        山林寓言 · 第二集
      </div>
    </StoryFrame>
  );
};
