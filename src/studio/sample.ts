import type { StudioProject, StudioScene } from "./types";
export const uid = () => crypto.randomUUID();
export const newScene = (duration = 300): StudioScene => ({
  id: uid(),
  title: "新的镜头",
  body: "在这里写下你想呈现的内容。",
  narration: "",
  durationInFrames: duration,
  layout: "title",
  backgroundColor: "#f1efe8",
  accentColor: "#5c58cc",
  showCaptions: true,
});
export function createSampleProject(): StudioProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: uid(),
    revision: 0,
    name: "把日常，讲成一个好故事",
    createdAt: now,
    updatedAt: now,
    brief:
      "用一分钟，分享三个让生活慢下来的小习惯。面向忙碌的都市年轻人，轻松、温暖，带一点治愈感。",
    stylePrompt:
      "温暖的纸张质感，柔和的自然色彩，克制的字体排版。像一本缓缓翻开的生活手册。",
    aspectRatio: "16:9",
    targetDurationSeconds: 60,
    fps: 30,
    assets: [],
    musicVolume: 0.15,
    scenes: [
      {
        ...newScene(300),
        title: "给生活，留一点空白",
        body: "三个小习惯，让日常慢下来。",
        narration: "有时候，我们需要的不是更多时间，而是给生活留一点空白。",
        backgroundColor: "#eeeade",
        accentColor: "#686344",
      },
      {
        ...newScene(300),
        title: "01 / 认真喝一杯水",
        body: "放下手机，感受此刻。",
        narration: "从认真喝一杯水开始。放下手机，让注意力回到此刻。",
        backgroundColor: "#e6ece4",
        accentColor: "#496b54",
      },
      {
        ...newScene(300),
        title: "02 / 给自己十分钟",
        body: "走一走，看一看天空。",
        narration:
          "每天给自己十分钟，走一走，看一看天空。不必赶路，也能有所收获。",
        backgroundColor: "#e6e9ef",
        accentColor: "#526b99",
      },
      {
        ...newScene(300),
        title: "03 / 记录一件小事",
        body: "今天，也有值得收藏的瞬间。",
        narration:
          "睡前记录一件让你开心的小事。平凡的日子，也有值得收藏的瞬间。",
        backgroundColor: "#f0e4df",
        accentColor: "#a56556",
      },
      {
        ...newScene(300),
        title: "慢一点，也很好",
        body: "从今天的一件小事开始。",
        narration:
          "慢一点，也很好。从今天的一件小事开始，把生活过成自己喜欢的样子。",
        backgroundColor: "#eeeade",
        accentColor: "#686344",
      },
      {
        ...newScene(300),
        title: "把此刻，留给自己",
        body: "YOUR EVERYDAY, REIMAGINED",
        narration: "把此刻留给自己。",
        backgroundColor: "#242c27",
        accentColor: "#c8d9ae",
      },
    ],
  };
}
