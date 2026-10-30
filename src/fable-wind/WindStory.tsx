import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { StoryMetaContext, type StoryMeta } from "../idioms/StoryArt";
import { windTiming, type WindCaptions } from "./WindArt";
import captionsData from "./captions.json";
import { OpeningScene } from "./OpeningScene";
import { TravelerScene } from "./TravelerScene";
import { WindScene } from "./WindScene";
import { TightScene } from "./TightScene";
import { HarderScene } from "./HarderScene";
import { SunScene } from "./SunScene";
import { OffScene } from "./OffScene";
import { EndingScene } from "./EndingScene";

// The storybook chrome of the idiom series, this tale's own timeline and badge.
const windMeta: StoryMeta = {
  timing: windTiming,
  captions: captionsData as WindCaptions,
  series: "伊索寓言",
  episode: "第一集",
  audioDir: "audio-fable-wind",
};

const scenes = [
  { title: "翻开故事书", Component: OpeningScene },
  { title: "山路上的旅人", Component: TravelerScene },
  { title: "北风先来", Component: WindScene },
  { title: "裹得更紧", Component: TightScene },
  { title: "用尽力气", Component: HarderScene },
  { title: "换太阳来", Component: SunScene },
  { title: "自己脱下外套", Component: OffScene },
  { title: "轮到你想一想", Component: EndingScene },
] as const;

// Standalone scene compositions carry their own meta; the context default is the idiom's.
const withMeta =
  (Component: (props: {}) => React.JSX.Element) => () => (
    <StoryMetaContext.Provider value={windMeta}>
      <Component />
    </StoryMetaContext.Provider>
  );

export const WindStory = () => {
  const { fps } = useVideoConfig();
  return (
    <StoryMetaContext.Provider value={windMeta}>
      {scenes.map(({ title, Component }, i) => {
        const scene = windTiming.scenes[i];
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

export const WindCompositions = () => (
  <Folder name="WindAndSun">
    <Composition
      id="WindStory"
      component={WindStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={windTiming.totalFrames}
    />
    <Folder name="Scenes">
      {scenes.map(({ Component }, i) => (
        <Composition
          key={windTiming.scenes[i].id}
          id={`Wind-${windTiming.scenes[i].id}`}
          component={withMeta(Component)}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={windTiming.scenes[i].durationInFrames}
        />
      ))}
    </Folder>
  </Folder>
);
