import type { Caption } from "@remotion/captions";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const plumTiming = timingData as Timing;
export type PlumCaptions = Record<string, Caption[]>;

/** A scorched plain under a merciless sun; the cool variant marks the water. */
export const Wilds = ({ scorch = true }: { scorch?: boolean }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: scorch
            ? "linear-gradient(180deg,#f2d99c 0%,#f5e2b4 30%,#ecd0a2 58%,#dfbd8a 100%)"
            : "linear-gradient(180deg,#d8e6c9 0%,#e6eec9 30%,#e9ddae 58%,#dcc598 100%)",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.035], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 90,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: scorch ? "#e8792f" : "#f0cf6e",
          boxShadow: scorch ? "0 0 90px 30px #e8792f40" : "none",
          opacity: 0.9,
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
        aria-hidden="true"
      >
        <path
          d="M0 660 Q420 600 860 640 Q1340 682 1920 630 L1920 820 L0 820Z"
          fill="#d9bd85"
        />
        <path
          d="M0 820 Q560 770 1120 810 Q1560 842 1920 800 L1920 1080 L0 1080Z"
          fill="#cfaf77"
        />
        <path
          d="M0 930 Q480 900 960 925 Q1440 950 1920 915"
          stroke="#c3a267"
          strokeWidth="10"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M0 930 Q480 900 960 925 Q1440 950 1920 915"
          stroke="#f5e6c4"
          strokeWidth="4"
          strokeDasharray="42 30"
          fill="none"
        />
        <path
          d="M0 1035 Q520 1005 1040 1030 Q1520 1052 1920 1020"
          stroke="#c3a267"
          strokeWidth="8"
          fill="none"
          opacity="0.4"
        />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #fff8e9e8 0%, #fff8e950 22%, transparent 45%, transparent 76%, #fff8e9 94%)",
        }}
      />
    </>
  );
};

/** 曹操: helmet with plume, cape, and a riding crop he can raise. */
export const General = ({
  x,
  y,
  scale = 1,
  pointing = false,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  pointing?: boolean;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breath = Math.sin((frame / fps) * 1.1) * 2;
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
        aria-label="曹操"
      >
        <ellipse cx="190" cy="540" rx="120" ry="14" fill="#77583a" opacity="0.16" />
        {/* 风衣 */}
        <path
          d="M96 330 Q86 470 96 530 Q150 545 190 540 Q240 545 292 530 Q300 470 288 330 Q240 300 190 302 Q140 300 96 330Z"
          fill="#7c4a2e"
        />
        <path d="M170 310 Q176 430 172 538 Q190 542 208 538 Q204 430 210 310Z" fill="#93583a" />
        <path d="M96 330 Q60 460 52 540 Q70 548 84 542 Q92 460 118 336Z" fill="#653c26" />
        <path d="M288 330 Q330 470 338 540 Q320 548 306 542 Q298 470 268 336Z" fill="#653c26" />
        <path d="M96 330 Q140 302 190 302 L190 330 Q140 330 96 338Z" fill="#8d5433" />
        {/* 护胸 */}
        <path
          d="M128 316 Q190 292 252 316 L246 392 Q190 412 134 392Z"
          fill="#3f2f23"
        />
        <path d="M190 300 L190 408" stroke="#8a6a4f" strokeWidth="4" />
        <circle cx="190" cy="318" r="10" fill="#c9a45a" />
        {/* 手臂与马鞭 */}
        <g>
          <path
            d={pointing ? "M138 340 Q100 322 66 286" : "M138 340 Q104 356 84 396"}
            fill="none"
            stroke="#7c4a2e"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d={pointing ? "M74 300 L18 268" : "M90 404 L60 452"}
            fill="none"
            stroke="#5a3a26"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M242 340 Q280 356 288 400"
          fill="none"
          stroke="#7c4a2e"
          strokeWidth="26"
          strokeLinecap="round"
        />
        {/* 头 */}
        <g transform="translate(0 0)">
          <circle cx="190" cy="230" r="52" fill="#e8b98a" />
          <path d="M144 210 Q190 168 236 210 Q236 180 190 160 Q144 180 144 210Z" fill="#3f2f23" />
          <path d="M138 214 Q190 258 242 214 Q244 236 190 248 Q136 236 138 214Z" fill="#4a3728" />
          <path d="M190 176 Q188 140 178 118 Q206 130 210 168Z" fill="#b03a2e" />
          <path d="M204 172 Q210 138 226 124 Q228 152 216 178Z" fill="#c0453a" opacity="0.8" />
          <path d="M164 224 Q172 220 180 226" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M200 224 Q208 220 216 226" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M182 244 Q190 250 198 244" stroke="#8a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M156 246 Q150 256 158 262" stroke="#8a5a3a" strokeWidth="4" fill="none" />
          <path d="M224 246 Q230 256 222 262" stroke="#8a5a3a" strokeWidth="4" fill="none" />
        </g>
      </svg>
    </div>
  );
};

/** A file of soldiers: spears, helmets, tired optional. */
export const Soldiers = ({
  x,
  y,
  scale = 1,
  tired = false,
  count = 4,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  tired?: boolean;
  count?: number;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const step = tired ? 0 : Math.sin((frame / fps) * 5 - i * 1.1) * 6;
        const slump = tired ? 26 : 0;
        return (
          <svg
            key={i}
            width={190 * scale}
            height={400 * scale}
            viewBox="0 0 190 400"
            style={{
              position: "absolute",
              left: i * 150 * scale,
              top: (i % 2) * 30 * scale,
              opacity: i === 0 ? 1 : 0.92 - i * 0.04,
              transform: `translateY(${step}px) rotate(${tired ? 6 : 0}deg)`,
              transformOrigin: "50% 95%",
            }}
            aria-hidden="true"
          >
            <ellipse cx="95" cy="386" rx="52" ry="8" fill="#77583a" opacity="0.14" />
            <path d="M62 200 Q92 176 128 200 L124 330 Q95 344 66 330Z" fill="#6b5a3f" />
            <path d="M62 200 Q92 176 128 200 L126 226 Q92 240 64 226Z" fill="#7c684a" />
            <circle cx="95" cy="140" r="40" fill={tired ? "#d8a678" : "#e8b98a"} />
            <path d="M58 122 Q95 92 132 122 Q132 100 95 84 Q58 100 58 122Z" fill="#4a3728" />
            <path d="M52 126 Q95 156 138 126 Q140 144 95 154 Q50 144 52 126Z" fill="#5a4530" />
            {tired ? (
              <>
                <path d="M84 140 Q95 146 106 140" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M74 156 Q95 170 116 156" stroke="#8a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M84 138 Q95 134 106 138" stroke="#3b2f26" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M80 156 Q95 162 110 156" stroke="#8a5a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            )}
            <g transform={`translate(0 ${slump})`}>
              <path d="M66 210 Q44 244 40 268" fill="none" stroke="#6b5a3f" strokeWidth="18" strokeLinecap="round" />
              <path d="M124 210 Q148 240 152 266" fill="none" stroke="#6b5a3f" strokeWidth="18" strokeLinecap="round" />
            </g>
            <g stroke="#4c3b28" strokeWidth="12" strokeLinecap="round">
              <path d="M78 336 L70 380" />
              <path d="M112 336 L118 380" />
            </g>
            <path d="M152 90 L152 250" stroke="#8a6a4f" strokeWidth="7" strokeLinecap="round" />
            <path d="M152 90 L138 112 L152 96 L166 112 Z" fill="#9aa5ad" />
          </svg>
        );
      })}
    </div>
  );
};

/** The promised plum grove, fading in from the horizon. */
export const PlumGrove = ({
  x,
  y,
  scale = 1,
  appear = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  appear?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity: appear,
    }}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <svg
        key={i}
        width={300 * scale}
        height={330 * scale}
        viewBox="0 0 300 330"
        style={{ position: "absolute", left: i * 190 * scale, top: (i % 2) * 26 * scale }}
        aria-hidden="true"
      >
        <path d="M150 330 L150 210" stroke="#7c5334" strokeWidth="16" />
        <path d="M150 240 Q120 220 96 226 M150 226 Q180 206 210 214" stroke="#7c5334" strokeWidth="10" fill="none" />
        <ellipse cx="150" cy="150" rx="110" ry="86" fill="#7f9a5f" />
        <ellipse cx="104" cy="130" rx="60" ry="44" fill="#8fae67" opacity="0.85" />
        <ellipse cx="196" cy="126" rx="56" ry="42" fill="#6f8f52" opacity="0.8" />
        {[
          [110, 120],
          [150, 96],
          [190, 140],
          [86, 160],
          [214, 168],
          [150, 176],
          [124, 190],
          [180, 104],
        ].map(([cx, cy], j) => (
          <g key={j}>
            <circle cx={cx} cy={cy} r="13" fill="#b03a4a" />
            <circle cx={cx - 4} cy={cy - 4} r="4.5" fill="#e8a5ae" opacity="0.8" />
          </g>
        ))}
      </svg>
    ))}
  </div>
);

/** One big mouth-watering plum. */
export const Plum = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <svg
    width={220 * scale}
    height={220 * scale}
    viewBox="0 0 220 220"
    style={{ position: "absolute", left: x, top: y }}
    aria-label="酸甜的梅子"
  >
    <path d="M110 30 Q104 16 92 12 Q96 28 108 36" fill="#7f9a5f" />
    <path d="M110 34 Q120 18 134 14 Q130 32 116 40" fill="#8fae67" />
    <path d="M104 36 Q112 60 110 74" stroke="#7c5334" strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="110" cy="128" r="82" fill="#b03a4a" />
    <path d="M60 92 Q84 52 128 56 Q96 70 78 104Z" fill="#c94f5c" />
    <ellipse cx="78" cy="88" rx="16" ry="10" fill="#e8a5ae" opacity="0.75" />
  </svg>
);

/** Water at last: a river shimmering at the road's end. */
export const River = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shimmer = Math.sin((frame / fps) * 1.4);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      <path
        d="M1080 900 Q1300 860 1560 890 Q1760 912 1920 880 L1920 1080 L1040 1080 Q1030 960 1080 900Z"
        fill="#8fbed0"
      />
      <path
        d="M1140 920 Q1330 894 1540 916 Q1720 934 1900 908"
        stroke="#cfe9ef"
        strokeWidth="10"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M1200 960 Q1360 940 1500 958 Q1650 976 1880 950"
        stroke="#cfe9ef"
        strokeWidth="8"
        fill="none"
        opacity={0.5 + shimmer * 0.2}
      />
    </svg>
  );
};

/** Heat haze lines rising from the ground. */
export const Heat = ({ x, y }: { x: number; y: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {[0, 1, 2].map((i) => {
        const t = ((frame / fps) * 0.5 + i * 0.33) % 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 70,
              top: -t * 90,
              width: 56,
              height: 10,
              borderRadius: 5,
              background: "#f2d99c",
              opacity: (1 - t) * 0.7,
            }}
          />
        );
      })}
    </div>
  );
};
