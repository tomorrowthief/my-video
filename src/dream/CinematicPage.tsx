import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { dreamTiming } from "./DreamArt";

type ShotProps = {
  asset: string;
  alt: string;
  duration: number;
  start?: number;
  zoom?: readonly [number, number];
  focus?: string;
  pan?: readonly [number, number];
};

/** A slow camera move over a generated, full-resolution film frame. */
export const FilmShot = ({
  asset,
  alt,
  duration,
  start = 0,
  zoom = [1, 1.055],
  focus = "50% 50%",
  pan = [0, 0],
}: ShotProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame - start,
    [0, Math.max(1, duration)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity:
          start > 0
            ? interpolate(frame, [start, start + 24], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1,
      }}
    >
      <Img
        src={staticFile(`dream/v2/${asset}.png`)}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: focus,
          scale: zoom[0] + (zoom[1] - zoom[0]) * progress,
          translate: `${pan[0] + (pan[1] - pan[0]) * progress}px 0`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Split narration into short, voice-timed subtitle cues instead of one long paragraph. */
const cuesFor = (text: string, duration: number) => {
  const parts = text.match(/[^，。！？；：]+[，。！？；：]?/g) ?? [text];
  const lines: string[] = [];
  for (const part of parts) {
    if (lines.length && Array.from(lines[lines.length - 1] + part).length <= 25)
      lines[lines.length - 1] += part;
    else lines.push(part);
  }
  const weights = lines.map((v) => Array.from(v).length);
  const total = weights.reduce((a, b) => a + b, 0);
  let elapsed = 0;
  return lines.map((line, i) => {
    const from = Math.floor((elapsed / total) * duration);
    elapsed += weights[i];
    return {
      line,
      from,
      to:
        i === lines.length - 1
          ? duration
          : Math.floor((elapsed / total) * duration),
    };
  });
};

export const CinematicPage = ({
  index,
  children,
  title = false,
  dreamDust = true,
}: {
  index: number;
  children: ReactNode;
  title?: boolean;
  dreamDust?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = dreamTiming.scenes[index];
  const active = scene.paragraphs.find(
    (p) => frame >= p.startFrame && frame < p.startFrame + p.durationInFrames,
  );
  const cue = active
    ? cuesFor(active.text, active.durationInFrames).find(
        (c) =>
          frame - active.startFrame >= c.from &&
          frame - active.startFrame < c.to,
      )
    : undefined;
  return (
    <AbsoluteFill
      style={{
        background: "#080e1a",
        fontFamily: '"Songti SC", "Noto Serif CJK SC", serif',
        color: "#fff4dd",
        overflow: "hidden",
        opacity: interpolate(
          frame,
          [0, 18, scene.durationInFrames - 14, scene.durationInFrames],
          [index === 0 ? 1 : 0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      {children}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(3,8,18,.22) 0%,transparent 24%,transparent 65%,rgba(3,8,18,.78) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 140px rgba(2,7,17,.25)",
          pointerEvents: "none",
        }}
      />
      {dreamDust && (
        <svg
          viewBox="0 0 1920 1080"
          width="1920"
          height="1080"
          style={{ position: "absolute", pointerEvents: "none" }}
        >
          {Array.from({ length: 26 }, (_, i) => (
            <circle
              key={i}
              cx={110 + ((i * 173) % 1670) + Math.sin(frame / 80 + i) * 17}
              cy={210 + ((i * 97) % 580) - Math.sin(frame / 100 + i) * 23}
              r={i % 5 === 0 ? 2.7 : 1.3}
              fill="#ffe2a2"
              opacity={0.12 + 0.38 * Math.sin(frame / 50 + i) ** 2}
            />
          ))}
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 64,
          fontSize: 24,
          letterSpacing: 7,
          color: "#efdfc3",
          textShadow: "0 2px 12px #08101c",
        }}
      >
        月光故事集
      </div>
      {index !== 0 && (
        <div
          style={{
            position: "absolute",
            right: 92,
            top: 65,
            fontSize: 24,
            letterSpacing: 4,
            textShadow: "0 2px 14px #08101c",
          }}
        >
          {String(index + 1).padStart(2, "0")} / 08
        </div>
      )}
      {title && (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 247,
            opacity: interpolate(
              frame,
              [
                0,
                45,
                Math.round(scene.durationInFrames * 0.39),
                Math.round(scene.durationInFrames * 0.46),
              ],
              [1, 1, 1, 0],
              { extrapolateRight: "clamp" },
            ),
            translate: `0 ${interpolate(frame, [0, 60], [8, 0], { extrapolateRight: "clamp" })}px`,
            textShadow: "0 4px 40px #050d1c",
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 11,
              color: "#eddbb2",
              marginBottom: 28,
            }}
          >
            今晚，去一个有梦的地方
          </div>
          <div style={{ fontSize: 101, lineHeight: 1.25, letterSpacing: 12 }}>
            偷梦的妖精
          </div>
          <div
            style={{
              width: 66,
              height: 2,
              background: "#e0bd7e",
              marginTop: 35,
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 210,
          right: 210,
          bottom: 94,
          textAlign: "center",
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 39,
          lineHeight: 1.6,
          letterSpacing: 1.2,
          textShadow: "0 2px 6px #030710,0 3px 20px #030710",
        }}
      >
        {cue?.line}
      </div>
      {scene.paragraphs.map((p) => (
        <Sequence
          key={p.index}
          from={p.startFrame}
          durationInFrames={p.durationInFrames}
          premountFor={fps}
        >
          <Audio src={staticFile(`audio-dream/${p.file}`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
