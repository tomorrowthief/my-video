import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, clamp, StoryFrame } from "../idioms/StoryArt";
import { Field, Hare, Stump } from "./StumpArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="opening">
      <Field />
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
        守株待兔
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
        运气，不会天天都有
      </div>
      <Character
        who="xiaohe"
        x={132}
        y={443}
        scale={0.78}
        rotation={Math.sin((frame / fps) * 1.3) * 1.2}
      />
      <div
        style={{
          position: "absolute",
          left: 510,
          top: 558,
          color: "#8b906d",
          fontSize: 35,
          letterSpacing: 3,
        }}
      >
        你好呀，
        <br />
        <span style={{ fontSize: 52, color: "#667d4e", fontWeight: 700 }}>
          我是小禾
        </span>
      </div>
      <Stump x={1350} y={560} scale={1.06} />
      <Hare
        x={1040 + Math.sin((frame / fps) * 1.1) * 14}
        y={610}
        scale={0.62}
        mode="run"
      />
    </StoryFrame>
  );
};
