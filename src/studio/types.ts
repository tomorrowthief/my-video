export type AspectRatio = "16:9" | "9:16";
export type AssetKind = "image" | "video" | "audio";
export type SceneLayout = "title" | "split" | "full-media";
export interface StudioAsset {
  id: string;
  name: string;
  kind: AssetKind;
  mimeType: string;
  size: number;
  durationSeconds?: number;
}
export interface StudioScene {
  id: string;
  title: string;
  body: string;
  narration: string;
  durationInFrames: number;
  layout: SceneLayout;
  backgroundColor: string;
  accentColor: string;
  assetId?: string;
  voiceAssetId?: string;
  voiceNarration?: string;
  voiceSettingsFingerprint?: string;
  showCaptions: boolean;
}
export interface StudioProject {
  schemaVersion: 1;
  id: string;
  revision: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  brief: string;
  stylePrompt: string;
  aspectRatio: AspectRatio;
  targetDurationSeconds: 30 | 60 | 90;
  fps: 30;
  scenes: StudioScene[];
  assets: StudioAsset[];
  musicAssetId?: string;
  musicVolume: number;
}
export interface StudioCompositionProps {
  project: StudioProject;
  assetSources: Record<string, string>;
}
export interface ModelConnection {
  baseUrl: string;
  apiKey: string;
  model: string;
}
export interface StudioModelSettings {
  language: ModelConnection;
  tts: ModelConnection & { voice: string; speed: number };
}
export type RenderStatus =
  | "queued"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";
export interface RenderJob {
  jobId: string;
  status: RenderStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: { code: string; message: string };
  expiresAt?: string;
}
