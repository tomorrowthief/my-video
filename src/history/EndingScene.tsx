import { useCurrentFrame } from "remotion";
import { StoryFrame } from "../idioms/StoryArt";
import { General, Plum } from "./HistoryArt";

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
        想象，
        <br />
        也有力量。
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
        口渴的时候，
        <br />
        你会想点什么帮自己撑住呢？
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
        {["想想酸梅子", "想想冰西瓜", "坚持找水源"].map((text, i) => (
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
      <General x={1230} y={380} scale={0.95} />
      <Plum x={1450} y={120} scale={0.6} />
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
        取材《世说新语》 · 下集再见
      </div>
    </StoryFrame>
  );
};
