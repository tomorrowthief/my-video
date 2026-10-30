import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const arrowTiming = timingData as Timing;
export type ArrowCaptions = Record<string, Caption[]>;

/** The great river by night: cold bands of water under a misty sky. */
export const RiverNight = ({ pale = false }: { pale?: boolean }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame / 30) * 0.7);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arrowsSky" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            stopColor={pale ? "#cfd9d4" : "#5c6b76"}
          />
          <stop
            offset="0.62"
            stopColor={pale ? "#dfe4d9" : "#8b96a0"}
          />
          <stop offset="1" stopColor={pale ? "#c3cdc4" : "#71828c"}
          />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#arrowsSky)" />
      <path
        d="M0 700 Q480 660 960 690 Q1440 716 1920 676 L1920 1080 L0 1080Z"
        fill={pale ? "#9db4ae" : "#4c5f6d"}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${790 + i * 66} Q520 ${762 + i * 60 + drift * 8} 1040 ${
            792 + i * 60
          } Q1520 ${818 + i * 58} 1920 ${780 + i * 62}`}
          stroke={pale ? "#e6eee8" : "#a8bac2"}
          strokeWidth="7"
          fill="none"
          opacity={0.5 - i * 0.08}
        />
      ))}
      {pale && (
        <circle
          cx="1620"
          cy="180"
          r="92"
          fill="#f3df9a"
          opacity="0.95"
        />
      )}
    </svg>
  );
};

/** Thick drifting mist; density 0 hides the world, 1 lets it show. */
export const Fog = ({ density = 0.6 }: { density?: number }) => {
  const frame = useCurrentFrame();
  const opacity = density * 0.9;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {[0, 1, 2, 3].map((i) => {
        const w = 1300 + i * 220;
        const t = (((frame / 30) * 0.11 + i * 0.27) % 1);
        const x = -600 + t * 2200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 140 + i * 190,
              width: w,
              height: 260 + i * 30,
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side,#ffffffee,#ffffff88 55%,transparent)",
              opacity,
              filter: "blur(2px)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg,#e9eef2d9 0%,#eef2f5a8 40%,#f5f7f8cc 100%)",
          opacity: density * 0.75,
        }}
      />
    </div>
  );
};

/** One straw man: a cross of straw rope on a stick. */
const StrawMan = ({ arrows = 0 }: { arrows?: number }) => (
  <svg width="90" height="150" viewBox="0 0 90 150" aria-hidden="true">
    <path d="M45 6 L45 130" stroke="#7c5334" strokeWidth="9" />
    <path d="M10 44 L80 44" stroke="#7c5334" strokeWidth="8" />
    <circle cx="45" cy="30" r="20" fill="#d9b978" />
    <path d="M18 78 Q45 66 72 78 L72 118 Q45 128 18 118Z" fill="#cfa961" />
    <path d="M26 80 Q45 72 64 80 L64 96 Q45 102 26 96Z" fill="#ddc086" />
    {Array.from({ length: Math.min(arrows, 7) }).map((_, i) => (
      <path
        key={i}
        d={`M${16 + i * 10} ${34 + (i % 3) * 8} L${22 + i * 10} ${8 - (i % 2) * 4}`}
        stroke="#3b4650"
        strokeWidth="4"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

/** The borrowed boat: hull, straw men, and the arrows they caught. */
export const StrawBoat = ({
  x,
  y,
  scale = 1,
  arrows = 0,
  covered = false,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  arrows?: number;
  covered?: boolean;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bob = Math.sin((frame / fps) * 1.3) * 5;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        width={620 * scale}
        height={300 * scale}
        viewBox="0 0 620 300"
        aria-label="扎满草人的船"
      >
        <path
          d="M30 190 Q310 246 590 190 Q520 262 310 268 Q100 262 30 190Z"
          fill="#6b4a2e"
        />
        <path
          d="M60 196 Q310 240 560 196 Q540 216 310 224 Q80 216 60 196Z"
          fill="#84593a"
        />
        <path d="M100 190 L100 150 M520 190 L520 150" stroke="#54391f" strokeWidth="10" />
        {covered && (
          <path d="M70 150 Q310 118 550 150 Q540 190 310 178 Q80 190 70 150Z" fill="#4a5f6a" />
        )}
      </svg>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (120 + i * 115) * scale,
            top: (covered ? 58 : 64) * scale,
            scale: `${scale * 0.9}`,
          }}
        >
          <StrawMan arrows={Math.round((arrows / 7) * 7 - i)} />
        </div>
      ))}
    </div>
  );
};

/** A storm of arrows crossing the frame, repeating through the scene. */
export const ArrowRain = ({
  from = 0,
  angle = -28,
  speed = 0.55,
  count = 9,
}: {
  from?: number;
  angle?: number;
  speed?: number;
  count?: number;
}) => {
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
      {Array.from({ length: count }).map((_, i) => {
        const t = (((frame - from) / fps) * speed + i * 0.13) % 1;
        const x = 260 + i * 170;
        const y = t * 900 - 120;
        return (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${angle})`}
            opacity={interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0], clamp)}
          >
            <path d="M0 0 L0 74" stroke="#4c3b28" strokeWidth="6" strokeLinecap="round" />
            <path d="M-9 -14 L0 4 L9 -14 L3 -6 L-3 -6Z" fill="#9aa5ad" />
            <path d="M-7 74 Q0 66 7 74" stroke="#b6452e" strokeWidth="4" fill="none" />
          </g>
        );
      })}
    </svg>
  );
};

/** 诸葛亮: scholar's cap and robe, calm smile, feather fan at his chest. */
export const Scholar = ({
  x,
  y,
  scale = 1,
  waving = false,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  waving?: boolean;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breath = Math.sin((frame / fps) * 1.1) * 2;
  const fanWave = Math.sin((frame / fps) * 2.4) * (waving ? 12 : 0);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${flip ? "scaleX(-1) " : ""}translateY(${breath}px)`,
        transformOrigin: "50% 92%",
      }}
    >
      <svg
        width={380 * scale}
        height={560 * scale}
        viewBox="0 0 380 560"
        aria-label="诸葛亮"
      >
        <ellipse cx="190" cy="540" rx="120" ry="14" fill="#77583a" opacity="0.16" />
        {/* 鹤氅 */}
        <path
          d="M104 330 Q94 470 104 532 Q150 546 190 540 Q232 546 278 532 Q288 470 276 330 Q234 302 190 304 Q146 302 104 330Z"
          fill="#e6dcc2"
        />
        <path d="M170 312 Q176 430 172 538 Q190 542 208 538 Q204 430 210 312Z" fill="#d5c8a6" />
        <path d="M104 330 Q60 460 52 540 Q70 548 84 542 Q92 460 118 336Z" fill="#cdc0a0" />
        <path d="M276 330 Q320 470 328 540 Q310 548 296 542 Q288 470 262 336Z" fill="#cdc0a0" />
        {/* 腰带 */}
        <path d="M118 396 Q190 414 262 396 L262 420 Q190 436 118 420Z" fill="#3f5566" />
        {/* 拂尘般的手与羽扇 */}
        <g transform={`rotate(${fanWave} 130 430)`}>
          <path d="M138 348 Q108 372 96 410" fill="none" stroke="#e6dcc2" strokeWidth="24" strokeLinecap="round" />
          <path d="M96 410 Q84 430 92 452 Q116 462 132 448 Q136 420 116 408Z" fill="#f2ead6" stroke="#cfc3a2" strokeWidth="3" />
          <path d="M104 418 Q120 428 124 444 M108 412 Q124 420 130 434" stroke="#bdb188" strokeWidth="3" fill="none" />
        </g>
        <path d="M244 348 Q278 366 288 404" fill="none" stroke="#e6dcc2" strokeWidth="24" strokeLinecap="round" />
        {/* 头与纶巾 */}
        <g>
          <circle cx="190" cy="232" r="52" fill="#e8bd8d" />
          <path d="M142 208 Q190 172 238 208 Q240 186 190 166 Q140 186 142 208Z" fill="#e9e2cd" />
          <path d="M146 212 Q190 246 234 212 Q236 232 190 242 Q144 232 146 212Z" fill="#3f5566" />
          <path d="M190 166 L190 136 M190 148 Q166 138 152 146 M190 148 Q214 138 228 146" stroke="#3f5566" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M166 226 Q174 221 182 227 M198 227 Q206 221 214 226" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M182 246 Q190 251 198 246" stroke="#8a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M156 248 Q150 258 158 264 M224 248 Q230 258 222 264" stroke="#8a5a3a" strokeWidth="4" fill="none" />
        </g>
      </svg>
    </div>
  );
};

/** The war drum that lures the arrows: beaten in time. */
export const WarDrum = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = Math.sin((frame / fps) * 7);
  const strike = Math.max(0, beat) ** 3;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <svg width={240 * scale} height={210 * scale} viewBox="0 0 240 210" aria-label="战鼓">
        <ellipse cx="120" cy="196" rx="80" ry="10" fill="#77583a" opacity="0.2" />
        <path d="M40 60 Q120 36 200 60 L200 150 Q120 174 40 150Z" fill="#a63c30" />
        <ellipse cx="120" cy="60" rx="80" ry="26" fill="#e8d5b0" />
        <ellipse cx="120" cy="60" rx="80" ry="26" fill="none" stroke="#7c5334" strokeWidth="8" />
        <path d="M52 64 Q120 86 188 64" stroke="#c9ab7c" strokeWidth="5" fill="none" />
        <g stroke="#54391f" strokeWidth="14" strokeLinecap="round">
          <path d={`M206 44 L${236 + strike * 8} ${28 - strike * 10}`} />
          <path d={`M34 44 L${6 - strike * 8} ${28 - strike * 10}`} />
        </g>
        <path d="M56 150 Q120 168 184 150" stroke="#7c2c24" strokeWidth="6" fill="none" />
      </svg>
    </div>
  );
};

/** Cao Cao's stockade wall rising out of the mist. */
export const Stockade = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <svg
    width={560 * scale}
    height={420 * scale}
    viewBox="0 0 560 420"
    style={{ position: "absolute", left: x, top: y }}
    aria-label="曹军水寨"
  >
    <path d="M20 400 L20 180 Q70 150 120 180 L120 400Z" fill="#5d5346" />
    <path d="M440 400 L440 180 Q490 150 540 180 L540 400Z" fill="#5d5346" />
    <rect x="112" y="200" width="336" height="180" fill="#4c443a" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={120 + i * 56} y="172" width="14" height="34" fill="#6b5f4e" />
    ))}
    <path d="M112 200 Q280 178 448 200 L448 214 Q280 194 112 214Z" fill="#705f4a" />
  </svg>
);
