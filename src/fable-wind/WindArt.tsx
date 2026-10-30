import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const windTiming = timingData as Timing;
export type WindCaptions = Record<string, Caption[]>;

/** A winding hill road under an autumn sky; warmth turns it golden. */
export const HillRoad = ({ warm = 0 }: { warm?: number }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const grass = warm ? "#d8c88e" : "#b7c6a4";
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        inset: 0,
        scale: interpolate(frame, [0, durationInFrames], [1, 1.03], clamp),
      }}
      aria-hidden="true"
    >
      <path
        d="M0 780 Q480 720 960 760 Q1440 800 1920 740 L1920 1080 L0 1080Z"
        fill={grass}
      />
      <path
        d="M0 820 Q560 770 1120 810 Q1560 842 1920 800"
        stroke={warm ? "#c2ae76" : "#9db08c"}
        strokeWidth="10"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M480 1080 Q520 940 760 900 Q1000 860 1060 760"
        stroke="#d9c9a0"
        strokeWidth="90"
        fill="none"
        strokeLinecap="round"
        opacity={0.55 + warm * 0.2}
      />
      <path
        d="M480 1080 Q520 940 760 900 Q1000 860 1060 760"
        stroke="#c9b78e"
        strokeWidth="8"
        fill="none"
        strokeDasharray="30 26"
        opacity="0.7"
      />
      {[150, 360, 1580, 1780].map((x, i) => (
        <path
          key={x}
          d={`M${x} 790 Q${x - 16} ${660 - i * 20} ${x + 6} ${610 - i * 24}`}
          stroke="#7c5334"
          strokeWidth={i % 2 ? 16 : 22}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {[120, 340, 1560, 1800].map((x, i) => (
        <ellipse key={x} cx={x} cy={560 - i * 18} rx="90" ry="60" fill="#c9a35f" opacity="0.5" />
      ))}
    </svg>
  );
};

/** The sky wash behind the scene. */
export const Sky = ({ warm = 0 }: { warm?: number }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: warm
        ? "linear-gradient(180deg,#f6e7bd 0%,#f2ead1 55%,#e8d9ae 100%)"
        : "linear-gradient(180deg,#dfe4e6 0%,#e9ebee 50%,#dde1e4 100%)",
    }}
  />
);

/** The north wind: a cross cloud with puffed cheeks, blowing gusts. */
export const NorthWind = ({
  x,
  y,
  scale = 1,
  blow = 0,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  blow?: number;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const puff = 0.5 + Math.sin((frame / fps) * 3) * 0.5 * blow;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${flip ? "scaleX(-1)" : ""}`,
      }}
    >
      <svg
        width={440 * scale}
        height={380 * scale}
        viewBox="0 0 440 380"
        aria-label="北风"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (((frame / fps) * (0.6 + blow * 0.5) + i * 0.2) % 1);
          return (
            <path
              key={i}
              d={`M330 200 Q${420 + i * 30} 180 ${500 + i * 30} 196`}
              stroke="#b6c3ca"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity={(1 - t) * blow}
              transform={`translate(${t * 90} ${-t * 10})`}
            />
          );
        })}
        <g>
          <ellipse cx="220" cy="200" rx="150" ry="110" fill="#cdd8dd" />
          <ellipse cx="120" cy="180" rx="62" ry="52" fill="#dbe4e8" />
          <ellipse cx="320" cy="180" rx="66" ry="54" fill="#c4d0d6" />
          {/* 鼓起的腮帮 */}
          <ellipse
            cx={330}
            cy={236}
            rx={26 + puff * 16}
            ry={30 + puff * 18}
            fill="#dbe4e8"
          />
          {/* 眼睛 */}
          <path
            d="M186 168 Q196 158 206 168 M240 166 Q250 156 260 166"
            stroke="#5a6a72"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* 嘴巴 */}
          <ellipse cx={316} cy={212} rx="26" ry={12 + puff * 8} fill="#8fa3ad" />
        </g>
      </svg>
    </div>
  );
};

/** The sun: unhurried rays that grow warmer as warm goes 0 → 1. */
export const SunChar = ({
  x,
  y,
  scale = 1,
  warm = 0,
}: {
  x: number;
  y: number;
  scale?: number;
  warm?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = 0.4 + warm * 0.6 + Math.sin((frame / fps) * 1.4) * 0.06;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div
        style={{
          position: "absolute",
          left: -60 * scale,
          top: -60 * scale,
          width: 420 * scale,
          height: 420 * scale,
          borderRadius: "50%",
          background: `radial-gradient(closest-side,#f6d78866,transparent)`,
          opacity: glow,
        }}
      />
      <svg
        width={320 * scale}
        height={320 * scale}
        viewBox="0 0 320 320"
        aria-label="太阳"
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 30;
          const len = 30 + warm * 16 + Math.sin((frame / fps) * 2 + i) * 4;
          return (
            <path
              key={i}
              d={`M160 20 L160 ${20 + len}`}
              stroke="#e5b54c"
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.5 + warm * 0.4}
              transform={`rotate(${a} 160 160)`}
            />
          );
        })}
        <circle cx="160" cy="160" r="96" fill="#f0ca6d" stroke="#d8b45c" strokeWidth="6" />
        <path
          d="M126 150 Q136 138 146 150 M174 150 Q184 138 194 150"
          stroke="#a4743a"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M128 186 Q160 210 192 186"
          stroke="#a4743a"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="120" cy="176" r="14" fill="#f2d9a0" opacity="0.85" />
        <circle cx="200" cy="176" r="14" fill="#f2d9a0" opacity="0.85" />
      </svg>
    </div>
  );
};

/** The traveler: grip 1 clutches the coat shut, grip 0 lets it hang open. */
export const Traveler = ({
  x,
  y,
  scale = 1,
  grip = 1,
  draped = false,
  collar = 0,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  grip?: number;
  draped?: boolean;
  collar?: number;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stride = Math.sin((frame / fps) * 4) * 6;
  const hunch = grip * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${flip ? "scaleX(-1)" : ""}`,
      }}
    >
      <svg
        width={360 * scale}
        height={560 * scale}
        viewBox="0 0 360 560"
        aria-label="赶路的旅人"
      >
        <ellipse cx="180" cy="540" rx="110" ry="13" fill="#77583a" opacity="0.16" />
        {/* 腿 */}
        <g stroke="#6b4a2e" strokeWidth="26" strokeLinecap="round">
          <path d={`M160 400 Q${150 + stride} 470 ${144 + stride} 520`} />
          <path d={`M204 400 Q${216 - stride} 470 ${224 - stride} 520`} />
        </g>
        <path d="M132 520 h36 M208 520 h36" stroke="#54391f" strokeWidth="18" strokeLinecap="round" />
        {/* 厚外套身体 */}
        <g transform={`rotate(${-hunch} 180 380)`}>
          <path
            d="M104 300 Q86 460 104 480 Q146 496 180 490 Q218 496 258 480 Q276 460 258 300 Q220 280 180 282 Q140 280 104 300Z"
            fill={draped ? "#a5662f" : "#8a5620"}
          />
          <path d="M170 292 Q176 420 172 486 Q180 490 188 486 Q184 420 190 292Z" fill="#9a6128" />
          {/* 竖起的衣领 */}
          <path
            d={`M118 302 Q108 ${284 - collar * 26} 128 ${276 - collar * 30} Q150 ${288 - collar * 10} 158 306Z`}
            fill="#7c4a1a"
          />
          <path
            d={`M242 302 Q252 ${284 - collar * 26} 232 ${276 - collar * 30} Q210 ${288 - collar * 10} 202 306Z`}
            fill="#7c4a1a"
          />
          {/* 抓紧的手 */}
          {draped ? (
            <>
              <path d="M104 330 Q70 350 76 386" fill="none" stroke="#8a5620" strokeWidth="22" strokeLinecap="round" />
              <path d="M256 330 Q292 348 288 384" fill="none" stroke="#8a5620" strokeWidth="22" strokeLinecap="round" />
              {/* 搭在肩上的外套下摆 */}
              <path d="M256 322 Q318 300 330 338 Q334 368 300 376 Q270 380 258 352Z" fill="#8a5620" opacity="0.92" />
              <path d="M262 348 Q306 336 322 356" stroke="#6b3f16" strokeWidth="6" fill="none" />
            </>
          ) : (
            <>
              <path
                d={`M108 332 Q${80 + grip * 60} ${350 - grip * 10} ${100 + grip * 66} ${
                  380 - grip * 36
                }`}
                fill="none"
                stroke="#8a5620"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d={`M254 332 Q${282 - grip * 60} ${350 - grip * 10} ${262 - grip * 66} ${
                  380 - grip * 36
                }`}
                fill="none"
                stroke="#8a5620"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <circle cx={100 + grip * 66} cy={380 - grip * 36} r="12" fill="#e8b98a" />
              <circle cx={262 - grip * 66} cy={380 - grip * 36} r="12" fill="#e8b98a" />
            </>
          )}
        </g>
        {/* 头 */}
        <g transform={`translate(0 ${hunch * 0.7})`}>
          <circle cx="180" cy="228" r="50" fill="#e8b98a" />
          <path d="M132 210 Q180 168 228 210 Q230 184 180 162 Q130 184 132 210Z" fill="#5a4530" />
          <path d="M130 208 Q180 240 230 208 Q232 226 180 238 Q128 226 130 208Z" fill="#6a5238" />
          {grip > 0.5 ? (
            <>
              <path d="M158 226 Q168 216 178 226 M182 226 Q192 216 202 226" stroke="#3b2f26" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M164 252 Q180 258 196 252" stroke="#8a5a3a" strokeWidth="5" fill="none" />
            </>
          ) : (
            <>
              <path d="M158 222 Q168 214 178 222 M182 222 Q192 214 202 222" stroke="#3b2f26" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M166 248 Q180 258 194 248" stroke="#8a5a3a" strokeWidth="5" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* 汗珠 */}
          {grip < 0.3 && (
            <path d="M222 200 q10 16 0 22 q-10 -6 0 -22" fill="#8fbed0" />
          )}
        </g>
      </svg>
    </div>
  );
};

/** Gust streaks flying across the frame. */
export const Gusts = ({ strength = 1 }: { strength?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {Array.from({ length: 7 }).map((_, i) => {
        const t = (((frame / fps) * (0.5 + strength * 0.4) + i * 0.14) % 1);
        const y = 180 + i * 110;
        return (
          <path
            key={i}
            d={`M${-260 + t * 2200} ${y} q60 -14 120 0`}
            stroke="#b6c3ca"
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            opacity={(1 - Math.abs(t - 0.5) * 1.6) * 0.55 * strength}
          />
        );
      })}
    </svg>
  );
};

/** Leaves carried sideways by the gale. */
export const LeavesFly = ({ strength = 1 }: { strength?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, i) => {
        const t = (((frame / fps) * (0.34 + strength * 0.3) + i * 0.17) % 1);
        const x = -80 + t * 2100;
        const y = 200 + i * 130 + Math.sin(t * 6 + i) * 60;
        return (
          <path
            key={i}
            d="M0 0 C-26 -18 -40 8 -8 16 C22 22 30 -6 0 0Z"
            fill="#a9af6a"
            transform={`translate(${x} ${y}) rotate(${t * 720 + i * 90})`}
            opacity={strength * 0.85}
          />
        );
      })}
    </svg>
  );
};

/** Warm light beams for the sun's turn. */
export const WarmBeams = ({ warm = 1 }: { warm?: number }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0 }}
    aria-hidden="true"
  >
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M${1180 + i * 180} 120 L${640 + i * 260} 1080 L${820 + i * 260} 1080 L${
          1260 + i * 180
        } 120Z`}
        fill="#f2c96e"
        opacity={0.1 * warm}
      />
    ))}
  </svg>
);
