import type { Caption } from "@remotion/captions";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const silkTiming = timingData as Timing;
export type SilkCaptions = Record<string, Caption[]>;

/** A mulberry branch across the top of the frame; wind sways its leaves. */
export const Mulberry = ({
  sway = 0,
  flip = false,
}: {
  sway?: number;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lean = Math.sin((frame / fps) * 2.2) * sway;
  return (
    <svg
      width="100%"
      height="620"
      viewBox="0 0 1920 620"
      style={{
        position: "absolute",
        inset: 0,
        transform: `${flip ? "scaleX(-1)" : ""} rotate(${lean * 0.6}deg)`,
        transformOrigin: flip ? "right top" : "left top",
      }}
      aria-hidden="true"
    >
      <path
        d="M-40 90 Q360 60 700 110 Q1180 170 1960 130"
        stroke="#7c5334"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M240 84 Q300 170 360 200 M640 104 Q690 190 760 220 M1040 150 Q1080 240 1150 260 M1460 140 Q1490 230 1560 250"
        stroke="#7c5334"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      {[
        [140, 180],
        [330, 260],
        [540, 150],
        [760, 300],
        [980, 210],
        [1210, 320],
        [1430, 260],
        [1640, 220],
        [420, 120],
        [860, 130],
      ].map(([cx, cy], i) => (
        <g
          key={i}
          transform={`rotate(${lean} ${cx} ${cy})`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <path
            d={`M${cx} ${cy} C${cx - 70} ${cy - 44} ${cx - 96} ${cy + 30} ${cx - 20} ${cy + 40} C${cx + 60} ${cy + 32} ${cx + 60} ${cy - 40} ${cx} ${cy}Z`}
            fill={i % 3 === 0 ? "#8fae67" : "#7f9a5f"}
          />
          <path
            d={`M${cx - 6} ${cy - 4} Q${cx - 40} ${cy + 12} ${cx - 16} ${cy + 30}`}
            stroke="#c6d799"
            strokeWidth="4"
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
};

/** The silkworm: pale segments, quiet head; spinning adds the endless thread. */
export const Silkworm = ({
  x,
  y,
  scale = 1,
  spinning = false,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  spinning?: boolean;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inch = Math.sin((frame / fps) * 2.6) * 3;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + inch,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      {spinning && (
        <svg
          width={420 * scale}
          height={200 * scale}
          viewBox="0 0 420 200"
          style={{ position: "absolute", left: 0, top: -80 * scale }}
          aria-hidden="true"
        >
          <path
            d={`M60 180 Q${120 + Math.sin((frame / fps) * 3) * 30} 60 ${
              200 + Math.cos((frame / fps) * 2.4) * 40
            } 120 Q300 ${80 + Math.sin((frame / fps) * 2) * 40} 360 170`}
            stroke="#f2ead6"
            strokeWidth="3"
            fill="none"
            opacity="0.9"
          />
        </svg>
      )}
      <svg
        width={300 * scale}
        height={150 * scale}
        viewBox="0 0 300 150"
        aria-label="吐丝的蚕"
      >
        <ellipse cx="150" cy="132" rx="96" ry="10" fill="#77583a" opacity="0.16" />
        <path
          d="M60 108 Q60 58 110 52 Q170 44 236 62 Q268 76 264 100 Q250 124 190 124 Q110 126 60 108Z"
          fill="#f4eede"
        />
        <path
          d="M118 54 Q170 44 236 62 Q268 76 264 100 Q244 96 236 70 Q170 50 118 54Z"
          fill="#fdfaf1"
        />
        {[96, 140, 184, 228].map((cx) => (
          <path
            key={cx}
            d={`M${cx} 56 Q${cx + 8} 92 ${cx - 2} 122`}
            stroke="#e3dcc4"
            strokeWidth="3"
            fill="none"
          />
        ))}
        <path
          d="M236 62 Q278 64 288 84 Q282 104 252 102 Q240 86 236 62Z"
          fill="#e9ddc4"
        />
        <circle cx="272" cy="80" r="5" fill="#4a3c28" />
        <path d="M288 76 Q296 70 302 74" stroke="#4a3c28" strokeWidth="3" fill="none" />
        {spinning && <circle cx="298" cy="88" r="4" fill="#fdfaf1" opacity="0.9" />}
      </svg>
    </div>
  );
};

/** The finished cocoon, thick and round, hanging from the branch. */
export const Cocoon = ({
  x,
  y,
  scale = 1,
  sway = 0,
  frame: controlled,
}: {
  x: number;
  y: number;
  scale?: number;
  sway?: number;
  frame?: number;
}) => {
  const live = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = controlled ?? live;
  const lean = Math.sin((frame / fps) * 1.6) * sway;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${lean}deg`,
        transformOrigin: "50% -40px",
      }}
    >
      <svg
        width={200 * scale}
        height={300 * scale}
        viewBox="0 0 200 300"
        aria-label="结好的蚕茧"
      >
        <path d="M100 0 L100 70" stroke="#e3dcc4" strokeWidth="6" />
        <ellipse
          cx="100"
          cy="180"
          rx="84"
          ry="102"
          fill="#f7f2e4"
          stroke="#e0d8bd"
          strokeWidth="5"
        />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M40 ${120 + i * 36} Q100 ${96 + i * 40} 162 ${124 + i * 36}`}
            stroke="#eae2ca"
            strokeWidth="4"
            fill="none"
          />
        ))}
        <ellipse cx="72" cy="140" rx="20" ry="34" fill="#fffdf6" opacity="0.8" />
      </svg>
    </div>
  );
};

/** The mantis: bold arms like blades, ready to laugh or to lunge. */
export const Mantis = ({
  x,
  y,
  scale = 1,
  lunge = 0,
  arms = "up",
  shiver = false,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  lunge?: number;
  arms?: "up" | "raised" | "sprawled";
  shiver?: boolean;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jitter = shiver ? Math.sin((frame / fps) * 14) * 3 : 0;
  const lean = lunge * 34;
  return (
    <div
      style={{
        position: "absolute",
        left: x + jitter,
        top: y,
        rotate: `${lean}deg`,
        transformOrigin: "85% 90%",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        width={300 * scale}
        height={340 * scale}
        viewBox="0 0 300 340"
        aria-label="螳螂"
      >
        <ellipse cx="150" cy="322" rx="92" ry="10" fill="#77583a" opacity="0.16" />
        {/* 后腿 */}
        <path
          d="M120 250 Q84 288 78 320 M168 252 Q204 288 210 320"
          stroke="#7c9450"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        {/* 肚子 */}
        <path
          d="M96 210 Q88 268 130 286 Q176 296 196 262 Q204 224 176 208Z"
          fill="#9cb260"
        />
        <path d="M108 240 Q150 262 188 238" stroke="#8aa15c" strokeWidth="6" fill="none" />
        {/* 胸 */}
        <path d="M126 200 Q118 156 154 142 Q190 152 196 196 Q160 216 126 200Z" fill="#a7bd6d" />
        {/* 大刀臂 */}
        {arms === "up" && (
          <>
            <path d="M132 160 Q102 128 88 100" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M182 158 Q212 124 224 96" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M88 100 Q72 88 66 74 M224 96 Q240 84 246 70" stroke="#7c9450" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M96 104 L80 96 M100 116 L84 108 M216 100 L232 92 M212 112 L228 104" stroke="#6d8344" strokeWidth="7" strokeLinecap="round" />
          </>
        )}
        {arms === "raised" && (
          <>
            <path d="M132 156 Q96 120 86 72" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M184 154 Q220 118 228 70" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M86 72 Q84 52 94 40 M228 70 Q232 50 224 36" stroke="#7c9450" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M94 76 L80 64 M100 90 L86 78 M220 74 L234 62 M214 88 L228 76" stroke="#6d8344" strokeWidth="7" strokeLinecap="round" />
          </>
        )}
        {arms === "sprawled" && (
          <>
            <path d="M130 170 Q106 200 118 226" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M186 168 Q212 198 202 226" stroke="#8aa15c" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M118 226 Q108 240 112 252 M202 226 Q212 240 208 252" stroke="#7c9450" strokeWidth="12" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* 头 */}
        <g>
          <path d="M148 132 Q140 86 172 74 Q204 84 202 132 Q176 146 148 132Z" fill="#a7bd6d" />
          <path d="M160 78 Q170 52 186 44 M192 82 Q202 60 216 54" stroke="#7c9450" strokeWidth="7" fill="none" strokeLinecap="round" />
          <ellipse cx="166" cy="102" rx="15" ry="18" fill="#e9efdb" stroke="#6d8344" strokeWidth="4" />
          <ellipse cx="192" cy="102" rx="15" ry="18" fill="#e9efdb" stroke="#6d8344" strokeWidth="4" />
          <circle cx="166" cy="104" r="7" fill="#3a3a2a" />
          <circle cx="192" cy="104" r="7" fill="#3a3a2a" />
          <path d="M176 124 Q180 128 184 124" stroke="#6d8344" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

/** Falling leaves for the missed lunges; each leaf spins as it drops. */
export const LeafFall = ({ from = 0 }: { from?: number }) => {
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
        const t = Math.max(0, Math.min(1, ((frame - from - i * 6) / fps) / 1.6));
        const x = 880 + i * 120 - t * 60;
        const y = 320 + t * 460;
        return (
          <path
            key={i}
            d="M0 0 C-26 -18 -40 8 -8 16 C22 22 30 -6 0 0Z"
            fill="#a9af6a"
            opacity={interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0], clamp)}
            transform={`translate(${x} ${y}) rotate(${t * 420 + i * 60})`}
          />
        );
      })}
    </svg>
  );
};

/** Quiet snowfall settling over the winter frame. */
export const Snowfall = ({ count = 22 }: { count?: number }) => {
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
        const speed = 0.09 + (i % 5) * 0.03;
        const t = (((frame / fps) * speed + (i * 0.137) % 1) % 1);
        const x = (i * 173 + Math.sin((frame / fps) * 0.8 + i) * 40) % 1920;
        const y = t * 1080;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4 + (i % 3) * 2}
            fill="#ffffff"
            opacity={0.5 + (i % 3) * 0.15}
          />
        );
      })}
    </svg>
  );
};

/** A sunny grove backdrop in the story's paper tones. */
export const Grove = ({ winter = false }: { winter?: boolean }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", inset: 0 }}
    aria-hidden="true"
  >
    <rect width="1920" height="1080" fill="none" />
    <path
      d="M0 940 Q480 900 960 930 Q1440 958 1920 916 L1920 1080 L0 1080Z"
      fill={winter ? "#e9e6dc" : "#d3ddba"}
    />
    <path
      d="M0 960 Q560 936 1120 962 Q1600 984 1920 948"
      stroke={winter ? "#cfccc0" : "#b7c69a"}
      strokeWidth="8"
      fill="none"
    />
  </svg>
);
