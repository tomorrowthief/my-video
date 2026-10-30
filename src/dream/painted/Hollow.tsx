import { interpolate } from "remotion";
import {
  DreamBottle,
  FairyAsleep,
  GirlHead,
  Motes,
  PaintedShot,
  W,
  clamp,
  rand,
} from "./kit";

/**
 * Close-up inside the hollow oak: the fairy asleep on its moss bed, Mimi's hand and
 * sleeve beside it for scale, her face soft and out of focus behind. The bottle by
 * the bed lights up for the first time with a dream of its own: a little leaf boat.
 */
export const PaintedHollow = ({
  start = 0,
  duration,
  label,
}: {
  start?: number;
  duration: number;
  label: string;
}) => (
  <PaintedShot start={start} duration={duration} label={label} from={{ s: 1.02 }} to={{ s: 1.1, x: 30, y: -30 }}>
    {(f) => {
      const dream = interpolate(f, [40, 200], [0, 1], clamp);
      return (
        <>
          <defs>
            <radialGradient id="hollow-wood" cx="0.42" cy="0.7" r="0.8">
              <stop offset="0" stopColor="#6a4428" />
              <stop offset="0.5" stopColor="#3b2617" />
              <stop offset="1" stopColor="#170e08" />
            </radialGradient>
            <linearGradient id="hollow-night" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f2236" />
              <stop offset="1" stopColor="#2a4f52" />
            </linearGradient>
            <clipPath id="hollow-mouth">
              <ellipse cx={380} cy={250} rx={210} ry={160} />
            </clipPath>
          </defs>
          <rect width={W} height={1080} fill="url(#hollow-wood)" />
          {/* Growth rings in the hollow's walls */}
          <g filter="url(#brush)" fill="none" stroke="#25170d" strokeWidth={4} opacity={0.6}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={900} cy={760} rx={300 + i * 120} ry={200 + i * 80} />
            ))}
          </g>
          {/* The opening onto the night wood */}
          <g clipPath="url(#hollow-mouth)">
            <rect x={160} y={80} width={440} height={340} fill="url(#hollow-night)" />
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={180 + i * 74 + rand(i) * 20} y={80} width={24 + rand(i + 9) * 18} height={340} fill="#1c3540" />
            ))}
            <circle cx={500} cy={140} r={140} fill="url(#moonGlow)" />
            <Motes f={f} count={12} box={[180, 120, 400, 260]} seed={3} color="#d8ff9a" />
          </g>
          <ellipse cx={380} cy={250} rx={210} ry={160} fill="none" stroke="#4a3220" strokeWidth={30} filter="url(#brush)" />
          <circle cx={640} cy={760} r={700 * (0.6 + dream * 0.4)} fill="url(#warmGlow)" opacity={0.5 + dream * 0.4} />

          {/* Mimi, soft and out of focus behind the bed */}
          <g transform="translate(1500 340) scale(4.4)" filter="url(#defocus)" opacity={0.6}>
            <GirlHead eyes="content" />
          </g>

          {/* Moss bed */}
          <g filter="url(#brush-fine)">
            <path d="M470,900 C520,720 760,676 960,680 C1190,684 1400,720 1450,900 Z" fill="#3d6a3e" stroke="#1d3324" strokeWidth={3} />
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={i} cx={520 + rand(i + 30) * 880} cy={720 + rand(i + 60) * 160} r={8 + rand(i + 90) * 14} fill={i % 2 ? "#4f7f4f" : "#5d8f52"} />
            ))}
          </g>
          <g transform="translate(930 740) scale(3.2)">
            <FairyAsleep f={f} />
          </g>
          {/* Folded leaf blanket */}
          <path
            d="M880,780 C960,730 1140,724 1240,760 C1220,800 1120,830 990,826 C930,824 890,806 880,780 Z"
            fill="#6e9a4a"
            stroke="#23361f"
            strokeWidth={3}
          />
          <path d="M890,782 C990,770 1120,768 1236,762" fill="none" stroke="#b9dc8a" strokeWidth={2.4} />

          {/* The bottle with the fairy's own first dream inside */}
          <g transform="translate(640 860) scale(2.6)">
            <DreamBottle f={f} glow={dream}>
              <g opacity={dream} transform={`translate(0 -24) rotate(${Math.sin(f / 30) * 6})`}>
                <path d="M-16,0 C-10,8 10,8 18,-2 C20,-6 20,-10 18,-12 C16,-6 12,-4 8,-4 C0,-2 -10,-2 -16,0 Z" fill="#6e9a4a" stroke="#23361f" strokeWidth={0.8} />
                <circle cx={-12} cy={-4} r={2.6} fill="#ffb64d" stroke="none" />
                <circle cx={4} cy={-7} r={2.4} fill="#f6d9c1" stroke="none" />
                <circle cx={10} cy={-6} r={1.6} fill="#5f7d45" stroke="none" />
              </g>
            </DreamBottle>
          </g>
          {/* Mimi's hand and sleeve resting by the bed */}
          <g stroke="#3a2b2e" strokeWidth={3} strokeLinejoin="round">
            <path d="M1530,706 C1490,698 1452,702 1424,716 C1398,730 1386,750 1394,766 C1400,778 1416,782 1430,780 C1442,790 1460,792 1474,786 C1488,796 1506,796 1518,790 L1534,792 Z" fill="#f6d9c1" />
            <path d="M1430,780 C1436,766 1448,758 1462,756 M1474,786 C1478,772 1490,764 1502,762" fill="none" strokeWidth={2.2} />
            <path d="M1440,716 C1460,724 1480,724 1500,718" fill="none" stroke="#e0b89c" strokeWidth={2.4} />
            <path d="M1960,650 C1780,646 1620,664 1524,696 C1516,730 1520,770 1530,800 C1640,806 1780,812 1960,808 Z" fill="#f1e7d3" />
            <path d="M1960,744 C1780,748 1640,766 1530,800 L1960,808 Z" fill="#d6c8ad" stroke="none" />
            <path d="M1560,690 C1552,726 1554,770 1564,804" fill="none" stroke="#c9bba1" strokeWidth={2.4} />
          </g>
          <Motes f={f} count={40} box={[400, 200, 1300, 700]} seed={8} />
        </>
      );
    }}
  </PaintedShot>
);
