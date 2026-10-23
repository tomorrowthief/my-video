import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timingData from "./timing.json";
import captionsData from "./captions.json";
import type { Timing } from "../types";

export const storyTiming = timingData as Timing;
export const FONT = '"PingFang SC", "Microsoft YaHei", sans-serif';
export const INK = "#455338";
export const PAPER = "#fff8e9";
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type SceneId = keyof typeof captionsData;

export const Character = ({
  who,
  pose = 0,
  x,
  y,
  scale = 1,
  rotation = 0,
}: {
  who: "xiaohe" | "farmer";
  pose?: 0 | 1 | 2;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}) => {
  const { fps } = useVideoConfig();
  const rowTop = who === "xiaohe" ? 0 : 494;
  const cellHeight = who === "xiaohe" ? 494 : 530;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 512 * scale,
        height: cellHeight * scale,
        overflow: "hidden",
        rotate: `${rotation}deg`,
        transformOrigin: "50% 95%",
      }}
    >
      <Img
        name={who === "xiaohe" ? "小禾形象" : "农夫形象"}
        src={staticFile("idioms/characters-v1.png")}
        premountFor={fps}
        style={{
          position: "absolute",
          width: 1536 * scale,
          height: 1024 * scale,
          maxWidth: "none",
          left: -pose * 512 * scale,
          top: -rowTop * scale,
        }}
      />
    </div>
  );
};

export const Seedling = ({
  x,
  y,
  scale = 1,
  lift = 0,
  droop = 0,
  growth = 1,
  roots = false,
}: {
  x: number;
  y: number;
  scale?: number;
  lift?: number;
  droop?: number;
  growth?: number;
  roots?: boolean;
}) => (
  <svg
    width={220 * scale}
    height={330 * scale}
    viewBox="0 0 220 330"
    style={{ position: "absolute", left: x, top: y }}
    aria-label={droop > 0.5 ? "叶子低垂的小苗" : "小苗"}
  >
    <ellipse cx="110" cy="261" rx="66" ry="11" fill="#77583a" opacity="0.18" />
    {roots && (
      <path
        d="M38 265 Q110 250 182 265 L182 326 L38 326Z"
        fill="#ba8861"
        opacity="0.6"
      />
    )}
    <g transform={`translate(0 ${-lift})`}>
      {(roots || lift > 0) && (
        <g fill="none" stroke="#ba986e" strokeWidth="4" strokeLinecap="round">
          <path d="M110 256 Q110 288 102 311 M108 275 L82 292 M108 280 L129 302 M104 297 L90 310" />
        </g>
      )}
      <g transform={`translate(110 260) scale(${growth}) translate(-110 -260)`}>
        <path
          d={`M110 260 Q${100 + droop * 13} 195 ${109 + droop * 8} 148`}
          fill="none"
          stroke={droop > 0.5 ? "#8b9952" : "#5b8b46"}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <g transform={`rotate(${-droop * 80} 110 197)`}>
          <path
            d="M110 197 C71 196 43 169 39 135 C79 132 113 156 110 197Z"
            fill={droop > 0.5 ? "#a9af6a" : "#91b56a"}
            stroke="#688947"
            strokeWidth="3"
          />
          <path
            d="M105 192 Q77 164 49 145"
            fill="none"
            stroke="#c6d799"
            strokeWidth="3"
          />
        </g>
        <g transform={`rotate(${droop * 95} 109 170)`}>
          <path
            d="M109 171 C105 129 133 95 173 94 C174 132 151 166 109 171Z"
            fill={droop > 0.5 ? "#b1b774" : "#77a35e"}
            stroke="#618548"
            strokeWidth="3"
          />
          <path
            d="M115 164 Q140 128 163 105"
            fill="none"
            stroke="#b4cd8f"
            strokeWidth="3"
          />
        </g>
        <path d="M111 151 Q91 132 101 112 Q121 125 111 151" fill="#abc37d" />
      </g>
    </g>
    <path
      d="M58 264 Q110 256 163 264"
      fill="none"
      stroke="#9c7049"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export const Garden = ({ washed = false }: { washed?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <>
      <Img
        name="春日菜园"
        src={staticFile("idioms/garden.png")}
        premountFor={fps}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.035], clamp),
          opacity: washed ? 0.25 : 1,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #fff8e9e8 0%, #fff8e950 22%, transparent 45%, transparent 76%, #fff8e9 94%)",
        }}
      />
    </>
  );
};

export const SceneTitle = ({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) => (
  <div style={{ position: "absolute", left: 112, top: 163, color: INK }}>
    <div
      style={{
        fontSize: 87,
        fontWeight: 750,
        letterSpacing: 2,
        lineHeight: 1.28,
      }}
    >
      {children}
    </div>
    {note && (
      <div
        style={{
          fontSize: 37,
          marginTop: 18,
          color: "#7b8063",
          lineHeight: 1.5,
        }}
      >
        {note}
      </div>
    )}
  </div>
);

export const Bubble = ({
  children,
  x,
  y,
  width = 450,
}: {
  children: ReactNode;
  x: number;
  y: number;
  width?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      padding: "25px 34px",
      borderRadius: "45px 45px 8px 45px",
      background: PAPER,
      border: "3px solid #d6c7a6",
      color: "#695940",
      fontSize: 45,
      fontWeight: 600,
      textAlign: "center",
      lineHeight: 1.5,
      boxShadow: "0 8px 0 #b08a4b10",
    }}
  >
    {children}
  </div>
);

export const ThoughtDots = ({
  from,
  x = 1090,
  y = 760,
}: {
  from: number;
  x?: number;
  y?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        gap: 24,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#a8b47b",
            opacity: interpolate(
              frame,
              [from + i * fps * 0.6, from + (i * 0.6 + 0.3) * fps],
              [0.2, 1],
              clamp,
            ),
            translate: `0px ${-5 * Math.sin((frame / fps) * 2 + i)}px`,
          }}
        />
      ))}
    </div>
  );
};

export const CareIcon = ({
  kind,
  size = 100,
}: {
  kind: "water" | "sun" | "time";
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    {kind === "water" && (
      <>
        <path
          d="M50 10 C43 28 23 43 23 61 A27 27 0 0 0 77 61 C77 43 57 28 50 10Z"
          fill="#8fbed0"
          stroke="#6095ac"
          strokeWidth="3"
        />
        <path
          d="M36 61 Q35 73 48 77"
          fill="none"
          stroke="#d4e9eb"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </>
    )}
    {kind === "sun" && (
      <>
        <circle
          cx="50"
          cy="50"
          r="23"
          fill="#f0ca6d"
          stroke="#d8b45c"
          strokeWidth="3"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path
            key={a}
            d="M50 7 L50 16"
            stroke="#d8b45c"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </>
    )}
    {kind === "time" && (
      <>
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="#f7e8c9"
          stroke="#a9ad7e"
          strokeWidth="5"
        />
        <path
          d="M50 27 L50 51 L66 61"
          fill="none"
          stroke="#7f8864"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="4" fill="#7f8864" />
      </>
    )}
  </svg>
);

const captions = captionsData as Record<SceneId, Caption[]>;

/** Per-story settings for the shared frame: later episodes override these via context. */
export type StoryMeta = {
  readonly timing: Timing;
  readonly captions: Record<string, Caption[]>;
  readonly series: string;
  readonly episode: string;
  readonly audioDir: string;
};

export const StoryMetaContext = createContext<StoryMeta>({
  timing: storyTiming,
  captions,
  series: "小禾的成语故事",
  episode: "第一集",
  audioDir: "audio-idiom",
});

export const StoryFrame = ({
  id,
  children,
  style,
}: {
  id: string;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = useContext(StoryMetaContext);
  const scene = meta.timing.scenes.find((s) => s.id === id)!;
  const caption = (meta.captions[id] ?? []).find(
    (c) => c.startMs <= (frame / fps) * 1000 && c.endMs > (frame / fps) * 1000,
  );
  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        fontFamily: FONT,
        color: INK,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 67,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 31,
          color: "#687957",
          fontWeight: 600,
          letterSpacing: 3,
        }}
      >
        <span
          style={{
            width: 18,
            height: 26,
            borderRadius: "18px 2px 18px 2px",
            background: "#99ac70",
            rotate: "-20deg",
          }}
        />
        {meta.series}
        <span style={{ color: "#a3a486", fontSize: 27, letterSpacing: 1 }}>
          {meta.episode}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 112,
          top: 73,
          fontSize: 27,
          color: "#86916d",
          letterSpacing: 2,
        }}
      >
        {scene.index} / {String(meta.timing.scenes.length).padStart(2, "0")}
      </div>
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 148,
            right: 148,
            bottom: 108,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 94,
            textAlign: "center",
            fontSize: 45,
            fontWeight: 500,
            color: "#514a3a",
            lineHeight: 1.55,
            textWrap: "balance",
            padding: "15px 35px",
            background: "#fff8e9ed",
            borderRadius: 24,
          }}
        >
          {caption.text}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 112,
          right: 112,
          bottom: 65,
          height: 4,
          borderRadius: 4,
          background: "#dbd4b966",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((scene.startFrame + Math.max(0, frame)) / meta.timing.totalFrames) * 100}%`,
            background: "#97ac78",
          }}
        />
      </div>
      {/* Narration is intentionally generated as one template from the TTS timeline. */}
      {scene.paragraphs.map((p) => (
        <Sequence
          key={p.file}
          name={p.text}
          from={p.startFrame}
          durationInFrames={p.durationInFrames}
          premountFor={fps}
        >
          <Audio src={staticFile(`${meta.audioDir}/${p.file}`)} premountFor={fps} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background: PAPER,
          pointerEvents: "none",
          opacity: interpolate(frame, [0, 10], [0.16, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
