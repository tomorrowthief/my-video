import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import timing from "./timing.json";
export const dreamTiming = timing;
const ink = "#15243f",
  gold = "#f9d887";
export const Fairy = ({
  x = 0,
  y = 0,
  scale = 1,
  sleep = false,
}: {
  x?: number;
  y?: number;
  scale?: number;
  sleep?: boolean;
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    stroke={ink}
    strokeWidth="5"
    strokeLinejoin="round"
  >
    <ellipse
      cx="-62"
      cy="-10"
      rx="48"
      ry="78"
      fill="#b6d8d8"
      fillOpacity=".65"
      transform="rotate(-35 -62 -10)"
    />
    <ellipse
      cx="60"
      cy="-15"
      rx="43"
      ry="73"
      fill="#e1d5ed"
      fillOpacity=".65"
      transform="rotate(35 60 -15)"
    />
    <path d="M-43 35 Q-72 98 -60 145 Q0 164 65 141 L44 35" fill="#709b8b" />
    <path
      d="M-32 141 l-13 34 m74-34 17 32"
      fill="none"
      strokeWidth="13"
      strokeLinecap="round"
    />
    <path
      d="M-49 65 Q-90 80 -102 57 M48 62 Q76 91 100 60"
      fill="none"
      stroke="#edbe9d"
      strokeWidth="17"
      strokeLinecap="round"
    />
    <path d="M-48-55 L-85-80 -62-20 M47-55 82-80 62-20" fill="#edbe9d" />
    <ellipse cy="-20" rx="61" ry="64" fill="#f1ccb0" />
    <path
      d="M-67-51 Q-57-103 25-127 L76-108 28-92 Q65-82 65-43 Q-5-77-67-51"
      fill="#719b8a"
    />
    <path d="M25-127 76-108 57-101" fill="#a8b39a" />
    {sleep ? (
      <path
        d="M-33-19q12 10 23 0 M12-19q12 10 23 0"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <>
        <ellipse cx="-23" cy="-20" rx="5" ry="8" fill={ink} />
        <ellipse cx="24" cy="-20" rx="5" ry="8" fill={ink} />
      </>
    )}
    <ellipse cx="-38" cy="0" rx="13" ry="7" fill="#db9492" stroke="none" />
    <ellipse cx="38" cy="0" rx="13" ry="7" fill="#db9492" stroke="none" />
    <path d="M-10 14q10 9 20 0" fill="none" strokeWidth="3" />
    <path d="M-16 46 0 65 18 45" fill="#e6d99b" />
    <circle cy="87" r="5" fill={gold} />
  </g>
);
export const Girl = ({
  x = 0,
  y = 0,
  scale = 1,
}: {
  x?: number;
  y?: number;
  scale?: number;
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    stroke={ink}
    strokeWidth="5"
    strokeLinejoin="round"
  >
    <path d="M-61-20Q-85-110 0-106 91-104 63 16L-69 17" fill="#44344b" />
    <path
      d="M-33 134 -34 175 M32 134 37 175"
      stroke="#e8b899"
      strokeWidth="18"
      strokeLinecap="round"
    />
    <path
      d="M-34 170 -57 180 M38 170 59 179"
      stroke="#a65759"
      strokeWidth="17"
      strokeLinecap="round"
    />
    <path d="M-42 35 -70 139 Q0 159 72 139 L42 35" fill="#d39893" />
    <path
      d="M-44 53 -91 104 M43 54 88 94"
      stroke="#e9bf9e"
      strokeWidth="17"
      strokeLinecap="round"
    />
    <ellipse cy="-23" rx="57" ry="62" fill="#f3cfaf" />
    <path
      d="M-62-36Q-65-101 6-96 61-95 63-39L21-70-6-45-16-65-54-30"
      fill="#44344b"
    />
    <circle cx="-21" cy="-18" r="5" fill={ink} />
    <circle cx="23" cy="-18" r="5" fill={ink} />
    <path d="M-11 9q12 13 25 0" fill="none" strokeWidth="3" />
    <circle cx="-38" cy="1" r="9" fill="#e4a099" stroke="none" />
    <circle cx="40" cy="1" r="9" fill="#e4a099" stroke="none" />
    <path d="M-21 39 0 64 23 38" fill="#f5e5c4" />
    <path d="M29-83q15-20 25-3-8 15-25 3" fill="#e6bb71" />
  </g>
);
export const Bottle = ({
  x,
  y,
  scale = 1,
  color = gold,
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cy="24" r="82" fill={color} opacity=".06" />
    <circle cy="24" r="58" fill={color} opacity=".09" />
    <path
      d="M-16-46v27Q-44-8-43 31v43q43 17 86 0V31Q44-8 16-19v-27Z"
      fill={color}
      fillOpacity=".18"
      stroke={color}
      strokeWidth="3"
    />
    <rect x="-22" y="-57" width="44" height="17" rx="5" fill="#b99468" />
    <path
      d="M-29 21v38"
      stroke="#fff5d3"
      strokeWidth="4"
      opacity=".6"
      strokeLinecap="round"
    />
    <path
      d="m0 0 6 17 18 2-14 11 5 18-15-10-15 10 5-18-14-11 18-2Z"
      fill={color}
    />
  </g>
);
export const Whale = ({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    stroke="#7fb4c1"
    strokeWidth="4"
  >
    <path
      d="M-150 0Q-130-110 13-83 106-64 130-2L189-51 181 15 215 47 133 37Q52 131-84 73-147 48-150 0Z"
      fill="#91bbc6"
    />
    <path
      d="M-135 29Q-57 87 95 43"
      fill="none"
      stroke="#d8e5d8"
      strokeWidth="11"
    />
    <circle cx="-92" cy="-13" r="6" fill={ink} stroke="none" />
    <path d="M-16 38Q47 118 68 69" fill="#648fa5" />
    <path
      d="M-55-91q-30-51-42-24 M-55-91q5-58 30-49"
      fill="none"
      stroke="#f9d887"
      strokeLinecap="round"
    />
  </g>
);
export const DreamPage = ({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = timing.scenes[index];
  const opacity = interpolate(
    f,
    [0, 22, scene.durationInFrames - 20, scene.durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const p = scene.paragraphs.find(
    (v) => f >= v.startFrame && f < v.startFrame + v.durationInFrames + 12,
  );
  return (
    <AbsoluteFill
      style={{
        background: "#101d34",
        fontFamily: '"Songti SC", "Noto Serif CJK SC", serif',
        color: "#f7e8c8",
        opacity:
          index === 0
            ? interpolate(
                f,
                [0, scene.durationInFrames - 20, scene.durationInFrames],
                [1, 1, 0],
                { extrapolateRight: "clamp" },
              )
            : opacity,
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        width="1920"
        height="1080"
        style={{ position: "absolute" }}
      >
        <defs>
          <radialGradient id="night">
            <stop stopColor="#31415c" />
            <stop offset="1" stopColor="#111b31" />
          </radialGradient>
          <filter id="paper">
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".7"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope=".055" />
            </feComponentTransfer>
          </filter>
          <filter id="soft">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <rect width="1920" height="1080" fill="url(#night)" />
        {Array.from({ length: 65 }, (_, i) => (
          <circle
            key={i}
            cx={95 + ((i * 317) % 1740)}
            cy={70 + ((i * 139) % 720)}
            r={i % 4 === 0 ? 3 : 1.5}
            fill="#efddb6"
            opacity={0.25 + 0.3 * Math.sin(f / 35 + i) ** 2}
          />
        ))}
        <circle
          cx="1560"
          cy="195"
          r="135"
          fill={gold}
          opacity=".07"
          filter="url(#soft)"
        />
        <circle cx="1560" cy="195" r="64" fill="#f4dfad" />
        <circle cx="1586" cy="176" r="59" fill="#1c2942" />
        <path
          d="M0 788Q300 622 610 777T1250 741T1920 750V1080H0"
          fill="#1d3b49"
        />
        <path
          d="M0 862Q350 735 720 857T1400 802T1920 862V1080H0"
          fill="#142e3e"
        />
        {children}
        {Array.from({ length: 20 }, (_, i) => (
          <circle
            key={`dust${i}`}
            cx={180 + ((i * 157) % 1550) + Math.sin(f / 60 + i) * 15}
            cy={450 + ((i * 73) % 360) + Math.cos(f / 45 + i) * 12}
            r="3"
            fill={gold}
            opacity={0.2 + 0.5 * Math.sin(f / 40 + i) ** 2}
          />
        ))}
        <rect
          width="1920"
          height="1080"
          filter="url(#paper)"
          opacity=".65"
          pointerEvents="none"
        />
        <rect
          x="42"
          y="38"
          width="1836"
          height="1004"
          rx="4"
          fill="none"
          stroke="#d4bf8d"
          strokeOpacity=".2"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 68,
          fontSize: 25,
          letterSpacing: 7,
          color: "#d5c8a8",
        }}
      >
        月光故事集 · 原创童话
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 65,
          fontSize: 23,
          letterSpacing: 5,
          color: "#c3bba7",
        }}
      >
        {String(index + 1).padStart(2, "0")} / 08
      </div>
      {index !== 0 && (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 136,
            fontSize: 46,
            letterSpacing: 5,
          }}
        >
          {scene.title}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 107,
          left: 150,
          right: 150,
          textAlign: "center",
          fontSize: 38,
          lineHeight: 1.6,
          textShadow: "0 2px 12px #101d34",
          minHeight: 112,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {p?.text}
      </div>
      {scene.paragraphs.map(
        (v) =>
          v.file && (
            <Sequence
              key={v.index}
              from={v.startFrame}
              durationInFrames={v.durationInFrames}
              premountFor={fps}
            >
              <Audio src={staticFile(`audio-dream/${v.file}`)} />
            </Sequence>
          ),
      )}
    </AbsoluteFill>
  );
};
export const Forest = () => (
  <g>
    {[120, 330, 1520, 1750].map((x, i) => (
      <g key={x} transform={`translate(${x} ${(i % 2) * 80})`}>
        <path d="M0 820Q40 480 0 220L60 210Q36 540 92 830" fill="#243d4b" />
        <path
          d="M30 510-100 362 M48 403 180 276"
          stroke="#243d4b"
          strokeWidth="23"
          fill="none"
        />
        <ellipse
          cx="22"
          cy="200"
          rx="180"
          ry="240"
          fill="#294754"
          opacity=".8"
        />
      </g>
    ))}
  </g>
);
export const Window = () => (
  <g stroke="#b29b7f" strokeWidth="9">
    <path d="M345 650V280Q345 180 450 180T555 280V650Z" fill="#263950" />
    <path d="M450 185V650 M345 393H555" />
    <path d="M310 660H590" strokeWidth="19" />
  </g>
);
