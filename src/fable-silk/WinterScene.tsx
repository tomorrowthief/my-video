import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Cocoon, Grove, Mantis, Snowfall } from "./SilkArt";

export const WinterScene = () => (
  <StoryFrame id="winter">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,#dfe3e6 0%,#e9ebee 50%,#dde1e4 100%)",
      }}
    />
    <SceneTitle note="北风一吹，雪花落下来。">又冷又饿</SceneTitle>
    <Grove winter />
    <Cocoon x={1180} y={170} scale={1.1} sway={0.3} />
    <Mantis x={480} y={600} scale={1} arms="sprawled" shiver />
    <Snowfall />
    <div
      style={{
        position: "absolute",
        left: 520,
        top: 520,
        padding: "12px 26px",
        borderRadius: 20,
        background: "#f4f4f2d8",
        color: "#8c8f92",
        fontSize: 34,
      }}
    >
      好冷啊……
    </div>
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 860,
        fontSize: 36,
        color: "#8c8f92",
        letterSpacing: 2,
      }}
    >
      而茧挂在枝头，稳稳当当，一动也不动
    </div>
  </StoryFrame>
);
