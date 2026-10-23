import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import {
  StoryMetaContext,
  type StoryMeta,
} from "../idioms/StoryArt";
import { stumpTiming, type StumpCaptions } from "./StumpArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { FieldScene } from "./FieldScene";
import { HareScene } from "./HareScene";
import { LuckScene } from "./LuckScene";
import { WaitingScene } from "./WaitingScene";
import { EmptyScene } from "./EmptyScene";
import { LessonScene } from "./LessonScene";
import { EndingScene } from "./EndingScene";

// Same art system as the first episode, its own timeline and episode badge.
const stumpMeta: StoryMeta = {
  timing: stumpTiming,
  captions: captionsData as StumpCaptions,
  series: "小禾的成语故事",
  episode: "第二集",
  audioDir: "audio-idiom-stump",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "勤劳的农夫", Component: FieldScene },
  { title: "飞来的野兔", Component: HareScene },
  { title: "白捡的兔子", Component: LuckScene },
  { title: "守着树桩的人", Component: WaitingScene },
  { title: "荒芜的田地", Component: EmptyScene },
  { title: "小禾的笔记", Component: LessonScene },
  { title: "轮到你想一想", Component: EndingScene },
] as const;

// Standalone scene compositions must carry their own meta; the context default is episode one's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={stumpMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const StumpStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={stumpMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = stumpTiming.scenes[i];
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

export const StumpCompositions = () => (
  <Folder name="Idioms">
    <Composition
      id="StumpStory"
      component={StumpStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={stumpTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={stumpTiming.scenes[i].id}
          id={`Stump-${stumpTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={stumpTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
