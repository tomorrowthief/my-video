import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { StoryMetaContext, type StoryMeta } from "../idioms/StoryArt";
import { plumTiming, type PlumCaptions } from "./HistoryArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { MarchScene } from "./MarchScene";
import { ThirstyScene } from "./ThirstyScene";
import { IdeaScene } from "./IdeaScene";
import { PlumScene } from "./PlumScene";
import { MouthsScene } from "./MouthsScene";
import { FoundScene } from "./FoundScene";
import { EndingScene } from "./EndingScene";

// The storybook chrome of the idiom series, this tale's own timeline and badge.
const plumMeta: StoryMeta = {
  timing: plumTiming,
  captions: captionsData as PlumCaptions,
  series: "三国小故事",
  episode: "第一集",
  audioDir: "audio-history-plum",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "盛夏行军", Component: MarchScene },
  { title: "走不动的队伍", Component: ThirstyScene },
  { title: "曹操的急智", Component: IdeaScene },
  { title: "前面有梅林", Component: PlumScene },
  { title: "口中生津", Component: MouthsScene },
  { title: "找到水源", Component: FoundScene },
  { title: "轮到你想一想", Component: EndingScene },
] as const;

// Standalone scene compositions carry their own meta; the context default is the idiom's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={plumMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const PlumStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={plumMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = plumTiming.scenes[i];
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

export const PlumCompositions = () => (
  <Folder name="History">
    <Composition
      id="PlumStory"
      component={PlumStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={plumTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={plumTiming.scenes[i].id}
          id={`Plum-${plumTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={plumTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
