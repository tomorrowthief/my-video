import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Scholar, StrawBoat } from "./ArrowsArt";

export const PrepScene = () => (
  <StoryFrame id="prep">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,#d3ddda 0%,#dfe4d9 34%,#c3cdc4 72%,#9db4ae 100%)",
      }}
    />
    <SceneTitle note="二十条船，绑满稻草人。">青布遮好</SceneTitle>
    <StrawBoat x={300} y={560} scale={1} covered={false} />
    <StrawBoat x={1020} y={620} scale={0.8} covered />
    <Scholar x={1400} y={380} scale={0.9} waving />
    <Bubble x={330} y={300} width={560}>
      不造箭，扎草人做什么？
    </Bubble>
    <div
      style={{
        position: "absolute",
        left: 1180,
        top: 880,
        fontSize: 36,
        color: "#5f6d74",
        letterSpacing: 3,
      }}
    >
      别急，三天后见分晓
    </div>
  </StoryFrame>
);
