import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Cocoon, LeafFall, Mantis, Mulberry } from "./SilkArt";

export const AgainScene = () => (
  <StoryFrame id="again">
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
      }}
    />
    <SceneTitle note="第二扑，第三扑。">一扑再扑</SceneTitle>
    <Mulberry sway={1.6} />
    <Cocoon x={1020} y={170} scale={0.85} sway={2} />
    <Mantis x={620} y={450} scale={1} lunge={0.4} arms="up" />
    <LeafFall from={10} />
    {/* 扑空的轨迹 */}
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M700 ${540 + i * 40} Q${850 + i * 60} ${380 + i * 30} ${
            1020 + i * 20
          } ${430 + i * 50}`}
          stroke="#a08b60"
          strokeWidth="6"
          strokeDasharray="16 18"
          fill="none"
          opacity={0.5 - i * 0.12}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <text
          key={`x${i}`}
          x={1040 + i * 60}
          y={460 + i * 50}
          fontSize="54"
          fill="#b0705c"
          fontWeight="800"
          opacity={0.6 - i * 0.12}
        >
          ✕
        </text>
      ))}
    </svg>
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 700,
        fontSize: 38,
        color: "#8a8c6b",
        letterSpacing: 2,
      }}
    >
      大刀砍在桑枝上，只落得几片叶子
    </div>
  </StoryFrame>
);
