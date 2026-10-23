import { useCurrentFrame, useVideoConfig } from "remotion";
import { Character, StoryFrame } from "../idioms/StoryArt";
import { Hare, Stump } from "./StumpArt";

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
          fontSize: 118,
          fontWeight: 750,
          letterSpacing: 9,
          lineHeight: 1.35,
          color: "#566a42",
        }}
      >
        耕耘的人，
        <br />
        才靠得住。
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
        如果是你，
        <br />
        会怎么劝这位农夫呢？
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
        {["回田里干活", "再等等看", "换个树桩"].map((text, i) => (
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
      <Character
        who="xiaohe"
        pose={2}
        x={1080}
        y={247}
        scale={1.18}
        rotation={Math.sin((frame / fps) * 0.9) * 0.9}
      />
      <Stump x={1590} y={700} scale={0.66} />
      <Hare x={640} y={880} scale={0.5} mode="run" flip />
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 825,
          fontSize: 35,
          color: "#819566",
          letterSpacing: 4,
        }}
      >
        我们下个故事见
      </div>
    </StoryFrame>
  );
};
