import { interpolate, useCurrentFrame } from "remotion";
import { clamp, StoryFrame } from "../idioms/StoryArt";
import { Fox, Forest } from "./FableArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="opening">
      <Forest />
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
          width: 340,
          height: 340,
          borderRadius: "50%",
          left: -160,
          bottom: -150,
          background: "#efd9a5",
          opacity: 0.45,
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
          color: "#50633e",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        狐假虎威
      </div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 365,
          color: "#929174",
          fontSize: 42,
          letterSpacing: 5,
        }}
      >
        威风，也可以是借来的
      </div>
      <Fox
        x={1150}
        y={520}
        scale={1.5}
        mode="scheme"
      />
      <div
        style={{
          position: "absolute",
          left: 1180,
          top: 470,
          fontSize: 40,
          color: "#86683f",
          letterSpacing: 3,
        }}
      >
        哼哼，看我的
      </div>
    </StoryFrame>
  );
};
