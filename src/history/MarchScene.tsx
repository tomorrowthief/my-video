import { useCurrentFrame } from "remotion";
import { Bubble, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { General, Heat, Soldiers, Wilds } from "./HistoryArt";

export const MarchScene = () => {
  const frame = useCurrentFrame();
  return (
    <StoryFrame id="march">
      <Wilds />
      <SceneTitle note="盛夏，大军急急忙忙赶路。">火辣辣的太阳</SceneTitle>
      <General x={1380} y={430} scale={1.05} />
      <Soldiers x={220} y={560} scale={0.95} count={4} />
      <Heat x={700} y={950} />
      <Heat x={1150} y={980} />
      <Bubble x={1280} y={150} width={520}>
        加快脚步，别停下！
      </Bubble>
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 330,
          width: 300,
          padding: "12px 24px",
          borderRadius: 20,
          background: "#fff8e9d8",
          color: "#a08b60",
          fontSize: 34,
          textAlign: "center",
          opacity: 0.9,
          rotate: `${Math.sin(frame / 18) * 1.5}deg`,
        }}
      >
        好热呀……
      </div>
    </StoryFrame>
  );
};
