import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * Shared pieces for the hand-painted animation look: paint filters, paper grain,
 * cel-shaded clouds, the characters and the slow multiplane camera.
 * Ids defined here are shared by every painted shot, so scene-specific gradients
 * and clip paths must carry their scene's prefix.
 */

export const W = 1920;
export const H = 1080;
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Deterministic pseudo-random so every render paints the same picture.
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 0→1→0 bump over [from, from + length]. */
export const pulse = (f: number, from: number, length: number) =>
  Math.sin(interpolate(f, [from, from + length], [0, 1], clamp) * Math.PI);

export const ease = (f: number, range: [number, number], out: [number, number]) =>
  interpolate(f, range, out, { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });

type Camera = { x?: number; y?: number; s?: number };

/**
 * One painted shot. The camera travels from `from` to `to`, then settles into a
 * still hold for the last `hold` frames — the quiet beat before the cut.
 */
export const PaintedShot = ({
  start = 0,
  duration,
  from = {},
  to = {},
  hold = 45,
  label,
  children,
}: {
  start?: number;
  duration: number;
  from?: Camera;
  to?: Camera;
  hold?: number;
  label: string;
  children: (f: number, travel: number, frame: number) => ReactNode;
}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const travel = ease(f, [0, Math.max(1, duration - hold)], [0, 1]);
  const lerp = (a = 0, b = 0) => a + (b - a) * travel;
  const s = lerp(from.s ?? 1.02, to.s ?? 1.05);
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: start > 0 ? interpolate(frame, [start, start + 24], [0, 1], clamp) : 1,
      }}
    >
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{
          transform: `scale(${s}) translate(${lerp(from.x, to.x)}px, ${lerp(from.y, to.y)}px)`,
          transformOrigin: "50% 50%",
        }}
      >
        <PaintDefs frame={frame} />
        {children(f, travel, frame)}
        <PaperOverlay />
      </svg>
    </AbsoluteFill>
  );
};

export const PaintDefs = ({ frame }: { frame: number }) => (
  <defs>
    {/* Wobbly, brush-painted edges. */}
    <filter id="brush" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={4} />
      <feDisplacementMap in="SourceGraphic" scale={14} />
    </filter>
    <filter id="brush-fine" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={7} />
      <feDisplacementMap in="SourceGraphic" scale={5} />
    </filter>
    {/* Hand-drawn effects animation holds drawings on threes: the water boils on threes. */}
    <filter id="water" x="0" y="-10%" width="100%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.004 0.06"
        numOctaves={2}
        seed={(Math.floor(frame / 3) % 6) + 1}
      />
      <feDisplacementMap in="SourceGraphic" scale={22} />
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={10} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={14} />
    </filter>
    {/* Out-of-focus depth for things scaled up several times. */}
    <filter id="defocus" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={2.6} />
    </filter>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={9} />
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.55 0" />
    </filter>
    <filter id="wash">
      <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={4} seed={2} />
      <feColorMatrix values="0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0.35 0" />
    </filter>
    <radialGradient id="warmGlow">
      <stop offset="0" stopColor="#ffd27a" stopOpacity={0.75} />
      <stop offset="0.35" stopColor="#ff9f4a" stopOpacity={0.28} />
      <stop offset="1" stopColor="#ff9f4a" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="goldGlow">
      <stop offset="0" stopColor="#fff0b8" stopOpacity={0.95} />
      <stop offset="0.3" stopColor="#ffd36e" stopOpacity={0.4} />
      <stop offset="1" stopColor="#ffd36e" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="moonGlow">
      <stop offset="0" stopColor="#fff6dc" stopOpacity={0.9} />
      <stop offset="0.2" stopColor="#dbe8f5" stopOpacity={0.35} />
      <stop offset="1" stopColor="#dbe8f5" stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** Paper and pigment grain laid over the whole painting. */
export const PaperOverlay = () => (
  <>
    <rect width={W} height={H} filter="url(#wash)" style={{ mixBlendMode: "soft-light" }} />
    <rect
      width={W}
      height={H}
      filter="url(#paper)"
      opacity={0.22}
      style={{ mixBlendMode: "multiply" }}
    />
  </>
);

export type Puff = readonly [number, number, number];
export type Palette = { shadow: string; mid: string; light: string; rim?: string };
export const MOONLIT: Palette = {
  shadow: "#5d7499",
  mid: "#9fb3cf",
  light: "#e4ebf2",
  rim: "#f2c98f",
};
export const FOLIAGE: Palette = {
  shadow: "#1d3a2e",
  mid: "#2f5a3e",
  light: "#4f7f4f",
  rim: "#a7c98a",
};

/** Cel-shaded cumulus (or a leaf mass): shaded underside, lit top clipped to the shape. */
export const Cloud = ({
  id,
  puffs,
  palette = MOONLIT,
}: {
  id: string;
  puffs: readonly Puff[];
  palette?: Palette;
}) => (
  <g filter="url(#brush)">
    <clipPath id={id}>
      {puffs.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </clipPath>
    {puffs.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={palette.shadow} />
    ))}
    <g clipPath={`url(#${id})`}>
      {puffs.map(([x, y, r], i) => (
        <circle key={i} cx={x - r * 0.16} cy={y - r * 0.28} r={r * 0.92} fill={palette.mid} />
      ))}
      {puffs.map(([x, y, r], i) => (
        <circle key={i} cx={x - r * 0.3} cy={y - r * 0.5} r={r * 0.7} fill={palette.light} />
      ))}
      {palette.rim && (
        <rect x={-500} y={40} width={1000} height={260} fill={palette.rim} opacity={0.18} />
      )}
    </g>
  </g>
);

/** A random cumulus of `n` puffs, roughly `w` wide. */
export const puffsFor = (seed: number, n: number, w: number): Puff[] =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const middle = 1 - Math.abs(t - 0.5) * 2;
    return [
      (t - 0.5) * w + (rand(seed + i) - 0.5) * 30,
      -middle * w * 0.12 + rand(seed + i + 40) * 30,
      w * (0.1 + middle * 0.12) * (0.8 + rand(seed + i + 80) * 0.4),
    ] as const;
  });

export const Stars = ({
  f,
  count = 140,
  maxY,
  seed = 0,
  x = 0,
}: {
  f: number;
  count?: number;
  maxY: number;
  seed?: number;
  x?: number;
}) => (
  <g transform={`translate(${x} 0)`}>
    {Array.from({ length: count }, (_, i) => {
      const k = i + seed * 1000;
      const big = rand(k + 77) > 0.9;
      return (
        <circle
          key={i}
          cx={rand(k) * (W + 200) - 100}
          cy={Math.pow(rand(k + 500), 1.4) * maxY}
          r={big ? 2.6 : 1.3}
          fill={big ? "#fff1c4" : "#e6f0ff"}
          opacity={0.35 + 0.65 * Math.abs(Math.sin(f / (18 + rand(k + 9) * 30) + i))}
        />
      );
    })}
  </g>
);

export const Moon = ({ x, y, r = 46 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 5.6} fill="url(#moonGlow)" />
    <circle cx={x} cy={y} r={r} fill="#fff4d6" />
    <circle cx={x + r * 0.35} cy={y - r * 0.2} r={r * 0.9} fill="#fbe6b6" opacity={0.6} />
  </g>
);

/** The castle, its base at the origin, about 520 wide and 330 tall. */
export const Castle = ({ shade = 0 }: { shade?: number }) => (
  <g opacity={1 - shade}>
    <path d="M-260,0 C-200,-30 -120,-46 -40,-50 C60,-52 170,-36 260,0 Z" fill="#3b4f73" />
    {CASTLE_TOWERS.map(([x, top, w], i) => (
      <g key={i}>
        <rect x={x - w / 2} y={top} width={w} height={-top - 40} fill="#536a91" />
        <rect x={x - w / 2} y={top} width={w * 0.38} height={-top - 40} fill="#6a82a8" />
        <path
          d={`M${x - w / 2 - 6},${top} L${x},${top - w * 1.5} L${x + w / 2 + 6},${top} Z`}
          fill="#2c3b5c"
        />
      </g>
    ))}
    <rect x={-160} y={-95} width={330} height={60} fill="#4a5f86" />
  </g>
);
const CASTLE_TOWERS = [
  [-120, -130, 46],
  [-55, -190, 40],
  [10, -250, 50],
  [80, -175, 40],
  [140, -120, 36],
] as const;
export const CASTLE_WINDOWS = [
  [-128, -105],
  [-112, -78],
  [-60, -160],
  [-50, -120],
  [4, -220],
  [16, -180],
  [10, -130],
  [74, -150],
  [86, -110],
  [136, -95],
  [-30, -70],
  [40, -70],
  [100, -66],
] as const;

export const CastleWindows = ({ f, lit = 1 }: { f: number; lit?: number }) => (
  <>
    {CASTLE_WINDOWS.map(([x, y], i) => (
      <rect
        key={i}
        x={x - 3}
        y={y}
        width={6}
        height={9}
        rx={2}
        fill="#ffd57a"
        opacity={(0.6 + 0.4 * Math.abs(Math.sin(f / 25 + i * 1.7))) * lit}
      />
    ))}
  </>
);

const INK = "#3a2b2e";
const SKIN = "#f6d9c1";
const HAIR = "#2a2231";
const PAJAMA = "#f1e7d3";
const PAJAMA_SHADE = "#d6c8ad";
const SHAWL = "#b05a49";
const SHAWL_SHADE = "#8c4337";

export type Eyes = "content" | "asleep" | "peek" | "open";

/** Mimi's head, centred on her face. */
export const GirlHead = ({
  eyes = "content",
  mouth = "smile",
  blink = false,
}: {
  eyes?: Eyes;
  mouth?: "smile" | "o" | "soft";
  blink?: boolean;
}) => {
  const shut = eyes === "content" || eyes === "asleep" || blink;
  return (
    <g stroke={INK} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx={0} cy={0} rx={34} ry={36} fill={SKIN} />
      <path
        d="M-34,6 C-44,-40 -8,-52 12,-46 C42,-40 48,-12 36,26 C34,10 30,-4 24,-12 C10,-10 -16,-10 -32,-2 C-32,10 -30,20 -28,28 C-38,24 -38,14 -34,6 Z"
        fill={HAIR}
      />
      <path d="M-12,-40 C0,-46 18,-44 30,-34" fill="none" stroke="#5a5070" strokeWidth={3} />
      {shut ? (
        <>
          <path d={eyes === "asleep" ? "M-22,6 q5,3 10,0" : "M-22,6 q5,4 10,0"} fill="none" strokeWidth={2.4} />
          <path d={eyes === "asleep" ? "M2,6 q5,3 10,0" : "M2,6 q5,4 10,0"} fill="none" strokeWidth={2.4} />
        </>
      ) : eyes === "peek" ? (
        <>
          <path d="M-22,6 q5,3 10,0" fill="none" strokeWidth={2.4} />
          <ellipse cx={7} cy={5} rx={4} ry={1.8} fill={INK} stroke="none" />
          <path d="M2,4 q5,-2 10,0" fill="none" strokeWidth={2} />
        </>
      ) : (
        <>
          <ellipse cx={-17} cy={4} rx={3.8} ry={5.2} fill={INK} stroke="none" />
          <ellipse cx={7} cy={4} rx={3.8} ry={5.2} fill={INK} stroke="none" />
          <circle cx={-16} cy={2} r={1.3} fill="#fff" stroke="none" />
          <circle cx={8} cy={2} r={1.3} fill="#fff" stroke="none" />
          <path d="M-23,-6 q6,-3 11,0 M1,-6 q6,-3 11,0" fill="none" strokeWidth={1.8} />
        </>
      )}
      {mouth === "o" ? (
        <ellipse cx={-4} cy={20} rx={3.6} ry={4.2} fill="#a8564e" strokeWidth={1.6} />
      ) : mouth === "soft" ? (
        <path d="M-8,20 q4,1 8,0" fill="none" strokeWidth={2} />
      ) : (
        <path d="M-10,19 q4,4 9,0" fill="none" strokeWidth={2} />
      )}
      <ellipse cx={-24} cy={16} rx={6} ry={3.5} fill="#f0a49a" stroke="none" opacity={0.7} />
      <ellipse cx={18} cy={16} rx={6} ry={3.5} fill="#f0a49a" stroke="none" opacity={0.7} />
    </g>
  );
};

/** Mimi sitting with her arms around her knees, wrapped in her shawl; origin at her seat. */
export const GirlSitting = ({
  f,
  eyes = "content",
  mouth,
  lookUp = 0,
}: {
  f: number;
  eyes?: Eyes;
  mouth?: "smile" | "o" | "soft";
  lookUp?: number;
}) => (
  <g stroke={INK} strokeWidth={2.6} strokeLinejoin="round">
    <path d="M-70,-40 C-80,-70 -60,-88 -30,-86 L20,-70 L30,-40 Z" fill={PAJAMA} />
    <path d="M-62,-44 C-64,-62 -52,-74 -34,-74" fill="none" stroke="#c9bba1" />
    <path d="M-20,-40 C-36,-110 -16,-150 14,-152 C46,-152 66,-112 58,-40 Z" fill={SHAWL} />
    <path
      d="M24,-150 C50,-140 64,-108 58,-40 L30,-40 C38,-90 36,-128 24,-150 Z"
      fill={SHAWL_SHADE}
      stroke="none"
    />
    <path
      d="M-12,-112 C-40,-100 -60,-86 -64,-72 C-56,-66 -44,-70 -36,-80 C-26,-92 -10,-100 4,-104"
      fill={SHAWL}
    />
    <circle cx={-62} cy={-74} r={8} fill={SKIN} />
    <g transform={`translate(10 -186) rotate(${Math.sin(f / 30) * 1.5 - lookUp * 8})`}>
      <GirlHead eyes={eyes} mouth={mouth} blink={eyes === "open" && f % 110 < 4} />
    </g>
  </g>
);

/** Mimi sitting up in bed (the quilt is drawn by the bedroom); origin at her waist. */
export const GirlUpright = ({
  f,
  eyes = "open",
  mouth = "smile",
  book = false,
  lean = 0,
}: {
  f: number;
  eyes?: Eyes;
  mouth?: "smile" | "o" | "soft";
  book?: boolean;
  lean?: number;
}) => (
  <g stroke={INK} strokeWidth={2.6} strokeLinejoin="round" transform={`rotate(${lean})`}>
    <path d="M-52,10 C-60,-60 -40,-118 0,-122 C40,-118 60,-60 52,10 Z" fill={PAJAMA} />
    <path d="M10,-120 C40,-112 58,-60 52,10 L24,10 C30,-50 26,-96 10,-120 Z" fill={PAJAMA_SHADE} stroke="none" />
    <path d="M-16,-118 L0,-100 L16,-118" fill="none" stroke="#b8a888" strokeWidth={2} />
    {book ? (
      <>
        <path d="M-46,-70 C-60,-40 -50,-10 -20,-6" fill={PAJAMA} />
        <path d="M46,-70 C60,-40 50,-10 20,-6" fill={PAJAMA} />
      </>
    ) : (
      <>
        <path d="M-46,-74 C-66,-40 -60,-8 -36,-2" fill={PAJAMA} />
        <path d="M46,-74 C66,-40 60,-8 36,-2" fill={PAJAMA} />
        <circle cx={-34} cy={-2} r={8} fill={SKIN} />
        <circle cx={34} cy={-2} r={8} fill={SKIN} />
      </>
    )}
    <g transform={`translate(0 -156) rotate(${Math.sin(f / 34) * 2})`}>
      <GirlHead eyes={eyes} mouth={mouth} blink={eyes === "open" && f % 120 < 4} />
    </g>
  </g>
);

export type FairyPose = "fly" | "stand" | "sad" | "sit";

/** The little fairy, origin at its feet. */
export const Fairy = ({
  f,
  pose = "fly",
  holding,
  glow = 0,
}: {
  f: number;
  pose?: FairyPose;
  holding?: "bottle" | "flower" | "emptyBottle";
  glow?: number;
}) => {
  const flying = pose === "fly";
  const flap = flying
    ? 0.55 + 0.45 * Math.abs(Math.sin(f / 3.2))
    : 0.85 + 0.15 * Math.sin(f / 20);
  const hover = flying ? Math.sin(f / 18) * 6 : 0;
  const droop = pose === "sad" ? 1 : 0;
  return (
    <g transform={`translate(0 ${hover})`} stroke="#2f3a2a" strokeWidth={2}>
      <g transform={`rotate(${droop * 18}) scale(${flap} 1)`} opacity={0.75}>
        <ellipse cx={-16} cy={-30} rx={18} ry={26} fill="#e9f3ff" transform="rotate(-25 -16 -30)" />
        <ellipse cx={16} cy={-30} rx={18} ry={26} fill="#e9f3ff" transform="rotate(25 16 -30)" />
      </g>
      {pose === "sit" ? (
        <path d="M-11,-6 L-8,-34 L8,-34 L11,-6 L20,0 L-4,2 Z" fill="#5f7d45" />
      ) : (
        <path d="M-11,0 L-8,-34 L8,-34 L11,0 Z" fill="#5f7d45" />
      )}
      <g transform={`translate(0 ${droop * 4}) rotate(${droop * 16} 0 -40)`}>
        <circle cx={0} cy={-44} r={11} fill="#f6dcc6" />
        <path
          d="M-13,-48 C-10,-64 8,-72 20,-62 C24,-58 22,-52 16,-54 C10,-60 2,-58 -2,-52 Z"
          fill="#4c6838"
        />
        {droop ? (
          <path d="M-6,-42 q2,1.5 4,0 M2,-42 q2,1.5 4,0" fill="none" strokeWidth={1.4} />
        ) : (
          <>
            <circle cx={-4} cy={-44} r={1.6} fill="#2f2a2a" stroke="none" />
            <circle cx={4} cy={-44} r={1.6} fill="#2f2a2a" stroke="none" />
          </>
        )}
      </g>
      {holding === "flower" && (
        <g transform="translate(14 -20)">
          <path d="M0,0 C2,-10 0,-18 4,-26" fill="none" stroke="#4c6838" strokeWidth={2} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={4} cy={-32} rx={3.4} ry={6} fill="#f7c6d4" strokeWidth={1.2} transform={`rotate(${a} 4 -28)`} />
          ))}
          <circle cx={4} cy={-28} r={2.6} fill="#ffd36e" strokeWidth={1} />
        </g>
      )}
      {(holding === "bottle" || holding === "emptyBottle") && (
        <g transform="translate(18 -12) scale(0.55)">
          <DreamBottle f={f} glow={holding === "bottle" ? Math.max(glow, 0.5) : glow} />
        </g>
      )}
    </g>
  );
};

/** The fairy curled up asleep; origin at the middle of its body. */
export const FairyAsleep = ({ f }: { f: number }) => {
  const breath = 1 + Math.sin(f / 26) * 0.025;
  return (
    <g stroke="#2f3a2a" strokeWidth={2} strokeLinejoin="round">
      <g opacity={0.7}>
        <ellipse cx={8} cy={-30} rx={34} ry={14} fill="#e9f3ff" transform="rotate(-18 8 -30)" />
        <ellipse cx={20} cy={-22} rx={28} ry={11} fill="#dbeafa" transform="rotate(-8 20 -22)" />
      </g>
      <g transform={`scale(1 ${breath})`}>
        <path d="M-30,0 C-34,-20 -10,-30 14,-26 C34,-22 40,-6 32,6 C10,12 -20,12 -30,0 Z" fill="#5f7d45" />
        <path d="M30,4 C40,8 46,4 48,-2" fill="none" />
      </g>
      <circle cx={-38} cy={-12} r={12} fill="#f6dcc6" />
      <path d="M-48,-16 C-46,-32 -28,-36 -22,-26 C-26,-22 -34,-24 -40,-14 Z" fill="#4c6838" />
      <path d="M-44,-10 q3,2 6,0" fill="none" strokeWidth={1.4} />
      <ellipse cx={-46} cy={-4} rx={3} ry={1.8} fill="#f0a49a" stroke="none" />
      <path d="M-30,-2 C-34,4 -40,6 -46,4" fill="none" stroke="#2f3a2a" />
    </g>
  );
};

/** Glass bottle of dream light; origin at its base. */
export const DreamBottle = ({
  f,
  glow = 1,
  phase = 0,
  children,
}: {
  f: number;
  glow?: number;
  phase?: number;
  children?: ReactNode;
}) => {
  const breathe = glow * (0.82 + 0.18 * Math.sin(f / 16 + phase));
  return (
    <g>
      {glow > 0 && <circle cx={0} cy={-34} r={80} fill="url(#goldGlow)" opacity={breathe} />}
      <g stroke="#3d4a5c" strokeWidth={2.2} strokeLinejoin="round">
        <path
          d="M-10,-70 L-10,-58 C-28,-50 -32,-30 -30,-12 C-28,0 -20,2 0,2 C20,2 28,0 30,-12 C32,-30 28,-50 10,-58 L10,-70 Z"
          fill="#c8dbea"
          fillOpacity={0.35}
        />
        <path
          d="M-26,-30 C-26,-10 -18,-2 0,-2 C18,-2 26,-10 26,-30 Z"
          fill="#ffd36e"
          stroke="none"
          opacity={0.2 + 0.8 * breathe}
        />
        {children}
        <rect x={-12} y={-80} width={24} height={12} rx={3} fill="#a7764a" />
        <path d="M-20,-44 C-22,-30 -20,-18 -14,-10" fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.6} />
      </g>
    </g>
  );
};

export const LittleSun = ({ f }: { f: number }) => (
  <g transform={`scale(${1 + Math.sin(f / 14) * 0.05})`} stroke="#8a4b16" strokeWidth={2.4}>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + f / 90;
      return (
        <path
          key={i}
          d={`M${Math.cos(a) * 30},${Math.sin(a) * 30} L${Math.cos(a) * 42},${Math.sin(a) * 42}`}
          stroke="#ffcf6a"
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
    })}
    <circle r={27} fill="#ffb64d" />
    <path d="M10,-20 A27,27 0 0 1 10,20 A20,20 0 0 0 10,-20 Z" fill="#f4943a" stroke="none" />
    <circle cx={-8} cy={-4} r={2.6} fill="#5a2c0c" stroke="none" />
    <circle cx={6} cy={-4} r={2.6} fill="#5a2c0c" stroke="none" />
    <path d="M-6,6 q5,4 10,0" fill="none" strokeWidth={2} />
  </g>
);

/** The glowing whale of a dream, facing left; about 390 wide. */
export const Whale = ({ color = "#bfe3ff" }: { color?: string }) => (
  <g filter="url(#glow)">
    <path
      d="M-150,0 C-140,-46 -60,-66 20,-58 C90,-50 140,-22 170,-4 C195,-18 210,-40 236,-46 C232,-24 222,-8 214,4 C226,16 236,34 236,52 C210,40 192,24 172,14 C130,40 60,56 -10,52 C-90,48 -150,34 -150,0 Z"
      fill={color}
      opacity={0.82}
    />
    <path d="M-140,14 C-80,40 20,46 120,26" fill="none" stroke="#f8e6b0" strokeWidth={3} opacity={0.7} />
    <circle cx={-100} cy={-12} r={5} fill="#304a75" />
  </g>
);

/** A candy castle made of light — one of the dreams the fairy collects. */
export const CandyCastle = () => (
  <g filter="url(#glow)" fill="#ffe3a6" stroke="#fff6d8" strokeWidth={2}>
    <rect x={-40} y={-50} width={80} height={50} rx={6} />
    <rect x={-56} y={-80} width={26} height={80} rx={6} />
    <rect x={30} y={-80} width={26} height={80} rx={6} />
    <path d="M-60,-80 L-43,-112 L-26,-80 Z M26,-80 L43,-112 L60,-80 Z M-24,-50 L0,-92 L24,-50 Z" />
    <circle cx={0} cy={-20} r={9} fill="#f7c6d4" />
  </g>
);

/** Fern frond that sways with the wind; origin at its root. */
export const Fern = ({
  length = 220,
  bend = 0,
  color = "#2d5a3a",
  light = "#4f7f4f",
}: {
  length?: number;
  bend?: number;
  color?: string;
  light?: string;
}) => {
  const tip = { x: length * 0.55 + bend * 40, y: -length };
  const point = (t: number) => ({
    x: tip.x * t * t + bend * 20 * t,
    y: tip.y * t,
  });
  return (
    <g>
      <path
        d={`M0,0 Q${bend * 30},${-length * 0.6} ${tip.x},${tip.y}`}
        fill="none"
        stroke={color}
        strokeWidth={4}
      />
      {Array.from({ length: 14 }, (_, i) => {
        const t = (i + 1) / 15;
        const p = point(t);
        const s = (1 - t) * 34 + 8;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <ellipse cx={-s * 0.7} cy={-s * 0.2} rx={s * 0.75} ry={s * 0.2} fill={i % 2 ? color : light} transform="rotate(-25)" />
            <ellipse cx={s * 0.7} cy={-s * 0.2} rx={s * 0.75} ry={s * 0.2} fill={i % 2 ? light : color} transform="rotate(25)" />
          </g>
        );
      })}
    </g>
  );
};

/** Gentle constant breeze plus a gust bump. */
export const breeze = (f: number, gust = 0) =>
  Math.sin(f / 38) * 0.6 + Math.sin(f / 17 + 1.3) * 0.25 + gust * 2.2;

/** Points along a quadratic bezier — used for streams of dream light. */
export const qpoint = (
  a: readonly [number, number],
  c: readonly [number, number],
  b: readonly [number, number],
  t: number,
) => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
] as const;

/** Gold motes flowing from a to b through control c, active while 0 < t < 1. */
export const DreamStream = ({
  a,
  c,
  b,
  t,
  count = 18,
  seed = 0,
}: {
  a: readonly [number, number];
  c: readonly [number, number];
  b: readonly [number, number];
  t: number;
  count?: number;
  seed?: number;
}) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const lag = (i / count) * 0.45;
      const u = (t - lag) / 0.55;
      if (u <= 0 || u >= 1) return null;
      const [x, y] = qpoint(a, c, b, u);
      const r = 2 + rand(seed + i) * 4;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={r * 4} fill="url(#goldGlow)" opacity={0.6} />
          <circle cx={x} cy={y} r={r} fill="#fff0b8" opacity={Math.sin(u * Math.PI)} />
        </g>
      );
    })}
  </g>
);

/** Petals and glints carried across the frame by a gust; `gust` runs 0→1. */
export const GustPetals = ({
  gust,
  count = 34,
  top = 380,
  band = 520,
  colors = ["#fff3c2", "#f7cfd0", "#d9f0ff"],
}: {
  gust: number;
  count?: number;
  top?: number;
  band?: number;
  colors?: readonly string[];
}) =>
  gust <= 0 || gust >= 1 ? null : (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const t = (gust - rand(i + 300) * 0.35) / 0.65;
        if (t <= 0 || t >= 1) return null;
        const x = -80 + t * (W + 200);
        const y = top + rand(i + 400) * band + Math.sin(t * 9 + i) * 40;
        const spin = t * 720 * (rand(i + 500) > 0.5 ? 1 : -1);
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={7}
            ry={3.2}
            fill={colors[i % colors.length]}
            opacity={Math.sin(t * Math.PI) * 0.9}
            transform={`rotate(${spin} ${x} ${y})`}
          />
        );
      })}
    </g>
  );

/** Warm dust or fireflies drifting in place. */
export const Motes = ({
  f,
  count = 26,
  box: [x0, y0, w, h],
  seed = 0,
  color = "#ffe2a2",
}: {
  f: number;
  count?: number;
  box: readonly [number, number, number, number];
  seed?: number;
  color?: string;
}) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const k = i + seed * 100;
      return (
        <circle
          key={i}
          cx={x0 + rand(k) * w + Math.sin(f / 80 + i) * 17}
          cy={y0 + rand(k + 50) * h - Math.sin(f / 100 + i) * 23}
          r={rand(k + 20) > 0.8 ? 2.8 : 1.5}
          fill={color}
          opacity={0.12 + 0.6 * Math.sin(f / 50 + i) ** 2}
        />
      );
    })}
  </g>
);
