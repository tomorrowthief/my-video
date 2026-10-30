import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneTitle, StoryFrame } from "../idioms/StoryArt";
import { Cocoon, Mulberry } from "./SilkArt";

export const CocoonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <StoryFrame id="cocoon">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#eef2df 0%,#f4f0dd 46%,#e6e8cf 100%)",
        }}
      />
      <SceneTitle note="一层又一层，又厚又结实。">茧结成了</SceneTitle>
      <Mulberry sway={0.5} />
      <Cocoon x={880} y={220} scale={1.8} sway={0.8} />
      <div
        style={{
          position: "absolute",
          left: 1290,
          top: 300,
          fontSize: 52,
          color: "#a8b47b",
        }}
      >
        z
      </div>
      <div
        style={{
          position: "absolute",
          left: 1345,
          top: 250,
          fontSize: 64,
          color: "#a8b47b",
          opacity: 0.8,
        }}
      >
        z
      </div>
      <div
        style={{
          position: "absolute",
          left: 1410,
          top: 190,
          fontSize: 78,
          color: "#a8b47b",
          opacity: 0.6,
          translate: `0px ${Math.sin((frame / fps) * 1.6) * 8}px`,
        }}
      >
        z
      </div>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 660,
          fontSize: 38,
          color: "#7b8063",
          lineHeight: 1.7,
        }}
      >
        细细的丝，织成了暖暖的家。
        <br />
        它要睡一个长长的觉。
      </div>
    </StoryFrame>
  );
};
