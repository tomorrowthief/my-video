import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Mantis, Mulberry, Silkworm } from "./SilkArt";

export const MockScene = () => (
  <StoryFrame id="mock">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
      }}
    />
    <SceneTitle note="螳螂举起两把大刀。">这么细的丝！</SceneTitle>
    <Mulberry sway={0.4} />
    <Silkworm x={330} y={430} scale={1.2} spinning />
    <Mantis x={1250} y={520} scale={1.1} arms="raised" />
    <Bubble x={1030} y={170} width={720}>
      这么细的丝，要织到什么时候呀！
    </Bubble>
    <div
      style={{
        position: "absolute",
        left: 350,
        top: 640,
        fontSize: 34,
        color: "#8a8c6b",
        letterSpacing: 2,
      }}
    >
      蚕没有抬头，继续吐自己的丝
    </div>
  </StoryFrame>
);
