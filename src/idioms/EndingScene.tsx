import { useCurrentFrame, useVideoConfig } from "remotion";
import { CareIcon, Character, StoryFrame } from "./StoryArt";

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
        一点一点，
        <br />
        慢慢来。
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
        你的豆芽还没长高，
        <br />
        你准备怎么照顾它？
      </div>
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 747,
          display: "flex",
          gap: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            fontSize: 32,
            color: "#7c907d",
          }}
        >
          <CareIcon kind="water" size={53} />
          浇水
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            fontSize: 32,
            color: "#9c905f",
          }}
        >
          <CareIcon kind="sun" size={53} />
          晒太阳
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            fontSize: 32,
            color: "#7c8b62",
          }}
        >
          <CareIcon kind="time" size={53} />
          等一等
        </div>
      </div>
      <Character
        who="xiaohe"
        pose={2}
        x={1080}
        y={247}
        scale={1.18}
        rotation={Math.sin((frame / fps) * 0.9) * 0.9}
      />
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
