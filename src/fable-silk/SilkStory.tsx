import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { StoryMetaContext, type StoryMeta } from "../idioms/StoryArt";
import { silkTiming, type SilkCaptions } from "./SilkArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { SpinScene } from "./SpinScene";
import { MockScene } from "./MockScene";
import { LungeScene } from "./LungeScene";
import { AgainScene } from "./AgainScene";
import { CocoonScene } from "./CocoonScene";
import { WinterScene } from "./WinterScene";
import { EndingScene } from "./EndingScene";

// The storybook chrome of the idiom series, this tale's own timeline and badge.
const silkMeta: StoryMeta = {
  timing: silkTiming,
  captions: captionsData as SilkCaptions,
  series: "山林寓言",
  episode: "第二集",
  audioDir: "audio-fable-silk",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "一天一根丝", Component: SpinScene },
  { title: "螳螂的嘲笑", Component: MockScene },
  { title: "第一次扑空", Component: LungeScene },
  { title: "一扑再扑", Component: AgainScene },
  { title: "茧结成了", Component: CocoonScene },
  { title: "冬天来了", Component: WinterScene },
  { title: "轮到你想一想", Component: EndingScene },
] as const;

// Standalone scene compositions carry their own meta; the context default is the idiom's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={silkMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const SilkStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={silkMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = silkTiming.scenes[i];
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

export const SilkCompositions = () => (
  <Folder name="Silkworm">
    <Composition
      id="SilkStory"
      component={SilkStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={silkTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={silkTiming.scenes[i].id}
          id={`Silk-${silkTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={silkTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
