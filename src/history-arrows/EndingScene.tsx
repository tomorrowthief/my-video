import { useCurrentFrame } from "remotion";
import { StoryFrame } from "../idioms/StoryArt";
import { Scholar, StrawBoat } from "./ArrowsArt";

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
          background: "#e9e6d4",
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
          color: "#41545f",
        }}
      >
        借势，
        <br />
        也是智慧。
      </div>
      <div
        style={{
          position: "absolute",
          left: 141,
          top: 560,
          fontSize: 41,
          color: "#7b8063",
          lineHeight: 1.7,
        }}
      >
        硬赶不出来的东西，
        <br />
        可以换个办法去借。
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
        {["看天气", "备草船", "等大雾"].map((text, i) => (
          <div
            key={text}
            style={{
              padding: "14px 26px",
              borderRadius: 22,
              background: i === 2 ? "#dfe7db" : "#f4efdd",
              border: `2px solid ${i === 2 ? "#9db4ae" : "#ddd3ac"}`,
              fontSize: 31,
              color: i === 2 ? "#4f6a5c" : "#8f8b68",
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <Scholar x={1230} y={380} scale={0.95} waving />
      <StrawBoat x={880} y={700} scale={0.62} arrows={7} />
      <div
        style={{
          position: "absolute",
          left: 1190,
          top: 905,
          fontSize: 35,
          color: "#71807a",
          letterSpacing: 4,
          rotate: `${Math.sin(frame / 18) * 0.8}deg`,
        }}
      >
        改编自《三国演义》 · 下集再见
      </div>
    </StoryFrame>
  );
};
