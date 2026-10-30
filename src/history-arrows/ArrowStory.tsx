import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { StoryMetaContext, type StoryMeta } from "../idioms/StoryArt";
import { arrowTiming, type ArrowCaptions } from "./ArrowsArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { TaskScene } from "./TaskScene";
import { PrepScene } from "./PrepScene";
import { FogScene } from "./FogScene";
import { DrumsScene } from "./DrumsScene";
import { ArrowsScene } from "./ArrowsScene";
import { TurnScene } from "./TurnScene";
import { EndingScene } from "./EndingScene";

// The storybook chrome of the idiom series, this tale's own timeline and badge.
const arrowsMeta: StoryMeta = {
  timing: arrowTiming,
  captions: captionsData as ArrowCaptions,
  series: "三国小故事",
  episode: "第二集",
  audioDir: "audio-history-arrows",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "十万支箭", Component: TaskScene },
  { title: "借船扎草人", Component: PrepScene },
  { title: "大雾锁江", Component: FogScene },
  { title: "擂鼓呐喊", Component: DrumsScene },
  { title: "万箭齐发", Component: ArrowsScene },
  { title: "调转船身", Component: TurnScene },
  { title: "交箭收兵", Component: EndingScene },
] as const;

// Standalone scene compositions carry their own meta; the context default is the idiom's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={arrowsMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const ArrowStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={arrowsMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = arrowTiming.scenes[i];
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

export const ArrowCompositions = () => (
  <Folder name="Arrows">
    <Composition
      id="ArrowStory"
      component={ArrowStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={arrowTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={arrowTiming.scenes[i].id}
          id={`Arrow-${arrowTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={arrowTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
