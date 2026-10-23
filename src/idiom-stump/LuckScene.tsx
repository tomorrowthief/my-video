import { useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Character, SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Field, Hare, Stump } from "./StumpArt";

export const LuckScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lift = Math.sin((frame / fps) * 1.6) * 8;
  return (
    <StoryFrame id="luck">
      <Field dusk />
      <SceneTitle note="不费力气，就捡到一只大肥兔。">
        白捡的兔子
      </SceneTitle>
      <Stump x={1520} y={640} scale={0.86} />
      <Character
        who="farmer"
        pose={2}
        x={1080}
        y={330 + lift}
        scale={1.02}
        rotation={Math.sin((frame / fps) * 1.6) * 1}
      />
      <Hare x={1160} y={560 + lift} scale={0.66} mode="dizzy" />
      <Bubble x={1100} y={150} width={560}>
        今晚，炖兔肉喽！
      </Bubble>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 700 + i * 90,
            top: 300 + Math.sin((frame / fps) * 2 + i) * 18,
            fontSize: 44,
            color: "#d99a3f",
            opacity: 0.75,
          }}
        >
          ✦
        </div>
      ))}
    </StoryFrame>
  );
};
