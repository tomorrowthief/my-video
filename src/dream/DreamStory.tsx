import {
  Audio,
  Loop,
  staticFile,
  Composition,
  Folder,
  Sequence,
  useVideoConfig,
} from "remotion";
import { dreamTiming } from "./DreamArt";
import { Opening } from "./Opening";
import { Collect } from "./Collect";
import { Follow } from "./Follow";
import { Secret } from "./Secret";
import { Together } from "./Together";
import { First } from "./First";
import { Return } from "./Return";
import { Ending } from "./Ending";
export const DreamStory = () => {
  const { fps } = useVideoConfig();
  const s = dreamTiming.scenes;
  return (
    <>
      <Loop durationInFrames={Math.round(19.2 * fps)}>
        <Audio src={staticFile("audio-dream/moonlight.m4a")} volume={0.18} />
      </Loop>
      <Sequence
        name="Opening"
        from={s[0].startFrame}
        durationInFrames={s[0].durationInFrames}
        premountFor={fps}
      >
        <Opening />
      </Sequence>
      <Sequence
        name="Collect"
        from={s[1].startFrame}
        durationInFrames={s[1].durationInFrames}
        premountFor={fps}
      >
        <Collect />
      </Sequence>
      <Sequence
        name="Follow"
        from={s[2].startFrame}
        durationInFrames={s[2].durationInFrames}
        premountFor={fps}
      >
        <Follow />
      </Sequence>
      <Sequence
        name="Secret"
        from={s[3].startFrame}
        durationInFrames={s[3].durationInFrames}
        premountFor={fps}
      >
        <Secret />
      </Sequence>
      <Sequence
        name="Together"
        from={s[4].startFrame}
        durationInFrames={s[4].durationInFrames}
        premountFor={fps}
      >
        <Together />
      </Sequence>
      <Sequence
        name="First"
        from={s[5].startFrame}
        durationInFrames={s[5].durationInFrames}
        premountFor={fps}
      >
        <First />
      </Sequence>
      <Sequence
        name="Return"
        from={s[6].startFrame}
        durationInFrames={s[6].durationInFrames}
        premountFor={fps}
      >
        <Return />
      </Sequence>
      <Sequence
        name="Ending"
        from={s[7].startFrame}
        durationInFrames={s[7].durationInFrames}
        premountFor={fps}
      >
        <Ending />
      </Sequence>
    </>
  );
};
export const DreamCompositions = () => (
  <Folder name="Fairytales">
    <Composition
      id="DreamThief"
      component={DreamStory}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={dreamTiming.totalFrames}
    />
    <Folder name="DreamScenes">
      <Composition
        id="Dream-Opening"
        component={Opening}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[0].durationInFrames}
      />
      <Composition
        id="Dream-Collect"
        component={Collect}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[1].durationInFrames}
      />
      <Composition
        id="Dream-Follow"
        component={Follow}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[2].durationInFrames}
      />
      <Composition
        id="Dream-Secret"
        component={Secret}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[3].durationInFrames}
      />
      <Composition
        id="Dream-Together"
        component={Together}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[4].durationInFrames}
      />
      <Composition
        id="Dream-First"
        component={First}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[5].durationInFrames}
      />
      <Composition
        id="Dream-Return"
        component={Return}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[6].durationInFrames}
      />
      <Composition
        id="Dream-Ending"
        component={Ending}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={dreamTiming.scenes[7].durationInFrames}
      />
    </Folder>
  </Folder>
);
