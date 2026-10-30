import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StudioCompositionProps, StudioScene } from "./types";

function Scene({
  scene,
  project,
  assetSources,
}: StudioCompositionProps & { scene: StudioScene }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const accent = scene.accentColor;
  const dark =
    parseInt(scene.backgroundColor.slice(1, 3), 16) * 0.299 +
      parseInt(scene.backgroundColor.slice(3, 5), 16) * 0.587 +
      parseInt(scene.backgroundColor.slice(5, 7), 16) * 0.114 <
    120;
  const ink = dark ? "#faf9f3" : "#232721";
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lift = interpolate(frame, [0, 22], [30, 0], {
    extrapolateRight: "clamp",
  });
  const asset = project.assets.find((a) => a.id === scene.assetId);
  const source = asset ? assetSources[asset.id] : undefined;
  const full = scene.layout === "full-media" && source;
  const split = scene.layout === "split" && source;
  const sentences = (
    scene.narration.match(/[^。！？!?；;]+[。！？!?；;]?/g) ?? []
  ).flatMap((sentence) => {
    const characters = Array.from(sentence);
    const chunks: string[] = [];
    while (characters.length)
      chunks.push(characters.splice(0, portrait ? 24 : 40).join(""));
    return chunks;
  });
  const caption =
    sentences[
      Math.min(
        sentences.length - 1,
        Math.floor((frame / scene.durationInFrames) * sentences.length),
      )
    ] ?? "";
  const media =
    source &&
    (asset?.kind === "image" ? (
      <Img
        src={source}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : asset?.kind === "video" ? (
      <OffthreadVideo
        src={source}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : null);
  return (
    <AbsoluteFill
      style={{
        background: scene.backgroundColor,
        fontFamily:
          '"Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif',
        color: ink,
        overflow: "hidden",
      }}
    >
      {full && (
        <AbsoluteFill>
          {media}
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,.15))",
            }}
          />
        </AbsoluteFill>
      )}
      {!full && (
        <>
          <div
            style={{
              position: "absolute",
              width: portrait ? 900 : 760,
              height: portrait ? 900 : 760,
              borderRadius: "50%",
              border: `2px solid ${accent}`,
              opacity: 0.15,
              right: portrait ? -300 : -150,
              top: portrait ? 220 : -150,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: portrait ? 650 : 510,
              height: portrait ? 650 : 510,
              borderRadius: "50%",
              background: accent,
              opacity: 0.08,
              right: portrait ? -150 : -25,
              top: portrait ? 360 : -25,
            }}
          />
        </>
      )}
      <AbsoluteFill
        style={{
          padding: portrait ? "130px 90px" : "100px 140px",
          opacity,
          transform: `translateY(${lift}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: full ? "white" : ink,
        }}
      >
        <div
          style={{ width: 64, height: 7, background: accent, marginBottom: 48 }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap: 64,
            alignItems: split ? "center" : "stretch",
          }}
        >
          <div
            style={{ flex: 1, maxWidth: split && !portrait ? "50%" : "100%" }}
          >
            <div
              style={{
                fontSize: Math.max(
                  portrait ? 38 : 42,
                  (portrait ? 76 : 86) -
                    Math.max(0, scene.title.length - 18) * 0.7,
                ),
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: -3,
                overflowWrap: "anywhere",
              }}
            >
              {scene.title}
            </div>
            {scene.body && (
              <div
                style={{
                  fontSize: Math.max(
                    22,
                    42 - Math.max(0, scene.body.length - 60) * 0.05,
                  ),
                  marginTop: 34,
                  lineHeight: 1.65,
                  opacity: 0.75,
                  whiteSpace: "pre-line",
                  overflowWrap: "anywhere",
                }}
              >
                {scene.body}
              </div>
            )}
          </div>
          {split && (
            <div
              style={{
                width: portrait ? "100%" : "43%",
                height: portrait ? 540 : 520,
                borderRadius: 24,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {media}
            </div>
          )}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: portrait ? 68 : 52,
          left: portrait ? 90 : 140,
          fontSize: 22,
          letterSpacing: 5,
          opacity: 0.5,
          color: full ? "white" : ink,
        }}
      >
        A LITTLE MOMENT /{" "}
        {String(
          project.scenes.findIndex((s) => s.id === scene.id) + 1,
        ).padStart(2, "0")}
      </div>
      {scene.showCaptions && caption && (
        <div
          style={{
            position: "absolute",
            bottom: portrait ? 150 : 80,
            left: "9%",
            right: "9%",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline",
              background: "rgba(20,24,22,.8)",
              color: "#fff",
              fontSize: portrait ? 34 : 31,
              lineHeight: 1.9,
              padding: "8px 20px",
              borderRadius: 10,
              boxDecorationBreak: "clone",
            }}
          >
            {caption}
          </span>
        </div>
      )}
      {scene.voiceAssetId &&
        scene.voiceNarration === scene.narration &&
        assetSources[scene.voiceAssetId] && (
          <Audio src={assetSources[scene.voiceAssetId]} />
        )}
    </AbsoluteFill>
  );
}
export function StudioComposition(props: StudioCompositionProps) {
  let from = 0;
  return (
    <AbsoluteFill>
      {props.project.scenes.map((scene) => {
        const start = from;
        from += scene.durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={start}
            durationInFrames={scene.durationInFrames}
          >
            <Scene {...props} scene={scene} />
          </Sequence>
        );
      })}
      {props.project.musicAssetId &&
        props.assetSources[props.project.musicAssetId] && (
          <Audio
            src={props.assetSources[props.project.musicAssetId]}
            volume={props.project.musicVolume}
            loop
          />
        )}
    </AbsoluteFill>
  );
}
