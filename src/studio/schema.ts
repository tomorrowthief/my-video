import { z } from "zod";
import type { StudioProject } from "./types";
export const MAX_ASSET_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const color = z.string().regex(/^#[a-fA-F0-9]{6}$/);
const asset = z
  .object({
    id,
    name: z.string().min(1).max(250),
    kind: z.enum(["image", "video", "audio"]),
    mimeType: z.enum([
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/x-m4a",
    ]),
    size: z.number().int().min(1).max(MAX_ASSET_BYTES),
    durationSeconds: z.number().positive().max(600).optional(),
  })
  .strict()
  .refine((a) => a.mimeType.startsWith(a.kind + "/"), {
    message: "素材类型不匹配",
  });
const scene = z
  .object({
    id,
    title: z.string().max(100),
    body: z.string().max(600),
    narration: z.string().max(2000),
    durationInFrames: z.number().int().min(1).max(2700),
    layout: z.enum(["title", "split", "full-media"]),
    backgroundColor: color,
    accentColor: color,
    assetId: id.optional(),
    voiceAssetId: id.optional(),
    voiceNarration: z.string().max(2000).optional(),
    showCaptions: z.boolean(),
    voiceSettingsFingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export const studioProjectSchema = z
  .object({
    schemaVersion: z.literal(1),
    id,
    revision: z.number().int().min(0),
    name: z.string().min(1).max(150),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    brief: z.string().max(5000),
    stylePrompt: z.string().max(2000),
    aspectRatio: z.enum(["16:9", "9:16"]),
    targetDurationSeconds: z.union([
      z.literal(30),
      z.literal(60),
      z.literal(90),
    ]),
    fps: z.literal(30),
    scenes: z.array(scene).min(1).max(20),
    assets: z.array(asset).max(20),
    musicAssetId: id.optional(),
    musicVolume: z.number().min(0).max(1),
  })
  .strict()
  .superRefine((p, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    if (new Set(p.assets.map((a) => a.id)).size !== p.assets.length)
      fail("素材 ID 重复");
    if (new Set(p.scenes.map((s) => s.id)).size !== p.scenes.length)
      fail("镜头 ID 重复");
    if (p.scenes.reduce((n, s) => n + s.durationInFrames, 0) > 2700)
      fail("视频超过 90 秒");
    if (p.assets.reduce((n, a) => n + a.size, 0) > MAX_UPLOAD_BYTES)
      fail("素材总量超过限制");
    for (const s of p.scenes) {
      if (
        s.assetId &&
        !p.assets.some((a) => a.id === s.assetId && a.kind !== "audio")
      )
        fail("画面素材缺失或类型错误");
      if (
        s.voiceAssetId &&
        !p.assets.some((a) => a.id === s.voiceAssetId && a.kind === "audio")
      )
        fail("配音素材缺失");
      if (s.voiceAssetId && s.voiceNarration !== s.narration)
        fail("旁白已修改，请重新生成配音");
      const voice = p.assets.find((a) => a.id === s.voiceAssetId);
      if (
        voice?.durationSeconds &&
        Math.ceil(voice.durationSeconds * 30) > s.durationInFrames
      )
        fail("镜头时长不足以播放完整配音");
    }
    if (
      p.musicAssetId &&
      !p.assets.some((a) => a.id === p.musicAssetId && a.kind === "audio")
    )
      fail("背景音乐缺失");
  });
export const parseStudioProject = (input: unknown): StudioProject =>
  studioProjectSchema.parse(input);
export const totalFrames = (project: StudioProject) =>
  project.scenes.reduce((n, s) => n + s.durationInFrames, 0);
export const dimensions = (aspect: StudioProject["aspectRatio"]) =>
  aspect === "9:16"
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };
export const referencedAssetIds = (p: StudioProject): string[] => [
  ...new Set(
    [
      ...p.scenes.flatMap((s) => [s.assetId, s.voiceAssetId]),
      p.musicAssetId,
    ].filter((x): x is string => Boolean(x)),
  ),
];
