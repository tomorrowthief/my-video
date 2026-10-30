import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Fog, Scholar, StrawBoat, WarDrum } from "./ArrowsArt";

export const DrumsScene = () => (
  <StoryFrame id="drums">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg,#65737e 0%,#939ea8 62%,#76878f 100%)",
      }}
    />
    <Fog density={0.45} />
    <SceneTitle note="鼓声隆隆，喊声震天。">擂鼓！呐喊！</SceneTitle>
    <StrawBoat x={330} y={560} scale={1.1} covered />
    <WarDrum x={1360} y={620} scale={1.05} />
    <Scholar x={1330} y={330} scale={0.95} waving />
    <Bubble x={1130} y={160} width={560}>
      擂鼓！呐喊！
    </Bubble>
    {["咚", "咚", "隆"].map((text, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 700 + i * 130,
          top: 300 + i * 90,
          fontSize: 54 + i * 10,
          fontWeight: 800,
          color: "#e9eef2",
          opacity: 0.75 - i * 0.16,
          letterSpacing: 4,
        }}
      >
        {text}
      </div>
    ))}
  </StoryFrame>
);
