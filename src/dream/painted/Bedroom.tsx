import { interpolate } from "remotion";
import {
  Castle,
  CandyCastle,
  Cloud,
  DreamStream,
  Fairy,
  GirlHead,
  GirlUpright,
  Moon,
  Motes,
  PaintedShot,
  Stars,
  W,
  Whale,
  breeze,
  clamp,
  ease,
  puffsFor,
  qpoint,
  rand,
} from "./kit";

/**
 * Mimi's attic bedroom at night, lit by the bedside lamp and the moon through the
 * arched window. `collect`: she sleeps while the fairy bottles her dream.
 * `follow`: she peeks, then sits up. `ending`: she reads her picture book.
 */

type Mode = "collect" | "follow" | "ending";

const WIN = { x0: 320, x1: 620, top: 270, sill: 640 };
const WIN_PATH = `M${WIN.x0},${WIN.sill} L${WIN.x0},420 A150,150 0 0 1 ${WIN.x1},420 L${WIN.x1},${WIN.sill} Z`;
const HEAD = [1572, 612] as const;
const BOTTLE_AT = [1360, 520] as const;

const Window = ({ f, wink }: { f: number; wink: number }) => (
  <g>
    <clipPath id="bed-win">
      <path d={WIN_PATH} />
    </clipPath>
    <g clipPath="url(#bed-win)">
      <rect x={WIN.x0} y={WIN.top} width={300} height={380} fill="url(#bed-night)" />
      <Stars f={f} count={40} maxY={WIN.sill} seed={3} />
      <Moon x={555} y={350} r={22} />
      <g transform="translate(470 470) scale(0.6)">
        <Cloud id="bed-cloud" puffs={puffsFor(11, 6, 300)} />
      </g>
      <path d="M300,640 C380,580 460,560 640,600 L640,660 L300,660 Z" fill="#26375a" />
      <g transform="translate(430 598) scale(0.32)">
        <Castle />
      </g>
      {/* A star that winks at the very end. */}
      <g transform={`translate(${WIN.x0 + 70} 350) scale(${0.6 + wink * 1.6})`} opacity={0.4 + wink * 0.6}>
        <circle r={14} fill="url(#goldGlow)" />
        <path d="M0,-12 L2.5,-2.5 L12,0 L2.5,2.5 L0,12 L-2.5,2.5 L-12,0 L-2.5,-2.5 Z" fill="#fff4cc" />
      </g>
    </g>
    <path d={WIN_PATH} fill="none" stroke="#6b4a32" strokeWidth={18} strokeLinejoin="round" />
    <path d={`M470,${WIN.top + 6} L470,${WIN.sill} M${WIN.x0},470 L${WIN.x1},470`} stroke="#6b4a32" strokeWidth={9} />
    <rect x={296} y={WIN.sill - 4} width={348} height={22} rx={4} fill="#7d5838" />
    <rect x={296} y={WIN.sill - 4} width={348} height={6} rx={3} fill="#a3784e" />
  </g>
);

const Curtain = ({ x, side, sway }: { x: number; side: 1 | -1; sway: number }) => {
  const out = side * (38 + sway * 14);
  return (
    <g filter="url(#brush-fine)">
      <path
        d={`M${x},240 C${x + out * 0.4},400 ${x + out},560 ${x + out * 0.8},720 L${x + out * 0.8 - side * 70},716 C${x - side * 60},560 ${x - side * 50},400 ${x - side * 40},240 Z`}
        fill="#5f7f88"
      />
      <path
        d={`M${x - side * 14},244 C${x + out * 0.2},420 ${x + out * 0.6},580 ${x + out * 0.5},716 L${x + out * 0.5 - side * 16},716 C${x},560 ${x - side * 20},420 ${x - side * 26},244 Z`}
        fill="#456570"
      />
    </g>
  );
};

const StarMobile = ({ f, sway }: { f: number; sway: number }) => (
  <g transform={`translate(860 144) rotate(${sway * 4})`} stroke="#3a2b2e" strokeWidth={1.6}>
    <path d="M0,0 L0,70 M-70,70 L70,70" fill="none" />
    {[-70, 0, 70].map((x, i) => (
      <g key={x} transform={`translate(${x} 70) rotate(${Math.sin(f / 40 + i) * 8})`}>
        <path d={`M0,0 L0,${40 + i * 18}`} fill="none" />
        <g transform={`translate(0 ${52 + i * 18}) rotate(${f * (0.4 + i * 0.2)})`}>
          <path d="M0,-14 L4,-4 L14,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-14,-4 L-4,-4 Z" fill={["#ffd36e", "#f7c6d4", "#cfe3f2"][i]} />
        </g>
      </g>
    ))}
  </g>
);

const Room = ({ f, lamp }: { f: number; lamp: number }) => (
  <g>
    <rect width={W} height={1080} fill="url(#bed-wall)" />
    <circle cx={1830} cy={590} r={950} fill="url(#warmGlow)" opacity={0.7 * lamp} />
    {/* Sloping attic ceiling with rafters */}
    <path d="M0,0 L820,0 L0,560 Z" fill="#2a2540" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M0,${150 + i * 110} L${220 + i * 160},0 L${250 + i * 160},0 L0,${175 + i * 110} Z`} fill="#1f1a2e" />
    ))}
    <path d="M1920,0 L1300,0 L1920,330 Z" fill="#2c2642" />
    <rect x={260} y={110} width={1500} height={34} fill="#4a3322" />
    <rect x={260} y={110} width={1500} height={6} fill="#6e4d33" />
    {/* Shelf with books and a whale plush, and a drawing of a leaf boat */}
    <g transform="translate(1000 368)">
      <rect x={0} y={0} width={330} height={14} fill="#7d5838" />
      {[
        [10, 74, "#a8564e"],
        [36, 88, "#5f7f88"],
        [62, 70, "#c9a35f"],
        [86, 92, "#6e8a52"],
        [114, 66, "#8c6aa0"],
      ].map(([x, h, c]) => (
        <rect key={x as number} x={x as number} y={-(h as number)} width={22} height={h as number} fill={c as string} stroke="#3a2b2e" strokeWidth={1.5} />
      ))}
      <g transform="translate(240 -26) scale(0.22)">
        <path d="M-150,0 C-140,-46 -60,-66 20,-58 C90,-50 140,-22 170,-4 C195,-18 210,-40 236,-46 C232,-24 222,-8 214,4 C226,16 236,34 236,52 C210,40 192,24 172,14 C130,40 60,56 -10,52 C-90,48 -150,34 -150,0 Z" fill="#9cc3dd" stroke="#3a2b2e" strokeWidth={8} />
      </g>
    </g>
    <g transform="translate(760 360)">
      <rect x={0} y={0} width={130} height={100} fill="#e8dcc4" stroke="#6b4a32" strokeWidth={8} />
      <path d="M22,70 C50,86 90,84 110,62 C100,74 60,76 22,70 Z" fill="#6e9a4a" />
      <circle cx={34} cy={60} r={8} fill="#f4a64a" />
      <circle cx={100} cy={28} r={6} fill="#c9a35f" />
    </g>
    {/* Moonlight on the floor */}
    <path d={`M${WIN.x0},${WIN.sill} L${WIN.x1},${WIN.sill} L1120,1080 L520,1080 Z`} fill="#bcd3f0" opacity={0.07} />
    {/* Floor */}
    <rect y={820} width={W} height={260} fill="#4e3626" />
    <rect y={814} width={W} height={12} fill="#3a281c" />
    {[860, 905, 960, 1025].map((y, i) => (
      <path key={y} d={`M0,${y} L${W},${y}`} stroke="#3e2b1f" strokeWidth={2 + i} />
    ))}
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M${rand(i + 60) * W},${[826, 860, 905, 960][i % 4]} l0,${[34, 45, 55, 65][i % 4]}`} stroke="#3e2b1f" strokeWidth={2} />
    ))}
    <ellipse cx={1110} cy={965} rx={430} ry={72} fill="#8a4f45" />
    <ellipse cx={1110} cy={965} rx={380} ry={56} fill="none" stroke="#c98d5c" strokeWidth={6} />
    {/* Bedside table and lamp */}
    <g>
      <rect x={1764} y={660} width={140} height={160} fill="#8a5f38" stroke="#3a2b2e" strokeWidth={2.5} />
      <rect x={1764} y={660} width={140} height={14} fill="#a8743f" />
      <rect x={1780} y={720} width={108} height={40} rx={4} fill="#7d5530" stroke="#3a2b2e" strokeWidth={2} />
      <rect x={1824} y={598} width={14} height={62} fill="#c9a35f" />
      <circle cx={1831} cy={585} r={120 + lamp * 30 + Math.sin(f / 9) * 4} fill="url(#goldGlow)" opacity={0.7 * lamp} />
      <path d="M1786,610 L1876,610 L1858,546 L1804,546 Z" fill="#f4c97c" stroke="#3a2b2e" strokeWidth={2.5} />
      <path d="M1846,610 L1876,610 L1858,546 L1840,546 Z" fill="#e3aa5c" />
      <path d="M1790,650 q12,-14 30,0" fill="none" stroke="#3a2b2e" strokeWidth={2} />
      <rect x={1790} y={634} width={30} height={26} rx={4} fill="#cfe3f2" stroke="#3a2b2e" strokeWidth={2} />
    </g>
  </g>
);

const BedFrame = () => (
  <g stroke="#3a2b2e" strokeWidth={2.6} strokeLinejoin="round">
    <path d="M1676,800 L1676,486 C1676,456 1752,456 1752,486 L1752,800 Z" fill="#a8743f" />
    <path d="M1716,800 L1716,470 C1736,474 1752,480 1752,486 L1752,800 Z" fill="#7d5530" stroke="none" />
    <rect x={890} y={700} width={800} height={70} fill="#a8743f" />
    <rect x={890} y={748} width={800} height={22} fill="#7d5530" stroke="none" />
    <rect x={896} y={770} width={26} height={50} fill="#7d5530" />
    <rect x={1640} y={770} width={26} height={50} fill="#7d5530" />
    <rect x={900} y={648} width={780} height={58} rx={14} fill="#e8dcc4" />
    <ellipse cx={1586} cy={632} rx={104} ry={38} fill="#f6efe0" />
    <path d="M1500,646 C1540,668 1630,670 1680,646" fill="none" stroke="#d6c8ad" strokeWidth={3} />
  </g>
);

/** The knitted quilt; `high` is how far up the bed it reaches (asleep vs sitting). */
const Quilt = ({ id, top }: { id: string; top: string }) => (
  <g>
    <clipPath id={id}>
      <path d={top} />
    </clipPath>
    <path d={top} fill="#efe4cf" stroke="#3a2b2e" strokeWidth={2.6} strokeLinejoin="round" />
    <g clipPath={`url(#${id})`}>
      {Array.from({ length: 12 }, (_, r) =>
        Array.from({ length: 44 }, (_, c) => (
          <path
            key={`${r}-${c}`}
            d={`M${900 + c * 18},${590 + r * 18} l6,8 l6,-8`}
            fill="none"
            stroke="#d9cbb0"
            strokeWidth={2}
          />
        )),
      )}
      <rect x={880} y={740} width={820} height={80} fill="#d9cbb0" opacity={0.6} />
      <path d="M880,700 L1700,700" stroke="#c9b48f" strokeWidth={4} strokeDasharray="10 8" />
    </g>
  </g>
);

const QUILT_ASLEEP =
  "M908,660 C960,606 1110,598 1260,604 C1380,598 1470,612 1530,640 C1556,656 1556,690 1540,710 L1560,800 L900,800 Z";
const QUILT_SITTING =
  "M908,668 C1010,642 1160,640 1300,646 C1380,640 1440,642 1500,652 C1560,656 1610,668 1640,690 L1650,800 L900,800 Z";

const GirlAsleep = ({ f, eyes }: { f: number; eyes: "asleep" | "peek" }) => (
  <g>
    <g transform={`translate(${HEAD[0]} ${HEAD[1]}) rotate(${72 + Math.sin(f / 40) * 1.2})`}>
      <GirlHead eyes={eyes} mouth="soft" />
    </g>
    <path d="M1488,652 C1500,640 1522,640 1530,652 C1520,660 1500,662 1488,652 Z" fill="#f6d9c1" stroke="#3a2b2e" strokeWidth={2.4} />
  </g>
);

const OpenBook = () => (
  <g stroke="#3a2b2e" strokeWidth={2.4} strokeLinejoin="round">
    <path d="M-110,0 C-70,-16 -24,-14 0,0 C24,-14 70,-16 110,0 L104,-58 C70,-70 24,-70 0,-56 C-24,-70 -70,-70 -104,-58 Z" fill="#f8f1e2" />
    <path d="M0,0 L0,-56" fill="none" />
    {/* Pictures, no words: a leaf boat on one page, a little sun on the other. */}
    <path d="M-88,-24 C-64,-10 -30,-10 -18,-28 C-30,-20 -60,-18 -88,-24 Z" fill="#6e9a4a" strokeWidth={1.5} />
    <circle cx={-80} cy={-34} r={6} fill="#f4a64a" strokeWidth={1.2} />
    <path d="M-90,-14 q20,-4 70,0" fill="none" stroke="#7ea6c8" strokeWidth={2} />
    <circle cx={56} cy={-36} r={14} fill="#f4c97c" strokeWidth={1.5} />
    <path d="M20,-14 C40,-24 70,-24 92,-14" fill="none" stroke="#7ea6c8" strokeWidth={2} />
    <path d="M-110,0 C-70,-16 -24,-14 0,0 C24,-14 70,-16 110,0 L110,8 C70,-6 24,-6 0,8 C-24,-6 -70,-6 -110,8 Z" fill="#a8564e" />
  </g>
);

export const PaintedBedroom = ({
  mode,
  start = 0,
  duration,
  turn = 0,
  label,
}: {
  mode: Mode;
  start?: number;
  duration: number;
  /** collect: the fairy leaves; follow: Mimi sits up; ending: the star winks. */
  turn?: number;
  label: string;
}) => {
  const camera = {
    collect: [{ s: 1.03 }, { s: 1.1, x: -80, y: -20 }],
    follow: [{ s: 1.12, x: -90, y: -24 }, { s: 1.07, x: -60, y: -14 }],
    ending: [{ s: 1.1, x: -80, y: -24 }, { s: 1.01 }],
  }[mode];
  return (
    <PaintedShot start={start} duration={duration} label={label} from={camera[0]} to={camera[1]}>
      {(f) => {
        const sway = breeze(f);
        const awake = mode === "ending" || (mode === "follow" && f >= turn);
        // A short dissolve between Mimi lying down and sitting up.
        const rise = mode === "follow" ? interpolate(f, [turn, turn + 10], [0, 1], clamp) : awake ? 1 : 0;
        const wink = mode === "ending" ? Math.sin(interpolate(f, [turn + 40, turn + 70], [0, 1], clamp) * Math.PI) : 0;

        // Where the fairy is and what it holds.
        let fairy: { x: number; y: number; pose: "fly" | "stand"; flip: number; glow: number; holding?: "bottle" | "flower" | "emptyBottle" };
        if (mode === "collect") {
          const leave = ease(f, [turn, turn + 120], [0, 1]);
          const filled = interpolate(f, [30, 240], [0.15, 1], clamp);
          fairy = {
            x: BOTTLE_AT[0] - 18 + leave * -760,
            y: BOTTLE_AT[1] + 12 + leave * -80,
            pose: "fly",
            flip: leave > 0.02 ? -1 : 1,
            glow: filled,
            holding: "bottle",
          };
        } else if (mode === "follow") {
          const come = ease(f, [20, turn - 20], [0, 1]);
          const startle = ease(f, [turn, turn + 18], [0, 1]);
          fairy = {
            x: 600 + come * 780 - startle * 150,
            y: 470 + come * 50 + startle * 10 - Math.sin(startle * Math.PI) * 60,
            pose: "fly",
            flip: 1,
            glow: 0.15,
            holding: "emptyBottle",
          };
        } else {
          fairy = { x: 1424, y: 584, pose: "stand", flip: 1, glow: 0, holding: "flower" };
        }

        const collectT = mode === "collect" ? interpolate(f, [30, 250], [0, 1], clamp) : 0;
        const travel = (u: number) => qpoint(HEAD, [1470, 400], BOTTLE_AT, u);
        return (
          <>
            <defs>
              <linearGradient id="bed-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2f2a46" />
                <stop offset="1" stopColor="#4a3e4f" />
              </linearGradient>
              <linearGradient id="bed-night" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#14214c" />
                <stop offset="1" stopColor="#3d6f8f" />
              </linearGradient>
            </defs>
            <Room f={f} lamp={1} />
            <Window f={f} wink={wink} />
            <Curtain x={316} side={-1} sway={sway} />
            <Curtain x={624} side={1} sway={-sway} />
            <StarMobile f={f} sway={sway} />
            <BedFrame />
            {rise < 1 && (
              <g opacity={1 - rise}>
                <GirlAsleep f={f} eyes={mode === "follow" && f % 70 > 46 ? "peek" : "asleep"} />
                <Quilt id="bed-quilt-a" top={QUILT_ASLEEP} />
              </g>
            )}
            {rise > 0 && (
              <g opacity={rise}>
                <g transform="translate(1540 652)">
                  <GirlUpright
                    f={f}
                    book={mode === "ending"}
                    eyes="open"
                    mouth={mode === "follow" && f < turn + 70 ? "o" : "smile"}
                    lean={mode === "follow" ? -4 : -2}
                  />
                </g>
                <Quilt id="bed-quilt-s" top={QUILT_SITTING} />
                {mode === "ending" && (
                  <g transform="translate(1520 640) rotate(-4)">
                    <OpenBook />
                    <path d="M-104,-20 C-112,-6 -100,4 -86,0 M104,-20 C112,-6 100,4 86,0" fill="#f6d9c1" stroke="#3a2b2e" strokeWidth={2.4} />
                  </g>
                )}
              </g>
            )}
            {mode === "collect" && (
              <>
                <DreamStream a={HEAD} c={[1470, 400]} b={BOTTLE_AT} t={collectT} count={26} seed={5} />
                {/* The dreams themselves — a flying whale and a candy castle — shrink into the bottle. */}
                {[
                  [0.18, 0.62, "whale"],
                  [0.42, 0.86, "castle"],
                ].map(([a, b, kind]) => {
                  const u = interpolate(collectT, [a as number, b as number], [0, 1], clamp);
                  if (u <= 0 || u >= 1) return null;
                  const [x, y] = travel(u);
                  const s = (1 - u) * 0.9 + 0.1;
                  return (
                    <g key={kind as string} transform={`translate(${x} ${y - 40 * (1 - u)}) scale(${s * (kind === "whale" ? 0.22 : 0.4)})`} opacity={Math.sin(u * Math.PI) * 0.6 + 0.4}>
                      {kind === "whale" ? <Whale color="#ffe3a6" /> : <CandyCastle />}
                    </g>
                  );
                })}
              </>
            )}
            <g transform={`translate(${fairy.x} ${fairy.y}) scale(${1.25 * fairy.flip} 1.25)`}>
              <Fairy f={f} pose={fairy.pose} holding={fairy.holding} glow={fairy.glow} />
            </g>
            <Motes f={f} box={[700, 220, 1100, 560]} seed={2} />
          </>
        );
      }}
    </PaintedShot>
  );
};
