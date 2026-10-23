import { useCurrentFrame, useVideoConfig } from "remotion";
import { StoryFrame } from "../idioms/StoryArt";
import { Fox, Tiger } from "./FableArt";

export const EndingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
          fontSize: 108,
          fontWeight: 750,
          letterSpacing: 9,
          lineHeight: 1.35,
          color: "#566a42",
        }}
      >
        真威风，
        <br />
        靠本事。
      </div>
      <div
        style={{
          position: "absolute",
          left: 141,
          top: 567,
          fontSize: 43,
          color: "#8a8c6b",
          lineHeight: 1.7,
        }}
      >
        遇到“威风”的人，
        <br />
        你会怎么分辨他呢？
      </div>
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 762,
          display: "flex",
          gap: 30,
        }}
      >
        {["看他自己的本领", "看谁的架子大", "先躲远一点"].map((text, i) => (
          <div
            key={text}
            style={{
              padding: "14px 26px",
              borderRadius: 22,
              background: i === 0 ? "#e7efdb" : "#f4efdd",
              border: `2px solid ${i === 0 ? "#a9bd8b" : "#ddd3ac"}`,
              fontSize: 31,
              color: i === 0 ? "#5f7a48" : "#8f8b68",
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <Fox
        x={1090}
        y={450}
        scale={1.2}
        mode="strut"
      />
      <Tiger
        x={1140}
        y={680}
        scale={0.55}
        mode="stand"
      />
      <div
        style={{
          position: "absolute",
          left: 1120,
          top: 905,
          fontSize: 35,
          color: "#819566",
          letterSpacing: 4,
          rotate: `${Math.sin((frame / fps) * 1.1) * 0.8}deg`,
        }}
      >
        我们下个故事见
      </div>
    </StoryFrame>
  );
};
