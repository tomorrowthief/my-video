import type { Caption } from "@remotion/captions";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import timingData from "./timing.json";
import type { Timing } from "../types";
import { clamp } from "../idioms/StoryArt";

export const foxTiming = timingData as Timing;
export type FoxCaptions = Record<string, Caption[]>;

/** Layered forest light; the deep variant dims it for the tiger's entrance. */
export const Forest = ({ deep = false }: { deep?: boolean }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dim = interpolate(frame, [0, durationInFrames], [deep ? 0.75 : 0.35, deep ? 0.5 : 0.2], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#dcecd3 0%,#e6efd0 26%,#efe6c0 52%,#e3d5a8 100%)",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.035], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 300,
          top: 110,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#f4d17a",
          opacity: 0.85,
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
          d="M0 640 Q260 560 520 630 Q780 700 1080 620 Q1380 545 1920 635 L1920 820 L0 820Z"
          fill="#bcd2a0"
          opacity="0.8"
        />
        <path
          d="M0 760 Q480 700 960 745 Q1440 790 1920 750 L1920 1080 L0 1080Z"
          fill="#c9c289"
          opacity="0.9"
        />
        {[
          { x: 120, h: 260, o: 0.5 },
          { x: 420, h: 200, o: 0.35 },
          { x: 700, h: 300, o: 0.5 },
          { x: 1020, h: 220, o: 0.3 },
          { x: 1330, h: 280, o: 0.45 },
          { x: 1650, h: 210, o: 0.35 },
        ].map(({ x, h, o }) => (
          <g key={x} opacity={o}>
            <rect x={x} y={820 - h} width="26" height={h} fill="#6d7f57" />
            <ellipse cx={x + 13} cy={820 - h} rx={h * 0.62} ry={h * 0.7} fill="#7f9a5f" />
            <ellipse cx={x + 13} cy={820 - h - h * 0.3} rx={h * 0.42} ry={h * 0.44} fill="#8fae67" />
          </g>
        ))}
      </svg>
      <AbsoluteFill style={{ background: "#4a5a35", opacity: dim, mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #fff8e9e8 0%, #fff8e950 22%, transparent 45%, transparent 76%, #fff8e9 94%)",
        }}
      />
    </>
  );
};

/** The fox: proud, scheming, or strutting. */
export const Fox = ({
  x,
  y,
  scale = 1,
  mode = "stand",
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  mode?: "stand" | "strut" | "scheme";
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sway = mode === "strut" ? Math.sin((frame / fps) * 3.2) * 6 : 0;
  const headTilt = mode === "scheme" ? -10 : sway * 0.8;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${flip ? "scaleX(-1) " : ""}rotate(${sway * 0.4}deg)`,
        transformOrigin: "50% 90%",
      }}
    >
      <svg
        width={330 * scale}
        height={230 * scale}
        viewBox="0 0 330 230"
        aria-label="狐狸"
      >
        <ellipse cx="165" cy="214" rx="100" ry="12" fill="#77583a" opacity="0.15" />
        {mode === "strut" ? (
          <path
            d="M40 150 Q10 170 6 198 Q30 196 44 182"
            fill="#d97e3a"
            stroke="#b5622a"
            strokeWidth="3"
          />
        ) : null}
        <path
          d="M56 190 Q60 130 118 112 Q170 98 212 116 Q244 132 240 168 Q236 196 196 202 Q130 212 84 202 Q60 198 56 190Z"
          fill="#d97e3a"
        />
        <path d="M150 200 Q160 226 190 224 Q186 204 178 198Z" fill="#b5622a" opacity="0.4" />
        <path
          d="M76 176 Q84 186 108 190 Q90 168 76 176Z"
          fill="#f6e3c9"
        />
        <g transform={`rotate(${headTilt} 250 108)`}>
          <path
            d="M212 116 Q236 100 268 96 Q284 94 288 104 Q280 124 258 132 Q234 138 214 130Z"
            fill="#d97e3a"
          />
          <path d="M262 98 Q276 96 282 102 Q274 112 260 112Z" fill="#f6e3c9" />
          <path d="M218 92 Q216 64 230 48 Q242 68 234 94Z" fill="#c96f31" />
          <path d="M238 94 Q244 62 258 50 Q262 74 250 98Z" fill="#d97e3a" />
          <path d="M224 92 Q226 76 232 68" stroke="#8a4d1e" strokeWidth="2.5" fill="none" />
          <circle cx="272" cy="106" r="4" fill="#3b2f26" />
          <path d="M286 108 Q296 110 298 114" stroke="#8a4d1e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {mode === "scheme" ? (
            <g>
              <circle cx="268" cy="104" r="9" fill="none" stroke="#3b2f26" strokeWidth="2.5" />
              <path d="M259 100 Q268 96 277 100" stroke="#3b2f26" strokeWidth="2.5" fill="none" />
            </g>
          ) : null}
        </g>
        <g transform={`rotate(${-sway} 90 200)`}>
          <path
            d="M52 192 Q16 176 8 138 Q2 106 18 88 Q36 120 54 148 Q64 168 62 186Z"
            fill="#e08a44"
          />
          <path d="M14 92 Q6 112 10 136 Q20 122 26 106Z" fill="#f6e3c9" />
        </g>
        <g stroke="#b5622a" strokeWidth="9" strokeLinecap="round">
          <path d="M96 202 L88 222" />
          <path d="M126 206 L122 226" />
          <path d="M186 206 L190 226" />
          <path d="M216 200 L226 220" />
        </g>
      </svg>
    </div>
  );
};

/** The tiger: prowling, trailing, or stunned. */
export const Tiger = ({
  x,
  y,
  scale = 1,
  mode = "stand",
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  mode?: "stand" | "prowl" | "shocked";
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = Math.sin((frame / fps) * 1.2) * 3;
  const low = mode === "prowl" ? 26 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${flip ? "scaleX(-1) " : ""}translateY(${low}px)`,
        transformOrigin: "50% 90%",
      }}
    >
      <svg
        width={520 * scale}
        height={340 * scale}
        viewBox="0 0 520 340"
        aria-label="老虎"
      >
        <ellipse cx="260" cy="326" rx="170" ry="16" fill="#77583a" opacity="0.18" />
        <path
          d="M96 280 Q84 190 160 162 Q250 130 340 150 Q420 168 436 230 Q442 272 400 292 Q300 316 180 300 Q112 292 96 280Z"
          fill="#e8963f"
        />
        <path d="M150 168 Q170 236 160 292 Q185 296 205 294 Q226 232 214 162Z" fill="#f6e3c9" opacity="0.7" />
        <g fill="#5b3d1e">
          <path d="M200 156 Q206 190 198 224 Q210 190 214 158Z" />
          <path d="M256 142 Q262 186 254 238 Q268 186 272 144Z" />
          <path d="M312 148 Q318 192 310 240 Q324 192 328 150Z" />
          <path d="M368 158 Q374 196 366 236 Q380 196 384 160Z" />
        </g>
        <g transform={`translate(0 ${-breathe})`}>
          <path
            d="M340 152 Q400 116 452 122 Q470 124 468 136 Q462 158 430 172 Q392 186 352 176Z"
            fill="#e8963f"
          />
          <path d="M446 126 Q462 128 464 138 Q454 148 440 146Z" fill="#f6e3c9" />
          <path d="M364 118 Q360 84 376 62 Q392 90 382 120Z" fill="#d9822f" />
          <path d="M394 120 Q398 82 416 66 Q420 96 406 124Z" fill="#e8963f" />
          <path d="M368 114 Q372 98 378 90" stroke="#5b3d1e" strokeWidth="3" fill="none" />
          {mode === "shocked" ? (
            <>
              <circle cx="426" cy="134" r="11" fill="none" stroke="#3b2f26" strokeWidth="4" />
              <circle cx="454" cy="136" r="11" fill="none" stroke="#3b2f26" strokeWidth="4" />
              <path d="M470 150 Q484 152 488 156" stroke="#5b3d1e" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="428" cy="134" r="5" fill="#3b2f26" />
              <circle cx="456" cy="136" r="5" fill="#3b2f26" />
              <path d="M472 148 Q486 150 490 154" stroke="#5b3d1e" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          )}
          <g fill="#5b3d1e">
            <path d="M376 132 Q380 138 374 142 Q370 136 376 132Z" />
            <path d="M400 130 Q404 136 398 140 Q394 134 400 130Z" />
            <path d="M440 160 Q444 166 438 170 Q434 164 440 160Z" />
            <path d="M462 162 Q466 168 460 172 Q456 166 462 162Z" />
          </g>
        </g>
        <g fill="#d9822f">
          <path d="M90 268 Q30 240 22 196 Q18 168 34 156 Q46 190 62 218 Q80 248 96 262Z" />
          <path d="M30 162 Q22 190 26 218 Q40 200 48 180Z" fill="#e8963f" />
          <path d="M34 164 Q28 186 30 210" stroke="#5b3d1e" strokeWidth="3" fill="none" />
        </g>
        <g stroke="#c9722c" strokeWidth="16" strokeLinecap="round">
          <path d="M140 288 L130 322" />
          <path d="M196 294 L192 326" />
          <path d="M320 296 L326 328" />
          <path d="M382 288 L396 320" />
        </g>
      </svg>
    </div>
  );
};

/** Fleeing bystanders: deer, boar and rabbit silhouettes. */
export const Fleeing = ({
  x,
  y,
  scale = 1,
  kind,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  kind: "deer" | "boar" | "rabbit";
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bob = Math.abs(Math.sin((frame / fps) * 8)) * 14;
  const shapes = {
    deer: {
      fill: "#a8815e",
      body: "M40 120 Q52 74 108 62 Q160 52 190 74 Q206 88 200 112 Q192 134 150 140 Q96 146 60 138 Q44 132 40 120Z",
      extra:
        "M172 74 Q186 44 178 20 Q198 40 200 70 M196 82 Q212 58 220 42 Q224 64 208 86",
      legs: "M70 138 L62 176 M96 142 L92 180 M150 140 L156 178 M180 132 L190 168",
      head: "M186 66 Q212 50 228 56 Q234 64 224 74 Q206 82 190 78Z",
    },
    boar: {
      fill: "#8a6a4f",
      body: "M30 116 Q40 76 100 66 Q170 56 210 82 Q228 98 220 120 Q208 142 150 148 Q86 152 48 140 Q32 130 30 116Z",
      extra: "M60 70 L52 52 M80 66 L76 48 M104 62 L104 44",
      legs: "M62 146 L56 180 M100 150 L98 184 M160 148 L166 182 M196 138 L204 172",
      head: "M200 84 Q230 76 244 88 Q242 102 222 106 Q204 104 198 96Z",
    },
    rabbit: {
      fill: "#b7a18c",
      body: "M30 130 Q38 92 88 84 Q130 78 152 96 Q164 110 156 128 Q144 146 100 150 Q58 152 38 144 Q30 138 30 130Z",
      extra: "M140 88 Q134 58 148 44 Q158 66 152 90 M154 90 Q162 64 176 56 Q176 82 160 96",
      legs: "M60 148 L54 176 M98 150 L96 178 M148 146 L154 174",
      head: "M144 92 Q162 74 178 80 Q180 92 166 100 Q152 102 144 98Z",
    },
  } as const;
  const s = shapes[kind];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - bob,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <svg width={280 * scale} height={220 * scale} viewBox="0 0 280 220" aria-hidden="true">
        <path d={s.body} fill={s.fill} />
        <path d={s.head} fill={s.fill} />
        <path d={s.extra} fill="none" stroke={s.fill} strokeWidth="7" strokeLinecap="round" />
        <path d={s.legs} fill="none" stroke={s.fill} strokeWidth="8" strokeLinecap="round" />
        <circle cx={kind === "deer" ? 218 : kind === "boar" ? 234 : 172} cy={kind === "deer" ? 64 : kind === "boar" ? 90 : 84} r="3.5" fill="#3b2f26" />
      </svg>
    </div>
  );
};

/** Motion streaks for the fleeing crowd. */
export const DustStreaks = ({ x, y }: { x: number; y: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = (frame / fps) * 90;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((drift + i * 60) % 180) - 90,
            top: i * 46,
            width: 120,
            height: 8,
            borderRadius: 4,
            background: "#c9b98a",
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
};
