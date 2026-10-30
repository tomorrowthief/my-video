import { useCurrentFrame } from "remotion";
import { StoryFrame } from "../idioms/StoryArt";
import { NorthWind, SunChar } from "./WindArt";

export const EndingScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="ending">
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          right: -130,
          top: 80,
          borderRadius: "50%",
          background: "#e9edd7",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 200,
          fontSize: 100,
          fontWeight: 750,
          letterSpacing: 9,
          lineHeight: 1.35,
          color: "#566a42",
        }}
      >
        温和，
        <br />
        也是力量。
      </div>
      <div
        style={{
          position: "absolute",
          left: 141,
          top: 560,
          fontSize: 41,
          color: "#8a8c6b",
          lineHeight: 1.7,
        }}
      >
        让人解开的，
        <br />
        往往不是使劲，而是温暖。
      </div>
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 750,
          display: "flex",
          gap: 30,
        }}
      >
        {["吹得越猛", "抓得越紧", "暖暖地照"].map((text, i) => (
          <div
            key={text}
            style={{
              padding: "14px 26px",
              borderRadius: 22,
              background: i === 2 ? "#e7efdb" : "#f4efdd",
              border: `2px solid ${i === 2 ? "#a9bd8b" : "#ddd3ac"}`,
              fontSize: 31,
              color: i === 2 ? "#5f7a48" : "#8f8b68",
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <NorthWind x={1080} y={560} scale={0.55} blow={0.15} />
      <SunChar x={1420} y={380} scale={0.62} warm={1} />
      <div
        style={{
          position: "absolute",
          left: 1190,
          top: 905,
          fontSize: 35,
          color: "#819566",
          letterSpacing: 4,
          rotate: `${Math.sin(frame / 18) * 0.8}deg`,
        }}
      >
        伊索寓言 · 下集再见
      </div>
    </StoryFrame>
  );
};
