import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { General } from "../history/HistoryArt";
import { Scholar } from "./ArrowsArt";

export const TaskScene = () => (
  <StoryFrame id="task">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,#e7e0c9 0%,#eee7d1 40%,#e2d7ba 100%)",
      }}
    />
    <SceneTitle note="周瑜出了一道难题。">十天太久</SceneTitle>
    <General x={1180} y={390} scale={1} />
    <Scholar x={390} y={390} scale={1} />
    <Bubble x={1090} y={140} width={600}>
      十天之内，造出十万支箭！
    </Bubble>
    <Bubble x={330} y={640} width={560}>
      何必十天，只要三天。
    </Bubble>
    <div
      style={{
        position: "absolute",
        left: 820,
        top: 760,
        fontSize: 34,
        color: "#8a7f5c",
        letterSpacing: 2,
      }}
    >
      军令如山，说出口就要做到
    </div>
  </StoryFrame>
);
