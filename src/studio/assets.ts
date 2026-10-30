import { MAX_ASSET_BYTES } from "./schema";
import { uid } from "./sample";
import type { StudioAsset } from "./types";

const accepted: Record<string, { mime: string[]; kind: StudioAsset["kind"] }> =
  {
    png: { mime: ["image/png"], kind: "image" },
    jpg: { mime: ["image/jpeg"], kind: "image" },
    jpeg: { mime: ["image/jpeg"], kind: "image" },
    webp: { mime: ["image/webp"], kind: "image" },
    mp4: { mime: ["video/mp4"], kind: "video" },
    webm: { mime: ["video/webm"], kind: "video" },
    mp3: { mime: ["audio/mpeg", "audio/mp3"], kind: "audio" },
    wav: { mime: ["audio/wav", "audio/x-wav"], kind: "audio" },
    m4a: { mime: ["audio/mp4", "audio/x-m4a"], kind: "audio" },
  };
export async function inspectAsset(file: File): Promise<StudioAsset> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const spec = accepted[ext];
  if (!spec || !spec.mime.includes(file.type))
    throw new Error(`「${file.name}」的格式不受支持或与实际文件类型不符。`);
  if (file.size === 0 || file.size > MAX_ASSET_BYTES)
    throw new Error("每个素材须大于 0 且不超过 25 MB。");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (a: number, b: number) =>
    String.fromCharCode(...bytes.slice(a, b));
  const validSignature =
    ext === "png"
      ? bytes[0] === 137 && ascii(1, 4) === "PNG"
      : ["jpg", "jpeg"].includes(ext)
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : ext === "webp"
          ? ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP"
          : ["mp4", "m4a"].includes(ext)
            ? ascii(4, 8) === "ftyp"
            : ext === "wav"
              ? ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE"
              : ext === "webm"
                ? bytes[0] === 26 &&
                  bytes[1] === 69 &&
                  bytes[2] === 223 &&
                  bytes[3] === 163
                : ascii(0, 3) === "ID3" ||
                  (bytes[0] === 255 && (bytes[1] & 224) === 224);
  if (!validSignature) throw new Error(`「${file.name}」文件内容与格式不符。`);
  const url = URL.createObjectURL(file);
  let durationSeconds: number | undefined;
  try {
    if (spec.kind === "image") {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (
        image.naturalWidth * image.naturalHeight > 16_777_216 ||
        image.naturalWidth > 8192 ||
        image.naturalHeight > 8192
      )
        throw new Error(
          "图片分辨率过高，请缩小至 1677 万像素以内，且单边不超过 8192 像素。",
        );
    } else {
      durationSeconds = await new Promise<number>((resolve, reject) => {
        const media = document.createElement(
          spec.kind === "video" ? "video" : "audio",
        );
        const timer = window.setTimeout(() => {
          cleanup();
          reject(new Error("素材读取超时，请转换格式后重试。"));
        }, 12000);
        const cleanup = () => {
          clearTimeout(timer);
          media.onloadedmetadata = null;
          media.onerror = null;
          media.removeAttribute("src");
          media.load();
        };
        media.preload = "metadata";
        media.onloadedmetadata = () => {
          const value = media.duration;
          cleanup();
          if (Number.isFinite(value) && value > 0 && value <= 600)
            resolve(value);
          else reject(new Error("素材时长须在 10 分钟以内。"));
        };
        media.onerror = () => {
          cleanup();
          reject(new Error("浏览器无法解码此素材，请转换为常用编码后重试。"));
        };
        media.src = url;
      });
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return {
    id: uid(),
    name: file.name,
    kind: spec.kind,
    mimeType: file.type,
    size: file.size,
    ...(durationSeconds ? { durationSeconds } : {}),
  };
}
