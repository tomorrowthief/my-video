import { interpolate, useCurrentFrame } from "remotion";
import { clamp, StoryFrame } from "../idioms/StoryArt";
import { RiverNight, Scholar, StrawBoat } from "./ArrowsArt";

export const OpeningScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="opening">
      <RiverNight pale />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          right: -180,
          top: -180,
          background: "#e9e6d4",
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
          color: "#41545f",
          opacity: interpolate(frame, [0, 32], [0.85, 1], clamp),
          translate: `0px ${interpolate(frame, [10, 32], [20, 0], clamp)}px`,
        }}
      >
        草船借箭
      </div>
      <div
        style={{
          position: "absolute",
          left: 122,
          top: 365,
          color: "#75838b",
          fontSize: 42,
          letterSpacing: 5,
        }}
      >
        草做的船，怎么借来十万支箭？
      </div>
      <Scholar x={1330} y={430} scale={1.1} />
      <StrawBoat x={960} y={640} scale={0.72} arrows={7} />
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 402,
          fontSize: 34,
          color: "#5f6d74",
          letterSpacing: 3,
        }}
      >
        三国小故事 · 改编自《三国演义》
      </div>
    </StoryFrame>
  );
};
