import type { Caption } from "@remotion/captions";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const stumpTiming = timingData as Timing;
export type StumpCaptions = Record<string, Caption[]>;

/** A field under morning or dusk light; crops themselves are Seedlings placed per scene. */
export const Field = ({
  withered = false,
  dusk = false,
}: {
  withered?: boolean;
  dusk?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dusk
            ? "linear-gradient(180deg,#e9c790 0%,#f0d9a8 32%,#e6c795 58%,#dcbb85 100%)"
            : withered
              ? "linear-gradient(180deg,#d8e0c2 0%,#e4dfba 34%,#dfcd9d 58%,#d4bd8b 100%)"
              : "linear-gradient(180deg,#cde5d6 0%,#e6efcf 34%,#f0e6bc 58%,#e7d2a6 100%)",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.035], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 240,
          top: 118,
          width: 132,
          height: 132,
          borderRadius: "50%",
          background: dusk ? "#e88f52" : "#f4d17a",
          opacity: dusk ? 0.75 : 0.9,
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      >
        <path
          d="M0 560 Q320 470 640 540 Q980 615 1280 535 Q1600 465 1920 555 L1920 700 L0 700Z"
          fill={withered ? "#c9c393" : "#bcd2a0"}
          opacity="0.75"
        />
        <path
          d="M0 615 Q380 555 760 610 Q1150 668 1920 600 L1920 780 L0 780Z"
          fill={withered ? "#cbb984" : "#a9c184"}
          opacity="0.6"
        />
        <path
          d="M0 700 Q480 660 960 695 Q1440 730 1920 690 L1920 1080 L0 1080Z"
          fill={withered ? "#d8c391" : "#e2c795"}
        />
        {[790, 900, 1010].map((y, i) => (
          <path
            key={y}
            d={`M0 ${y} Q960 ${y + (i % 2 ? 26 : -18)} 1920 ${y}`}
            stroke={withered ? "#c3ab77" : "#cfae7c"}
            strokeWidth="6"
            fill="none"
            opacity="0.55"
          />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #fff8e9e8 0%, #fff8e950 22%, transparent 45%, transparent 76%, #fff8e9 94%)",
        }}
      />
    </>
  );
};

/** The tree stump the whole story waits beside. */
export const Stump = ({
  x,
  y,
  scale = 1,
  shake = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  shake?: number;
}) => (
  <svg
    width={300 * scale}
    height={260 * scale}
    viewBox="0 0 300 260"
    style={{
      position: "absolute",
      left: x,
      top: y,
      rotate: `${shake}deg`,
      transformOrigin: "50% 92%",
    }}
    aria-label="田里的树桩"
  >
    <ellipse cx="150" cy="238" rx="118" ry="15" fill="#77583a" opacity="0.16" />
    <path
      d="M62 238 Q78 128 96 118 L204 118 Q222 128 238 238 Q150 252 62 238Z"
      fill="#a4713f"
    />
    <path
      d="M170 118 Q210 122 224 148 Q232 190 238 238 Q192 244 172 246Z"
      fill="#7c5334"
      opacity="0.85"
    />
    <path d="M88 132 Q86 200 92 236" stroke="#7c5334" strokeWidth="5" fill="none" opacity="0.5" />
    <ellipse cx="150" cy="118" rx="55" ry="16" fill="#8a5c36" />
    <ellipse cx="150" cy="115" rx="55" ry="15" fill="#d9b98c" />
    <ellipse cx="150" cy="115" rx="36" ry="9" fill="none" stroke="#b08a5c" strokeWidth="3" />
    <ellipse cx="150" cy="115" rx="18" ry="4.5" fill="none" stroke="#b08a5c" strokeWidth="3" />
    <path
      d="M150 118 L196 96 Q204 92 208 98"
      stroke="#8a5c36"
      strokeWidth="9"
      strokeLinecap="round"
      fill="none"
    />
    <g stroke="#8fa95e" strokeWidth="5" strokeLinecap="round" fill="none">
      <path d="M56 240 Q46 226 40 220" />
      <path d="M58 242 Q62 228 74 224" />
      <path d="M244 240 Q254 226 262 220" />
      <path d="M242 242 Q238 228 226 224" />
    </g>
  </svg>
);

/** One wild hare, either dashing or knocked out cold. */
export const Hare = ({
  x,
  y,
  scale = 1,
  mode = "run",
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  mode?: "run" | "dizzy";
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        width={300 * scale}
        height={190 * scale}
        viewBox="0 0 300 190"
        aria-label={mode === "run" ? "奔跑的野兔" : "撞晕的野兔"}
      >
        {mode === "run" ? (
          <g>
            <ellipse cx="70" cy="150" rx="34" ry="10" fill="#a5907b" opacity="0.25" />
            <path
              d="M52 138 Q60 96 108 84 Q160 74 196 92 Q232 110 224 138 Q186 152 150 148 Q104 158 66 150Z"
              fill="#b7a18c"
            />
            <path d="M196 92 Q226 84 246 92 Q236 108 216 108Z" fill="#c9b6a2" />
            <circle cx="238" cy="96" r="10" fill="#b7a18c" />
            <circle cx="242" cy="93" r="2.6" fill="#3b2f26" />
            <path d="M250 99 Q262 102 266 108" stroke="#8a755f" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M228 78 Q218 46 232 28 Q248 46 240 78Z" fill="#b7a18c" />
            <path d="M246 80 Q244 48 260 34 Q268 56 256 82Z" fill="#c9b6a2" />
            <circle cx="252" cy="120" r="9" fill="#eee4d6" />
            <path d="M78 142 Q58 156 36 150" stroke="#a08a72" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M92 148 Q76 164 56 164" stroke="#a08a72" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M176 146 Q198 156 220 150" stroke="#a08a72" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M160 150 Q172 166 194 168" stroke="#a08a72" strokeWidth="8" fill="none" strokeLinecap="round" />
            <g stroke="#c9b6a2" strokeWidth="5" strokeLinecap="round" opacity="0.6">
              <path d="M4 112 Q26 106 44 110" />
              <path d="M0 132 Q22 128 40 130" />
            </g>
          </g>
        ) : (
          <g>
            <ellipse cx="140" cy="168" rx="80" ry="10" fill="#a5907b" opacity="0.22" />
            <path
              d="M58 142 Q70 116 120 112 Q180 108 216 124 Q226 140 214 150 Q160 160 104 154 Q74 152 58 142Z"
              fill="#b7a18c"
            />
            <path d="M214 124 Q240 116 252 124 Q244 136 224 136Z" fill="#c9b6a2" />
            <path d="M234 112 Q230 86 240 74 Q250 90 244 114Z" fill="#b7a18c" transform="rotate(24 238 96)" />
            <path d="M246 114 Q248 90 260 82 Q262 100 252 116Z" fill="#c9b6a2" transform="rotate(30 254 100)" />
            <path d="M232 124 Q236 128 240 124" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M224 130 Q228 134 232 130" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="70" cy="150" r="11" fill="#eee4d6" />
            {[0, 1, 2].map((i) => {
              const a = (frame / fps) * 2.4 + (i * Math.PI * 2) / 3;
              return (
                <path
                  key={i}
                  d="M244 36 L248 44 L256 46 L248 48 L244 56 L240 48 L232 46 L240 44Z"
                  fill="#e8b64c"
                  transform={`rotate(${(a * 180) / Math.PI} 236 66) translate(${Math.cos(a) * 26 - 10} ${Math.sin(a) * 8 - 6})`}
                  opacity="0.9"
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

/** The little burst when the hare meets the stump. */
export const ImpactStars = ({ at, x, y }: { at: number; x: number; y: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - at) / (fps * 1.1);
  if (t < 0 || t > 1) return null;
  const spread = interpolate(t, [0, 1], [0, 130], clamp);
  const fade = interpolate(t, [0.5, 1], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <div
            key={a}
            style={{
              position: "absolute",
              left: Math.cos(rad) * spread,
              top: Math.sin(rad) * spread - t * 30,
              width: 26,
              height: 26,
              rotate: `${a + t * 90}deg`,
              opacity: fade,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <path
                d="M13 1 L15 9 L23 13 L15 17 L13 25 L11 17 L3 13 L11 9Z"
                fill="#e8b64c"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

/** Dry weed tufts for the neglected field. */
export const Weeds = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <svg
    width={160 * scale}
    height={110 * scale}
    viewBox="0 0 160 110"
    style={{ position: "absolute", left: x, top: y }}
    aria-hidden="true"
  >
    <g stroke="#8f9662" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M40 104 Q30 70 18 58" />
      <path d="M46 104 Q48 66 62 48" />
      <path d="M52 104 Q66 76 84 66" />
      <path d="M110 104 Q104 72 96 60" />
      <path d="M118 104 Q122 68 134 52" />
      <path d="M124 104 Q138 78 152 70" />
    </g>
    <g stroke="#a3a373" strokeWidth="4" strokeLinecap="round" fill="none">
      <path d="M44 104 Q38 86 30 78" />
      <path d="M116 104 Q112 88 106 80" />
    </g>
  </svg>
);
