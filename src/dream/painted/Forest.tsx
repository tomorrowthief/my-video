import { interpolate } from "remotion";
import {
  Cloud,
  DreamBottle,
  FOLIAGE,
  Fairy,
  Fern,
  GirlSitting,
  Motes,
  PaintedShot,
  W,
  breeze,
  clamp,
  ease,
  puffsFor,
  qpoint,
  rand,
} from "./kit";

/**
 * The moonlit wood where the fairy keeps the dreams: bottles hang glowing from the
 * great oak's branches, and among the roots is its own little bed, the one dark place.
 * `secret`: the camera tilts from the bottles down to the empty bed.
 * `together`: Mimi sits down beside the fairy.
 */

type Mode = "secret" | "together";

const BRANCHES = [
  { a: [640, 190], c: [1300, 270], b: [1980, 110], t: [0.18, 0.3, 0.42, 0.53, 0.64, 0.75, 0.86, 0.95] },
  { a: [660, 330], c: [1050, 430], b: [1560, 370], t: [0.25, 0.42, 0.58, 0.74, 0.9] },
  { a: [430, 250], c: [200, 300], b: [-40, 210], t: [0.35, 0.6, 0.85] },
] as const;

const BED = [850, 884] as const;

const Trunks = ({ depth, color, n, seed, pan }: { depth: number; color: string; n: number; seed: number; pan: number }) => (
  <g transform={`translate(${pan * depth} 0)`} filter="url(#brush)">
    {Array.from({ length: n }, (_, i) => {
      const x = rand(seed + i) * (W + 200) - 100;
      const w = 30 + rand(seed + i + 20) * 60 * (1 + depth);
      return <path key={i} d={`M${x},-20 C${x + 10},300 ${x - 8},600 ${x - w * 0.3},840 L${x + w * 1.3},840 C${x + w + 8},600 ${x + w - 10},300 ${x + w},-20 Z`} fill={color} />;
    })}
  </g>
);

const Oak = () => (
  <g stroke="#1e1712" strokeWidth={3} strokeLinejoin="round">
    {/* Roots spreading over the moss */}
    <path d="M380,880 C300,900 180,930 60,990 L110,1000 C220,960 330,940 420,920 Z" fill="#4a3a30" />
    <path d="M700,880 C820,900 960,930 1060,980 L1010,996 C900,958 790,940 690,924 Z" fill="#4a3a30" />
    <path d="M560,900 C560,960 540,1010 500,1080 L590,1080 C610,1010 620,960 640,910 Z" fill="#3f3128" />
    {/* Trunk, lit from the moon on the right */}
    <path d="M370,910 C420,720 450,420 420,-20 L720,-20 C690,420 700,720 770,910 Z" fill="#4a3a30" />
    <path d="M620,-20 L720,-20 C690,420 700,720 770,910 L690,910 C650,720 640,420 620,-20 Z" fill="#6b5640" stroke="none" />
    {/* The hollow where the fairy lives */}
    <path d="M520,700 C510,620 600,600 620,690 C630,760 600,820 560,820 C530,820 516,770 520,700 Z" fill="#1a120e" />
    {/* Bark strokes */}
    {[440, 480, 530, 580, 640, 690].map((x, i) => (
      <path key={x} d={`M${x},${40 + i * 30} C${x + 8},300 ${x - 6},520 ${x + 10 + i * 4},${860 - i * 20}`} fill="none" stroke="#2c221b" strokeWidth={3} opacity={0.7} />
    ))}
    {/* Branches, tapering toward their tips */}
    <g filter="url(#brush)">
      <path d="M640,210 C900,232 1300,230 1980,96 L1980,112 C1300,262 900,282 640,300 Z" fill="#3e3028" />
      <path d="M660,340 C900,390 1200,410 1600,362 C1400,400 1100,440 660,410 Z" fill="#3e3028" />
      <path d="M450,230 C300,268 150,270 -40,196 L-40,210 C150,300 300,312 450,300 Z" fill="#3e3028" />
      <path d="M1180,236 C1230,190 1270,170 1330,160 C1280,180 1240,206 1200,246 Z" fill="#3e3028" />
      <path d="M1700,170 C1740,130 1790,120 1830,124 C1790,134 1750,150 1716,182 Z" fill="#3e3028" />
    </g>
  </g>
);

const LeafBed = ({ dark }: { dark: number }) => (
  <g stroke="#14241a" strokeWidth={2.4} strokeLinejoin="round">
    <path d="M-80,0 C-70,-30 60,-34 86,-6 C90,6 70,14 0,14 C-60,14 -84,10 -80,0 Z" fill="#355a36" />
    <path d="M-66,-6 C-40,-22 40,-24 70,-8" fill="none" stroke="#5d8a52" strokeWidth={2} />
    <path d="M-40,-10 C-20,-22 20,-22 40,-14 C30,-4 -20,-2 -40,-10 Z" fill="#c9b48f" />
    {/* The bed sits in shadow: everything else glows, its little bottle stays empty. */}
    <ellipse cx={0} cy={-30} rx={170} ry={90} fill="#05090b" opacity={0.6 * dark} stroke="none" filter="url(#soft)" />
  </g>
);

export const PaintedForest = ({
  mode,
  start = 0,
  duration,
  turn = 0,
  label,
}: {
  mode: Mode;
  start?: number;
  duration: number;
  /** secret: the fairy goes to its dark bed; together: unused. */
  turn?: number;
  label: string;
}) => {
  const camera =
    mode === "secret"
      ? [{ s: 1.14, x: -40, y: 60 }, { s: 1.12, x: 70, y: -50 }]
      : [{ s: 1.06 }, { s: 1.14, x: 60, y: -50 }];
  return (
    <PaintedShot start={start} duration={duration} label={label} from={camera[0]} to={camera[1]}>
      {(f, travel) => {
        const pan = -120 * travel;
        const wind = breeze(f);
        const sad = mode === "secret" ? interpolate(f, [turn, turn + 30], [0, 1], clamp) : 1;
        const fairy =
          mode === "secret"
            ? (() => {
                const land = ease(f, [turn - 60, turn + 10], [0, 1]);
                const [fx, fy] = qpoint([1560, 360], [1200, 300], [BED[0] + 70, BED[1] - 8], land);
                return { x: fx, y: fy + (1 - land) * Math.sin(f / 18) * 10, pose: land >= 1 ? ("sad" as const) : ("fly" as const), flip: -1 };
              })()
            : { x: BED[0] + 36, y: BED[1] - 10, pose: "sit" as const, flip: 1 };
        const story = mode === "together" ? interpolate(f, [100, duration], [0, 1], clamp) : 0;
        return (
          <>
            <defs>
              <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0c1c30" />
                <stop offset="0.6" stopColor="#1b3a44" />
                <stop offset="1" stopColor="#2a4a3c" />
              </linearGradient>
              <linearGradient id="forest-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2d4d36" />
                <stop offset="1" stopColor="#13241b" />
              </linearGradient>
            </defs>
            <rect width={W} height={1080} fill="url(#forest-sky)" />
            <Trunks depth={0.2} color="#284650" n={12} seed={10} pan={pan} />
            <Trunks depth={0.45} color="#1e3740" n={6} seed={40} pan={pan} />
            {/* Moonbeams */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${1500 + i * 150},-20 L${1620 + i * 150},-20 L${900 + i * 170},1000 L${780 + i * 170},1000 Z`}
                fill="#cfe6f0"
                opacity={0.06 + 0.04 * Math.sin(f / 40 + i * 1.7)}
              />
            ))}
            <path d="M-20,820 C400,780 900,800 1940,770 L1940,1100 L-20,1100 Z" fill="url(#forest-ground)" />
            {Array.from({ length: 30 }, (_, i) => (
              <ellipse key={i} cx={rand(i + 700) * W} cy={830 + rand(i + 720) * 230} rx={20 + rand(i + 740) * 60} ry={6 + rand(i + 760) * 10} fill="#3d6a3e" opacity={0.6} />
            ))}
            <Oak />
            {/* Canopy */}
            {[
              [200, 40, 900],
              [900, 10, 1000],
              [1600, 30, 900],
            ].map(([x, y, w], i) => (
              <g key={i} transform={`translate(${x + wind * 6} ${y})`}>
                <Cloud id={`forest-leaves-${i}`} puffs={puffsFor(30 + i * 9, 9, w)} palette={FOLIAGE} />
              </g>
            ))}
            {/* Dream bottles on silk threads */}
            {BRANCHES.flatMap((br, bi) =>
              br.t.map((t, ti) => {
                const [x, y] = qpoint(br.a, br.c, br.b, t);
                const k = bi * 10 + ti;
                const len = 70 + rand(k + 200) * 150;
                const swing = Math.sin(f / (42 + rand(k) * 20) + k) * 4 + wind * 2;
                return (
                  <g key={k} transform={`translate(${x} ${y + 6}) rotate(${swing})`}>
                    <path d={`M0,0 L0,${len}`} stroke="#e8dcc4" strokeWidth={1.3} opacity={0.7} />
                    <g transform={`translate(0 ${len + 58}) scale(${0.55 + rand(k + 300) * 0.25})`}>
                      <DreamBottle f={f} glow={1} phase={k} />
                    </g>
                  </g>
                );
              }),
            )}
            {/* The fairy's bed and its empty bottle, on a twig of their own */}
            <g transform={`translate(${BED[0]} ${BED[1]}) scale(1.3)`}>
              <LeafBed dark={mode === "secret" ? 0.5 + sad * 0.5 : 0.8} />
              <g transform="translate(-60 -64) scale(0.45)">
                <DreamBottle f={f} glow={story * 0.9} />
              </g>
            </g>
            <g transform={`translate(${mode === "secret" ? 1260 : 1010} 904) scale(1.1)`}>
              <GirlSitting
                f={f}
                eyes="open"
                mouth={mode === "secret" && sad > 0.5 ? "soft" : "smile"}
                lookUp={mode === "secret" ? 1 - sad : 0}
              />
            </g>
            <g transform={`translate(${fairy.x} ${fairy.y}) scale(${1.4 * fairy.flip} 1.4)`}>
              <Fairy f={f} pose={fairy.pose} />
            </g>
            {/* The story they are making up begins to glow between them. */}
            {story > 0 && (
              <g opacity={story}>
                {Array.from({ length: 16 }, (_, i) => {
                  const a = (i / 16) * Math.PI * 2 + f / 40;
                  return <circle key={i} cx={930 + Math.cos(a) * 70 * story} cy={720 + Math.sin(a) * 26 * story} r={2.4} fill="#fff0b8" />;
                })}
                <path d="M880,724 C910,744 960,744 984,718 C960,730 910,732 880,724 Z" fill="#ffe3a6" filter="url(#glow)" />
              </g>
            )}
            <Motes f={f} count={34} box={[0, 300, W, 600]} seed={6} color="#d8ff9a" />
            {/* Ferns in the foreground sway with the breeze */}
            <g transform="translate(40 1090) scale(1.3)">
              <Fern bend={wind * 0.5} />
              <g transform="rotate(-30)">
                <Fern length={180} bend={wind * 0.6} />
              </g>
            </g>
            <g transform="translate(1880 1090) scale(-1.4 1.4)">
              <Fern bend={-wind * 0.5} color="#24492f" />
              <g transform="rotate(-24)">
                <Fern length={170} bend={-wind * 0.6} color="#24492f" />
              </g>
            </g>
          </>
        );
      }}
    </PaintedShot>
  );
};
