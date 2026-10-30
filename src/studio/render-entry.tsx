import {Composition, registerRoot} from "remotion";
import {StudioComposition} from "./StudioComposition";
import {dimensions, totalFrames} from "./schema";
import type {StudioCompositionProps} from "./types";
import type {z} from "zod";

// This entry only registers our trusted component. Uploaded/model code is never evaluated.
type RenderProps = StudioCompositionProps & Record<string, unknown>;
const defaults: RenderProps = {
  assetSources: {},
  project: {
    schemaVersion: 1, id: "render-default", revision: 0, name: "视频工作室",
    createdAt: "2026-10-22T00:00:00.000Z", updatedAt: "2026-10-22T00:00:00.000Z",
    brief: "", stylePrompt: "", aspectRatio: "16:9", targetDurationSeconds: 30,
    fps: 30, assets: [], musicVolume: 0.15,
    scenes: [{id: "scene-1", title: "视频工作室", body: "", narration: "",
      durationInFrames: 900, layout: "title", backgroundColor: "#F3F1EA",
      accentColor: "#CC5E37", showCaptions: true}],
  },
};

const Root = () => (
  <Composition<z.ZodObject, RenderProps> id="StudioVideo" component={StudioComposition} defaultProps={defaults}
    width={1920} height={1080} fps={30} durationInFrames={900}
    calculateMetadata={({props}) => ({
      ...dimensions(props.project.aspectRatio),
      durationInFrames: totalFrames(props.project), fps: props.project.fps,
    })}
  />
);

registerRoot(Root);
