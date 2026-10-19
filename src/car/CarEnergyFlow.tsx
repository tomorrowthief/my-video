import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Folder,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CarScene, DRIVE_COLOR, REGEN_COLOR, type CarPhase } from "./CarScene";
import timingData from "./timing.json";
import type { Timing } from "../types";

const timing = timingData as Timing;
const FONT = '"PingFang SC", "Microsoft YaHei", sans-serif';
const COPY: Record<
  CarPhase,
  { title: string; explanation: string; tag: string; focus: number }
> = {
  intro: {
    title: "一束能量，\n如何让车前进？",
    explanation: "打开一辆电动汽车\n沿着动力路径，认识它的核心部件。",
    tag: "从外形，看进内部",
    focus: -1,
  },
  battery: {
    title: "动力电池\n车底的能量仓库",
    explanation:
      "电池储存电能，提供直流电。\n加速踏板提出请求，控制系统分配动力。",
    tag: "储能 → 供电",
    focus: 0,
  },
  inverter: {
    title: "逆变器\n给电机合适的电",
    explanation: "将直流电转换为交流电，\n调节电流，控制电机产生的转矩。",
    tag: "直流电 DC → 交流电 AC",
    focus: 1,
  },
  drive: {
    title: "电机与传动\n把电变成转矩",
    explanation:
      "电机产生转矩，经减速与差速传动，\n带动车轮，再通过轮胎与地面作用前进。",
    tag: "电能 → 机械能",
    focus: 2,
  },
  regen: {
    title: "再生制动\n让能量往回走",
    explanation:
      "车轮带动电机发电，回充电池。\n只能回收部分动能，仍需摩擦制动。",
    tag: "部分动能 → 电能",
    focus: 3,
  },
  recap: {
    title: "看懂两个方向\n就看懂电驱主线",
    explanation: "驱动时，电池把能量送向车轮。\n回收时，一部分能量返回电池。",
    tag: "一条主线 · 两种方向",
    focus: -1,
  },
};

const EnergyMap = ({
  phase,
  seconds,
}: {
  phase: CarPhase;
  seconds: number;
}) => {
  const reverse = phase === "regen";
  const color = reverse ? REGEN_COLOR : DRIVE_COLOR;
  const focus = COPY[phase].focus;
  const items = [
    { title: "动力电池", subtitle: "储存电能 · 直流输出", symbol: "01" },
    {
      title: "逆变器",
      subtitle: reverse ? "电力转换 · 回充控制" : "直流 → 交流 · 调节转矩",
      symbol: "02",
    },
    {
      title: reverse ? "电机发电" : "驱动电机",
      subtitle: reverse ? "机械能 → 电能" : "电能 → 机械能",
      symbol: "03",
    },
    {
      title: "车轮与道路",
      subtitle: reverse ? "提供部分可回收动能" : "机械传动 · 牵引前进",
      symbol: "04",
    },
  ];
  return (
    <div style={{ position: "absolute", left: 84, right: 84, top: 808 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          color: "#829bad",
          fontSize: 20,
          letterSpacing: "0.07em",
        }}
      >
        <span>能量流动图</span>
        <span style={{ color }}>
          {reverse ? "← 再生制动：回收方向" : "驱动方向：电池 → 车轮"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {items.map((item, i) => {
          const active = focus === i || focus < 0 || reverse;
          return (
            <div key={item.symbol} style={{ display: "contents" }}>
              {i > 0 && (
                <svg
                  width={118}
                  height={78}
                  viewBox="0 0 118 78"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M 13 39 H 105"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.3}
                  />
                  <path
                    d={
                      reverse
                        ? "M 26 31 L 14 39 L 26 47"
                        : "M 92 31 L 104 39 L 92 47"
                    }
                    stroke={color}
                    strokeWidth={2}
                    fill="none"
                  />
                  {[0, 1, 2].map((j) => {
                    const t = (seconds * 0.45 + j / 3) % 1;
                    return (
                      <circle
                        key={j}
                        cx={reverse ? 105 - t * 92 : 13 + t * 92}
                        cy={39}
                        r={3.8}
                        fill={color}
                      />
                    );
                  })}
                </svg>
              )}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 104,
                  borderRadius: 14,
                  boxSizing: "border-box",
                  padding: "18px 22px",
                  border: `1px solid ${active ? `${color}88` : "#2a4052"}`,
                  background: active ? `${color}0c` : "#152432",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    color: active ? "#edfaf8" : "#a7b9c7",
                    fontSize: 29,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      color,
                      fontSize: 17,
                      fontFamily: "monospace",
                      opacity: active ? 1 : 0.5,
                    }}
                  >
                    {item.symbol}
                  </span>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: active ? "#a1bec8" : "#6f8b9e",
                    marginTop: 9,
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Narration = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {timing.scenes.map((scene) =>
        scene.paragraphs.map((p) =>
          p.file ? (
            <Sequence
              key={`${scene.id}-${p.index}`}
              name={`${scene.title} · 旁白 ${p.index + 1}`}
              from={scene.startFrame + p.startFrame}
              durationInFrames={p.durationInFrames}
              premountFor={fps}
            >
              <Audio src={staticFile(`audio-car/${p.file}`)} />
            </Sequence>
          ) : null,
        ),
      )}
    </>
  );
};

export const CarEnergyFlow = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sceneIndex = Math.max(
    0,
    timing.scenes.findIndex(
      (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames,
    ),
  );
  const scene = timing.scenes[sceneIndex];
  const phase = (scene?.id ?? "intro") as CarPhase;
  const copy = COPY[phase];
  const local = frame - (scene?.startFrame ?? 0);
  const color = phase === "regen" ? REGEN_COLOR : DRIVE_COLOR;
  const entry = spring({
    frame: local,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const introEnd = timing.scenes[0]?.durationInFrames ?? fps * 10;
  const recapStart =
    timing.scenes[5]?.startFrame ?? durationInFrames - fps * 12;
  const explode = interpolate(
    frame,
    [
      fps * 2.8,
      introEnd - fps * 0.6,
      recapStart + fps * 3,
      durationInFrames - fps * 1.5,
    ],
    [0, 1, 1, 0.38],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const paragraph = scene?.paragraphs.find(
    (p) => local >= p.startFrame && local < p.startFrame + p.durationInFrames,
  );
  const captionOpacity = paragraph
    ? interpolate(
        local - paragraph.startFrame,
        [0, 5, paragraph.durationInFrames - 5, paragraph.durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 16, durationInFrames - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: "#0b1521",
        color: "#edf6fc",
        fontFamily: FONT,
        opacity,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 74% 42%, #173344 0%, #0c1927 48%, #0b1521 78%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 84,
          right: 84,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#a9c0d1",
            letterSpacing: "0.1em",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
          汽车原理 / 电驱系统
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {timing.scenes.map((s, i) => (
            <div
              key={s.id}
              style={{
                width: 54,
                height: 3,
                background: i <= sceneIndex ? color : "#2c4052",
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 122,
          left: 84,
          fontSize: 43,
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        能量，如何驱动一辆车？
      </div>
      <div
        style={{
          position: "absolute",
          top: 232,
          left: 84,
          width: 565,
          opacity: entry,
          transform: `translateY(${(1 - entry) * 18}px)`,
        }}
      >
        <div
          style={{
            color,
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              border: `1px solid ${color}66`,
              padding: "7px 10px",
              borderRadius: 5,
            }}
          >
            {String(sceneIndex + 1).padStart(2, "0")}
          </span>
          <span>{scene?.title ?? "打开汽车"}</span>
        </div>
        <div
          style={{
            fontSize: 57,
            fontWeight: 650,
            lineHeight: 1.43,
            letterSpacing: "-0.025em",
            whiteSpace: "pre-line",
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            color: "#91aabd",
            fontSize: 25,
            lineHeight: 1.85,
            marginTop: 28,
            whiteSpace: "pre-line",
          }}
        >
          {copy.explanation}
        </div>
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            background: `${color}0c`,
            borderLeft: `3px solid ${color}`,
            padding: "12px 18px",
            color,
            fontSize: 23,
          }}
        >
          {copy.tag}
        </div>
        <div style={{ marginTop: 35, color: "#607c91", fontSize: 18 }}>
          单电机前驱示意 · 布局因车型而异
        </div>
      </div>
      <CarScene frame={frame} phase={phase} explode={explode} />
      <div
        style={{
          position: "absolute",
          right: 105,
          top: 192,
          color: "#7595aa",
          fontSize: 17,
          letterSpacing: "0.08em",
        }}
      >
        三维结构 / 能量方向示意
      </div>
      <EnergyMap phase={phase} seconds={frame / fps} />
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 981,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 29,
          color: "#d2e5ef",
          opacity: captionOpacity,
        }}
      >
        {paragraph?.text ?? ""}
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          bottom: 25,
          height: 2,
          background: "#203344",
        }}
      >
        <div
          style={{
            width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>
      <Narration />
    </AbsoluteFill>
  );
};

export const CarCompositions = () => (
  <Folder name="Automotive">
    <Composition
      id="CarEnergyFlow"
      component={CarEnergyFlow}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={timing.totalFrames}
    />
  </Folder>
);
