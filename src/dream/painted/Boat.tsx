import { interpolate } from "remotion";
import {
  Castle,
  CastleWindows,
  Cloud,
  Fairy,
  GirlSitting,
  GustPetals,
  LittleSun,
  Moon,
  PaintedShot,
  type Puff,
  Stars,
  W,
  Whale,
  clamp,
  pulse,
  rand,
} from "./kit";

/**
 * The star-sea boat: layers drift at their own depth (multiplane parallax), the water
 * boils on threes, a gust crosses mid-shot and the camera settles before the cut.
 */

const HORIZON = 560;

const CLOUDS: { x: number; y: number; s: number; puffs: Puff[]; depth: number }[] = [
  {
    x: 380,
    y: 300,
    s: 1.25,
    depth: 0.18,
    puffs: [
      [-230, 40, 70],
      [-150, 0, 100],
      [-40, -40, 130],
      [80, -10, 110],
      [190, 30, 80],
      [-90, 60, 90],
      [60, 60, 90],
      [260, 60, 55],
    ],
  },
  {
    x: 1500,
    y: 250,
    s: 1,
    depth: 0.12,
    puffs: [
      [-200, 50, 60],
      [-110, 10, 90],
      [0, -50, 120],
      [120, -20, 100],
      [220, 40, 70],
      [-30, 60, 80],
      [110, 65, 70],
    ],
  },
  {
    x: 980,
    y: 470,
    s: 0.7,
    depth: 0.25,
    puffs: [
      [-160, 20, 50],
      [-70, -10, 75],
      [30, -30, 90],
      [130, 0, 70],
      [210, 30, 45],
      [-10, 35, 60],
    ],
  },
];

const LeafBoat = () => (
  <g stroke="#23361f" strokeWidth={3} strokeLinejoin="round">
    <path
      d="M-290,-24 C-210,66 140,86 252,-6 C284,-34 300,-86 270,-124 C262,-92 236,-58 200,-46 C80,-12 -120,-14 -290,-24 Z"
      fill="#4f8a3c"
    />
    <path d="M-280,-26 C-110,-16 80,-14 200,-46 C120,-70 -110,-66 -280,-26 Z" fill="#8fc062" />
    <path
      d="M-250,-8 C-120,40 120,48 236,-14 L248,-2 C130,66 -140,58 -270,-16 Z"
      fill="#3c6e2e"
      stroke="none"
    />
    <path d="M-285,-24 Q0,40 258,-30" fill="none" stroke="#b9dc8a" strokeWidth={2} />
    {[-180, -80, 30, 140].map((x) => (
      <path
        key={x}
        d={`M${x},${12 + Math.abs(x) * 0.02} q30,-12 50,-34`}
        fill="none"
        stroke="#b9dc8a"
        strokeWidth={1.6}
      />
    ))}
  </g>
);

/** The leaf boat with Mimi, the fairy and the little sun; origin at the waterline. */
export const BoatParty = ({ f, gust = 0 }: { f: number; gust?: number }) => (
  <g transform={`translate(0 ${Math.sin(f / 36) * 6}) rotate(${Math.sin(f / 44) * 1.4 + gust * 2.5})`}>
    <LeafBoat />
    <g transform="translate(40 0)">
      <GirlSitting f={f} />
    </g>
    <g transform={`translate(${150 + gust * 6} -52)`}>
      <Fairy f={f} />
    </g>
    <g transform="translate(-238 -66)">
      <circle r={140} fill="url(#warmGlow)" opacity={0.85 + Math.sin(f / 14) * 0.15} />
      <LittleSun f={f} />
    </g>
  </g>
);

export const PaintedBoat = ({
  duration,
  start = 0,
  label = "叶子船载着米米、妖精和小太阳，驶过星星做的海",
}: {
  duration: number;
  start?: number;
  label?: string;
}) => (
  <PaintedShot
    start={start}
    duration={duration}
    label={label}
    from={{ s: 1.02, x: 20, y: 10 }}
    to={{ s: 1.05, x: -20, y: -10 }}
  >
    {(f, travel) => {
      const pan = (depth: number) => -110 * depth * travel;
      const gustStart = duration * 0.38;
      const gust = interpolate(f, [gustStart, gustStart + 90], [0, 1], clamp);
      const gustStrength = pulse(f, gustStart, 90);
      const drift = (depth: number) => f * depth * 0.35 + gustStrength * 40 * depth;
      return (
        <>
          <defs>
            <linearGradient id="boat-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#101b44" />
              <stop offset="0.5" stopColor="#24457a" />
              <stop offset="0.85" stopColor="#3d7392" />
              <stop offset="1" stopColor="#a9a68e" />
            </linearGradient>
            <linearGradient id="boat-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a6a89" />
              <stop offset="0.3" stopColor="#21436c" />
              <stop offset="1" stopColor="#0b1733" />
            </linearGradient>
          </defs>
          <rect width={W} height={HORIZON + 4} fill="url(#boat-sky)" />
          <g transform={`translate(${pan(0.08)} 0)`}>
            <Moon x={560} y={150} />
            <Stars f={f} maxY={HORIZON - 40} />
          </g>
          {CLOUDS.map((c, i) => (
            <g
              key={i}
              transform={`translate(${c.x + drift(c.depth) + pan(c.depth)} ${c.y}) scale(${c.s})`}
            >
              <Cloud id={`boat-cloud-${i}`} puffs={c.puffs} />
            </g>
          ))}
          <g transform={`translate(${1460 + pan(0.3)} ${HORIZON + 4})`}>
            <g filter="url(#brush)">
              <Castle />
            </g>
            <CastleWindows f={f} />
          </g>
          <rect y={HORIZON - 30} width={W} height={60} fill="#c6d4dd" opacity={0.18} filter="url(#brush)" />
          <g
            transform={`translate(${interpolate(f, [0, duration], [1900, 820]) + pan(0.15)} ${395 + Math.sin(f / 40) * 14}) scale(0.55) rotate(${Math.sin(f / 40) * -3})`}
          >
            <Whale />
          </g>

          <rect y={HORIZON} width={W} height={1080 - HORIZON} fill="url(#boat-sea)" />
          <g filter="url(#water)">
            <g transform={`translate(${1460 + pan(0.3)} ${HORIZON + 4}) scale(1 -0.7)`} opacity={0.3}>
              <Castle />
            </g>
            {Array.from({ length: 34 }, (_, i) => {
              const w = 30 + rand(i + 30) * 110 + i * 3;
              return (
                <rect
                  key={i}
                  x={560 + pan(0.08) - w / 2 + Math.sin(f / 22 + i) * 12}
                  y={HORIZON + 10 + i * 15}
                  width={w}
                  height={3 + i * 0.12}
                  rx={2}
                  fill="#f6e7c0"
                  opacity={(0.55 - i * 0.012) * (1 + gustStrength * 0.4)}
                />
              );
            })}
            {Array.from({ length: 60 }, (_, i) => (
              <rect
                key={i}
                x={rand(i + 900) * W + pan(0.5)}
                y={HORIZON + 20 + rand(i + 950) * 480}
                width={8 + rand(i + 990) * 22}
                height={2}
                fill="#d8e8ff"
                opacity={0.15 + 0.45 * Math.abs(Math.sin(f / 20 + i))}
              />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <path
                key={i}
                d={`M${-100 + ((i * 331) % W) + pan(0.6)},${HORIZON + 60 + i * 34} q120,-6 260,0`}
                stroke="#6d9cbd"
                strokeWidth={2 + i * 0.25}
                fill="none"
                opacity={0.35}
              />
            ))}
          </g>

          <g transform={`translate(${1180 + pan(1)} 760)`}>
            <ellipse cx={-230} cy={30} rx={360} ry={70} fill="url(#warmGlow)" />
            <ellipse cx={0} cy={22} rx={300} ry={26} fill="#0a1429" opacity={0.45} />
            {[0, 1, 2].map((k) => {
              const t = (((f / 70 + k / 3) % 1) + 1) % 1;
              return (
                <ellipse
                  key={k}
                  cx={0}
                  cy={18}
                  rx={300 + t * 220}
                  ry={22 + t * 26}
                  fill="none"
                  stroke="#cfe3f2"
                  strokeWidth={2.2}
                  opacity={0.45 * (1 - t)}
                />
              );
            })}
            <g transform="scale(1.15)">
              <BoatParty f={f} gust={gustStrength} />
            </g>
          </g>
          <GustPetals gust={gust} />
        </>
      );
    }}
  </PaintedShot>
);
