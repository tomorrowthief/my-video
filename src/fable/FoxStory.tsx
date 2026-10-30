import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { StoryMetaContext, type StoryMeta } from "../idioms/StoryArt";
import { foxTiming, type FoxCaptions } from "./FableArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { ForestScene } from "./ForestScene";
import { CaughtScene } from "./CaughtScene";
import { TrickScene } from "./TrickScene";
import { ParadeScene } from "./ParadeScene";
import { FleeScene } from "./FleeScene";
import { LessonScene } from "./LessonScene";
import { EndingScene } from "./EndingScene";

// The storybook chrome of the idiom series, this tale's own timeline and badge.
const foxMeta: StoryMeta = {
  timing: foxTiming,
  captions: captionsData as FoxCaptions,
  series: "山林寓言",
  episode: "第一集",
  audioDir: "audio-fable-fox",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "大山里的森林", Component: ForestScene },
  { title: "老虎的午餐", Component: CaughtScene },
  { title: "眼珠一转", Component: TrickScene },
  { title: "狐狸走在前面", Component: ParadeScene },
  { title: "吓跑的百兽", Component: FleeScene },
  { title: "小笔记", Component: LessonScene },
  { title: "轮到你想一想", Component: EndingScene },
] as const;

// Standalone scene compositions carry their own meta; the context default is the idiom's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={foxMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const FoxStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={foxMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = foxTiming.scenes[i];
        return (
          <Sequence
            key={scene.id}
            name={title}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
            premountFor={fps}
          >
            <Component />
          </Sequence>
        );
      })}
    </StoryMetaContext.Provider>
  );
};

export const FoxCompositions = () => (
  <Folder name="Fox">
    <Composition
      id="FoxStory"
      component={FoxStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={foxTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={foxTiming.scenes[i].id}
          id={`Fox-${foxTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={foxTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
