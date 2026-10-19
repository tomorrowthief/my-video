import { Composition, Folder, Sequence, useVideoConfig } from "remotion";
import { OpeningScene } from "./OpeningScene";
import { GardenScene } from "./GardenScene";
import { WaitingScene } from "./WaitingScene";
import { PullingScene } from "./PullingScene";
import { GuessScene } from "./GuessScene";
import { ResultScene } from "./ResultScene";
import { LessonScene } from "./LessonScene";
import { EndingScene } from "./EndingScene";
import { storyTiming } from "./StoryArt";

// Separate source nodes keep each scene selectable in Studio. Their timing
// follows generated narration so replacing a voice still re-cuts the story.
export const SeedlingStory = () => {
  const { fps } = useVideoConfig();
  const scenes = storyTiming.scenes;
  return (
    <>
      <Sequence
        name="翻开故事书"
        from={scenes[0].startFrame}
        durationInFrames={scenes[0].durationInFrames}
        premountFor={fps}
      >
        <OpeningScene />
      </Sequence>
      <Sequence
        name="农夫的小苗"
        from={scenes[1].startFrame}
        durationInFrames={scenes[1].durationInFrames}
        premountFor={fps}
      >
        <GardenScene />
      </Sequence>
      <Sequence
        name="着急的农夫"
        from={scenes[2].startFrame}
        durationInFrames={scenes[2].durationInFrames}
        premountFor={fps}
      >
        <WaitingScene />
      </Sequence>
      <Sequence
        name="往上拔一拔"
        from={scenes[3].startFrame}
        durationInFrames={scenes[3].durationInFrames}
        premountFor={fps}
      >
        <PullingScene />
      </Sequence>
      <Sequence
        name="你猜会怎样"
        from={scenes[4].startFrame}
        durationInFrames={scenes[4].durationInFrames}
        premountFor={fps}
      >
        <GuessScene />
      </Sequence>
      <Sequence
        name="小苗低下了头"
        from={scenes[5].startFrame}
        durationInFrames={scenes[5].durationInFrames}
        premountFor={fps}
      >
        <ResultScene />
      </Sequence>
      <Sequence
        name="长大有自己的节奏"
        from={scenes[6].startFrame}
        durationInFrames={scenes[6].durationInFrames}
        premountFor={fps}
      >
        <LessonScene />
      </Sequence>
      <Sequence
        name="轮到你想一想"
        from={scenes[7].startFrame}
        durationInFrames={scenes[7].durationInFrames}
        premountFor={fps}
      >
        <EndingScene />
      </Sequence>
    </>
  );
};

export const IdiomCompositions = () => (
  <Folder name="Idioms">
    <Composition
      id="SeedlingStory"
      component={SeedlingStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={storyTiming.totalFrames}
    />
    <Folder name="Scenes">
      <Composition
        id="Seedling-Opening"
        component={OpeningScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[0].durationInFrames}
      />
      <Composition
        id="Seedling-Garden"
        component={GardenScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[1].durationInFrames}
      />
      <Composition
        id="Seedling-Waiting"
        component={WaitingScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[2].durationInFrames}
      />
      <Composition
        id="Seedling-Pulling"
        component={PullingScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[3].durationInFrames}
      />
      <Composition
        id="Seedling-Guess"
        component={GuessScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[4].durationInFrames}
      />
      <Composition
        id="Seedling-Result"
        component={ResultScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[5].durationInFrames}
      />
      <Composition
        id="Seedling-Lesson"
        component={LessonScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[6].durationInFrames}
      />
      <Composition
        id="Seedling-Ending"
        component={EndingScene}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={storyTiming.scenes[7].durationInFrames}
      />
    </Folder>
  </Folder>
);
