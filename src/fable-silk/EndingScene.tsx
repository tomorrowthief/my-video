import { useCurrentFrame } from "remotion";
import { StoryFrame } from "../idioms/StoryArt";
import { Cocoon, Mantis } from "./SilkArt";

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
        笨功夫，
        <br />
        最结实。
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
        想要现成的果实，
        <br />
        不如自己一点点去织。
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
        {["一天一根丝", "不嘲笑别人", "慢慢织"].map((text, i) => (
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
      <Cocoon x={1290} y={330} scale={1.15} sway={0.6} />
      <Mantis x={1560} y={620} scale={0.6} arms="up" />
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
        山林寓言 · 下集再见
      </div>
    </StoryFrame>
  );
};
