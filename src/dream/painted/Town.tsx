import { interpolate } from "remotion";
import {
  CandyCastle,
  Castle,
  CastleWindows,
  Cloud,
  DreamStream,
  FOLIAGE,
  Fairy,
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
 * The two exteriors: the castle on its hill above the lake with the village at its
 * foot, and Mimi's stone-and-timber cottage. `opening`: the first night, the fairy
 * coming with its bottle. `return`: the second night, the dreams flying home and the
 * fairy bringing a flower instead.
 */

type Mode = "opening" | "return";

const LAKE = 720;

const HOUSES = Array.from({ length: 26 }, (_, i) => {
  const x = 930 + i * 36 + rand(i + 1) * 18;
  const hill = Math.max(0, 1 - Math.abs(x - 1330) / 560);
  return {
    x,
    y: 704 - hill * 50 - rand(i + 3) * 12,
    w: 24 + rand(i + 5) * 18,
    h: 20 + rand(i + 7) * 18,
  };
});

const Pine = ({ h }: { h: number }) => (
  <g>
    <rect x={-5} y={-h * 0.2} width={10} height={h * 0.2} fill="#16222a" />
    {[0, 1, 2, 3].map((i) => (
      <path
        key={i}
        d={`M${-h * (0.3 - i * 0.05)},${-h * (0.18 + i * 0.2)} L0,${-h * (0.48 + i * 0.17)} L${h * (0.3 - i * 0.05)},${-h * (0.18 + i * 0.2)} Z`}
        fill={i % 2 ? "#1b2d33" : "#14232a"}
      />
    ))}
  </g>
);

const Pines = ({ x0, x1, base, seed, scale = 1 }: { x0: number; x1: number; base: number; seed: number; scale?: number }) => (
  <g filter="url(#brush)">
    {Array.from({ length: Math.round((x1 - x0) / 40) }, (_, i) => (
      <g key={i} transform={`translate(${x0 + i * 40 + rand(seed + i) * 20} ${base + rand(seed + i + 9) * 30})`}>
        <Pine h={(160 + rand(seed + i + 4) * 200) * scale} />
      </g>
    ))}
  </g>
);

/** Little cottage seen far away across the water, its attic window lit. */
const FarCottage = ({ glow }: { glow: number }) => (
  <g stroke="#101820" strokeWidth={2}>
    <rect x={-40} y={-50} width={80} height={50} fill="#4a5568" />
    <path d="M-52,-48 L0,-100 L52,-48 Z" fill="#2c3548" />
    <path d="M-8,-64 L-8,-78 A8,8 0 0 1 8,-78 L8,-64 Z" fill="#ffd57a" opacity={glow} />
    <circle cx={0} cy={-70} r={40} fill="url(#warmGlow)" opacity={glow} stroke="none" />
    <rect x={-26} y={-34} width={12} height={14} fill="#c9a35f" opacity={0.7} />
  </g>
);

export const PaintedCastleView = ({
  mode,
  start = 0,
  duration,
  label,
}: {
  mode: Mode;
  start?: number;
  duration: number;
  label: string;
}) => (
  <PaintedShot
    start={start}
    duration={duration}
    label={label}
    hold={30}
    from={mode === "opening" ? { s: 1.0 } : { s: 1.07, x: -40, y: 10 }}
    to={mode === "opening" ? { s: 1.03, x: -10 } : { s: 1.0 }}
  >
    {(f, travel) => {
      const pan = (depth: number) => -60 * depth * travel;
      const sent = (i: number) => interpolate(f, [20 + i * 9, 120 + i * 9], [0, 1], clamp);
      const fairyT = mode === "opening" ? ease(f, [60, duration - 10], [0, 1]) : 0;
      const [fx, fy] = qpoint([1330, 430], [880, 330], [430, 700], fairyT);
      return (
        <>
          <defs>
            <linearGradient id="town-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c163c" />
              <stop offset="0.55" stopColor="#22427a" />
              <stop offset="1" stopColor="#4a7f98" />
            </linearGradient>
            <linearGradient id="town-lake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#355f82" />
              <stop offset="0.35" stopColor="#1c3a62" />
              <stop offset="1" stopColor="#0a1530" />
            </linearGradient>
          </defs>
          <rect width={W} height={LAKE + 4} fill="url(#town-sky)" />
          <g transform={`translate(${pan(0.1)} 0)`}>
            <Moon x={1660} y={150} r={40} />
            <Stars f={f} maxY={LAKE - 120} seed={1} />
          </g>
          {[
            [1450, 230, 520, 0.2],
            [1820, 360, 360, 0.3],
            [980, 300, 300, 0.25],
          ].map(([x, y, w, d], i) => (
            <g key={i} transform={`translate(${x + f * d * 0.3 + pan(d)} ${y})`}>
              <Cloud id={`town-cloud-${i}`} puffs={puffsFor(50 + i * 7, 7, w)} />
            </g>
          ))}
          {/* Far ridges, lighter with distance */}
          <g transform={`translate(${pan(0.2)} 0)`} filter="url(#brush)">
            <path d="M-40,620 C200,520 380,560 560,520 C760,480 900,560 1100,540 C1400,510 1600,560 1960,520 L1960,730 L-40,730 Z" fill="#4c6a92" />
            <path d="M-40,680 C240,600 460,640 700,610 C900,590 1000,650 1200,660 L1200,730 L-40,730 Z" fill="#334f75" />
          </g>
          {/* Castle hill, road and village */}
          <g transform={`translate(${pan(0.35)} 0)`}>
            <path d="M820,724 C1000,620 1150,480 1330,468 C1520,480 1700,610 1960,640 L1960,724 Z" fill="#2a3f5e" filter="url(#brush)" />
            <path d="M1330,470 C1290,520 1380,560 1300,600 C1240,630 1320,660 1240,700" fill="none" stroke="#7b93b4" strokeWidth={5} opacity={0.6} />
            <g transform="translate(1330 476) scale(1.25)">
              <g filter="url(#brush)">
                <Castle />
              </g>
              <CastleWindows f={f} />
            </g>
            {HOUSES.map((h, i) => {
              const home = mode === "return" ? sent(i % 10) : 0;
              return (
                <g key={i} stroke="#141d30" strokeWidth={1.5}>
                  <rect x={h.x} y={h.y - h.h} width={h.w} height={h.h} fill="#3b5277" />
                  <path d={`M${h.x - 4},${h.y - h.h} L${h.x + h.w / 2},${h.y - h.h - h.w * 0.6} L${h.x + h.w + 4},${h.y - h.h} Z`} fill="#23324f" />
                  <rect x={h.x + h.w * 0.35} y={h.y - h.h * 0.7} width={6} height={7} fill="#ffd57a" stroke="none" opacity={0.45 + 0.3 * Math.abs(Math.sin(f / 30 + i)) + home * 0.5} />
                  {home > 0.95 && <circle cx={h.x + h.w * 0.35 + 3} cy={h.y - h.h * 0.7 + 3} r={22} fill="url(#goldGlow)" stroke="none" opacity={0.8} />}
                </g>
              );
            })}
          </g>
          <rect y={LAKE - 40} width={W} height={60} fill="#c6d4dd" opacity={0.16} filter="url(#brush)" />

          {/* Lake with reflections */}
          <rect y={LAKE} width={W} height={1080 - LAKE} fill="url(#town-lake)" />
          <g filter="url(#water)">
            <g transform={`translate(${1330 + pan(0.35)} ${LAKE + 6}) scale(1.25 -0.7)`} opacity={0.28}>
              <Castle />
            </g>
            {HOUSES.filter((_, i) => i % 2 === 0).map((h, i) => (
              <rect key={i} x={h.x + h.w * 0.35 + pan(0.35)} y={LAKE + 8 + rand(i + 33) * 20} width={5} height={50 + rand(i + 44) * 60} fill="#ffd57a" opacity={0.25} />
            ))}
            {Array.from({ length: 22 }, (_, i) => {
              const w = 30 + rand(i + 30) * 90 + i * 3;
              return (
                <rect key={i} x={1660 + pan(0.1) - w / 2 + Math.sin(f / 22 + i) * 10} y={LAKE + 10 + i * 15} width={w} height={3} rx={2} fill="#f6e7c0" opacity={0.5 - i * 0.018} />
              );
            })}
          </g>

          {/* Near shore with Mimi's cottage, and pines framing the edges */}
          <path d="M-20,812 C200,776 520,780 760,830 C800,880 700,1000 600,1100 L-20,1100 Z" fill="#17262c" filter="url(#brush)" />
          <g transform="translate(440 806) scale(1.1)">
            <FarCottage glow={0.75 + 0.25 * Math.sin(f / 20)} />
          </g>
          <Pines x0={-40} x1={240} base={830} seed={70} scale={1.3} />
          <Pines x0={1790} x1={1960} base={760} seed={90} />

          {mode === "opening" && fairyT > 0 && fairyT < 1 && (
            <g>
              <circle cx={fx} cy={fy} r={26} fill="url(#goldGlow)" />
              <circle cx={fx} cy={fy} r={3} fill="#fff4cc" />
            </g>
          )}

          {mode === "return" && (
            <>
              {Array.from({ length: 10 }, (_, i) => {
                const h = HOUSES[i * 2 + 3];
                return (
                  <DreamStream
                    key={i}
                    a={[180, 380]}
                    c={[600 + i * 60, 160 + rand(i + 66) * 120]}
                    b={[h.x + h.w * 0.35 + 3 + pan(0.35), h.y - h.h * 0.7 + 3]}
                    t={sent(i)}
                    count={12}
                    seed={i * 13}
                  />
                );
              })}
              {[
                [0, "whale"],
                [3, "castle"],
                [6, "whale"],
              ].map(([i, kind]) => {
                const u = sent(i as number);
                if (u <= 0.05 || u >= 0.95) return null;
                const h = HOUSES[(i as number) * 2 + 3];
                const [x, y] = qpoint([180, 380], [700, 200], [h.x, h.y - 40], u);
                return (
                  <g key={i as number} transform={`translate(${x} ${y}) scale(${kind === "whale" ? 0.2 : 0.32})`} opacity={Math.sin(u * Math.PI)}>
                    {kind === "whale" ? <Whale color="#ffe3a6" /> : <CandyCastle />}
                  </g>
                );
              })}
            </>
          )}
        </>
      );
    }}
  </PaintedShot>
);

const Smoke = ({ f, x, y, wind }: { f: number; x: number; y: number; wind: number }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const t = ((f / 140 + i / 9) % 1 + 1) % 1;
      return (
        <circle
          key={i}
          cx={x + t * 120 * (1 + wind * 0.3) + Math.sin(t * 6 + i) * 12}
          cy={y - t * 260}
          r={14 + t * 46}
          fill="#c9d4e2"
          opacity={0.35 * (1 - t) * Math.min(1, t * 6)}
          filter="url(#brush)"
        />
      );
    })}
  </g>
);

const Cottage = ({ glow, knock, wind }: { glow: number; knock: number; wind: number }) => (
  <g stroke="#2a2420" strokeWidth={2.6} strokeLinejoin="round">
    {/* Stone ground floor */}
    <rect x={1100} y={600} width={480} height={262} fill="#8f8a80" />
    <rect x={1420} y={600} width={160} height={262} fill="#6f6b66" stroke="none" />
    {Array.from({ length: 34 }, (_, i) => (
      <ellipse key={i} cx={1116 + (i % 9) * 56 + (Math.floor(i / 9) % 2) * 26} cy={624 + Math.floor(i / 9) * 62} rx={24} ry={14} fill="none" stroke="#5c5852" strokeWidth={2} />
    ))}
    {/* Half-timbered gable */}
    <path d="M1340,184 L1124,600 L1556,600 Z" fill="#e2d6bd" />
    <path d="M1340,184 L1556,600 L1440,600 Z" fill="#c4b799" stroke="none" />
    <path d="M1180,600 L1180,500 M1500,600 L1500,500 M1230,480 L1450,480 M1240,480 L1300,600 M1440,480 L1380,600" fill="none" stroke="#4a3322" strokeWidth={10} />
    {/* Slate roof edges */}
    <path d="M1340,140 L1040,620 L1090,626 L1340,212 Z" fill="#3b4a66" />
    <path d="M1340,140 L1640,620 L1590,626 L1340,212 Z" fill="#2b3850" />
    {/* Chimney */}
    <rect x={1468} y={250} width={52} height={150} fill="#77716a" />
    <rect x={1460} y={240} width={68} height={18} fill="#5c5852" />
    {/* Attic window, the one that is always lit */}
    <circle cx={1340} cy={360} r={190 * glow} fill="url(#warmGlow)" stroke="none" />
    <path d="M1294,420 L1294,330 A46,46 0 0 1 1386,330 L1386,420 Z" fill="#ffd57a" opacity={0.6 + glow * 0.4} />
    {knock > 0 && (
      <g fill="none" stroke="#fff4cc" strokeWidth={2}>
        {[0, 1].map((k) => (
          <circle key={k} cx={1316} cy={372} r={8 + ((knock * 3 + k * 0.5) % 1) * 30} opacity={1 - ((knock * 3 + k * 0.5) % 1)} />
        ))}
      </g>
    )}
    <path d="M1294,420 L1294,330 A46,46 0 0 1 1386,330 L1386,420 Z M1340,286 L1340,420 M1294,366 L1386,366" fill="none" stroke="#4a3322" strokeWidth={7} />
    <rect x={1282} y={418} width={116} height={12} fill="#6b4a32" />
    {/* Door and ground-floor windows */}
    <path d="M1200,862 L1200,760 A40,40 0 0 1 1280,760 L1280,862 Z" fill="#6b4a32" />
    <circle cx={1266} cy={810} r={4} fill="#c9a35f" />
    {[1360, 1480].map((x) => (
      <g key={x}>
        <rect x={x} y={680} width={70} height={80} fill="#e8b860" opacity={0.75} />
        <path d={`M${x},680 h70 v80 h-70 Z M${x + 35},680 v80 M${x},720 h70`} fill="none" stroke="#4a3322" strokeWidth={6} />
      </g>
    ))}
    {/* Ivy climbing the stone */}
    <g transform={`translate(1130 ${690 + wind}) scale(0.5)`}>
      <Cloud id="house-ivy" puffs={puffsFor(91, 6, 200)} palette={FOLIAGE} />
    </g>
  </g>
);

const Flowers = ({ f, wind }: { f: number; wind: number }) => (
  <g>
    {Array.from({ length: 60 }, (_, i) => {
      const x = rand(i + 500) * W;
      const y = 930 + rand(i + 520) * 150;
      const h = 30 + rand(i + 540) * 40;
      const lean = (wind * 10 + Math.sin(f / 24 + i) * 4) * (h / 60);
      return (
        <g key={i}>
          <path d={`M${x},${y} q${lean * 0.3},${-h * 0.6} ${lean},${-h}`} stroke="#3d6a3e" strokeWidth={2} fill="none" />
          <circle cx={x + lean} cy={y - h} r={4 + rand(i + 560) * 3} fill={["#f7c6d4", "#fff3c2", "#cfe3f2", "#f4a64a"][i % 4]} stroke="#2a2420" strokeWidth={1} />
        </g>
      );
    })}
  </g>
);

export const PaintedCottage = ({
  mode,
  start = 0,
  duration,
  label,
}: {
  mode: Mode;
  start?: number;
  duration: number;
  label: string;
}) => (
  <PaintedShot start={start} duration={duration} label={label} hold={30} from={{ s: 1.0 }} to={{ s: 1.08, x: -60, y: 30 }}>
    {(f, travel) => {
      const wind = breeze(f);
      const pan = (depth: number) => -80 * depth * travel;
      const arrive = ease(f, [10, duration * 0.62], [0, 1]);
      const [fx, fy] = qpoint([560, 520], [960, 260], [1272, 404], arrive);
      // On the second night it knocks three times, then Mimi's window brightens.
      const knock = mode === "return" ? interpolate(f, [duration * 0.66, duration * 0.66 + 45], [0, 1], clamp) : 0;
      const tap = knock > 0 && knock < 1 ? Math.abs(Math.sin(knock * Math.PI * 3)) * 8 : 0;
      const glow = 0.8 + 0.15 * Math.sin(f / 20) + (knock >= 1 ? 0.3 : 0);
      return (
        <>
          <defs>
            <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d1a42" />
              <stop offset="0.7" stopColor="#2a4f80" />
              <stop offset="1" stopColor="#5a8aa0" />
            </linearGradient>
            <linearGradient id="house-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b4a3a" />
              <stop offset="1" stopColor="#142319" />
            </linearGradient>
          </defs>
          <rect width={W} height={660} fill="url(#house-sky)" />
          <g transform={`translate(${pan(0.1)} 0)`}>
            <Moon x={330} y={170} />
            <Stars f={f} maxY={540} seed={2} />
          </g>
          {[
            [620, 280, 520, 0.2],
            [1700, 180, 380, 0.15],
          ].map(([x, y, w, d], i) => (
            <g key={i} transform={`translate(${x + f * d * 0.3 + pan(d)} ${y})`}>
              <Cloud id={`house-cloud-${i}`} puffs={puffsFor(70 + i * 5, 7, w)} />
            </g>
          ))}
          {/* Lake and the castle far across it */}
          <g transform={`translate(${pan(0.25)} 0)`}>
            <path d="M-20,580 C300,540 600,560 900,560 L900,620 L-20,620 Z" fill="#334f75" filter="url(#brush)" />
            <g transform="translate(520 566) scale(0.4)">
              <Castle />
              <CastleWindows f={f} />
            </g>
            <rect y={586} width={W} height={60} fill="#2c5578" />
            <g filter="url(#water)">
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={260 + rand(i) * 200} y={596 + i * 5} width={40 + rand(i + 4) * 60} height={2} fill="#f6e7c0" opacity={0.4} />
              ))}
            </g>
          </g>
          <path d="M-20,640 C400,610 900,620 1940,600 L1940,1100 L-20,1100 Z" fill="url(#house-ground)" />
          <Smoke f={f} x={1494} y={236} wind={wind} />
          {[
            [930, 700, 260],
            [1720, 720, 300],
            [640, 760, 220],
          ].map(([x, y, w], i) => (
            <g key={i} transform={`translate(${x + wind * 3} ${y})`}>
              <Cloud id={`house-bush-${i}`} puffs={puffsFor(140 + i * 11, 6, w)} palette={FOLIAGE} />
            </g>
          ))}
          <Cottage glow={glow} knock={knock} wind={wind} />
          {/* Mimi comes to the window once the fairy has knocked. */}
          {knock >= 1 && (
            <g opacity={interpolate(f, [duration * 0.66 + 45, duration * 0.66 + 70], [0, 1], clamp)}>
              <circle cx={1356} cy={384} r={22} fill="#3a2a2e" opacity={0.75} />
            </g>
          )}
          {/* Garden path, fence and flowers */}
          <path d="M1240,862 C1180,930 980,980 760,1100 L900,1100 C1060,1000 1220,950 1280,862 Z" fill="#a39a88" opacity={0.75} filter="url(#brush)" />
          <g stroke="#3a2b24" strokeWidth={2}>
            {Array.from({ length: 34 }, (_, i) => {
              const x = 40 + i * 52;
              if (x > 900 && x < 1060) return null;
              return <rect key={i} x={x} y={900} width={14} height={70} fill="#8a6a4a" />;
            })}
            <path d="M40,920 L900,920 M1060,920 L1880,920 M40,950 L900,950 M1060,950 L1880,950" stroke="#6b4a32" strokeWidth={6} />
          </g>
          <Flowers f={f} wind={wind} />
          {/* Old tree framing the left side */}
          <g transform={`translate(${pan(1.2)} 0)`}>
            <path d="M230,1100 C270,800 250,520 300,300 L390,310 C350,520 370,800 390,1100 Z" fill="#3a2c22" filter="url(#brush)" />
            <path d="M330,1100 C350,800 340,540 380,320 L390,310 C350,520 370,800 390,1100 Z" fill="#54402f" />
            <g transform={`translate(${330 + wind * 8} 200)`}>
              <Cloud id="house-tree" puffs={puffsFor(120, 9, 760)} palette={FOLIAGE} />
            </g>
          </g>
          <Motes f={f} count={18} box={[400, 500, 1400, 500]} seed={4} color="#d8ff9a" />
          <g transform={`translate(${fx + tap} ${fy + (arrive >= 1 ? 0 : Math.sin(arrive * Math.PI * 6) * 8)}) scale(1.3)`}>
            <Fairy f={f} pose={arrive >= 1 ? "stand" : "fly"} holding={mode === "opening" ? "bottle" : "flower"} glow={0.4} />
          </g>
        </>
      );
    }}
  </PaintedShot>
);
