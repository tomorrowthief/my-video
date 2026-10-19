// Beijing-region voice auditions. Outputs stay in out/; existing videos are untouched.
// node scripts/tts-bailian.mjs math [--voice Cherry] [--text "试听文本"] [--dry-run]
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const MODEL = "qwen3-tts-flash";
const INSTRUCTIONS =
  "用自然普通话，像一位亲切的老师面对面讲解。语速适中，句间自然停顿，" +
  "重点数字稍加重音，提问时语调轻轻上扬。保持声音稳定，避免机械朗读和夸张播音腔。";

/** DashScope's streamed WAV header uses near-INT_MAX sizes, even for URL downloads. */
export const normalizeWav = (buffer) => {
  if (
    buffer.length < 44 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE" ||
    buffer.readUInt32LE(4) < 0x7fff0000
  )
    return buffer;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "data" && size >= 0x7fff0000 && start + size > buffer.length) {
      const fixed = Buffer.from(buffer);
      fixed.writeUInt32LE(fixed.length - 8, 4);
      fixed.writeUInt32LE(fixed.length - start, offset + 4);
      return fixed;
    }
    if (start + size > buffer.length) break;
    offset = start + size + (size % 2);
  }
  return buffer;
};

/** Reject error pages, raw PCM and truncated downloads before saving a .wav. */
export const wavDuration = (buffer) => {
  if (
    buffer.length < 44 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("百炼返回的音频不是有效 WAV 文件。");
  }
  let byteRate;
  let bytes;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > buffer.length) throw new Error("WAV 下载不完整。");
    if (id === "fmt " && size >= 16) byteRate = buffer.readUInt32LE(start + 8);
    if (id === "data") bytes = size;
    offset = start + size + (size % 2);
  }
  if (!(byteRate > 0) || !(bytes > 0))
    throw new Error("WAV 缺少有效音频数据。");
  return bytes / byteRate;
};

export const speechSettings = ({
  text,
  voice = "Cherry",
  model = MODEL,
  instructions = INSTRUCTIONS,
}) => {
  if (typeof text !== "string" || !text.trim())
    throw new Error("试听文本不能为空。");
  if (Array.from(text).length > 600)
    throw new Error("单次试听最多 600 个字符，请缩短 --text。");
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(voice))
    throw new Error("音色名称无效。");
  if (!/^qwen3-tts-(?:instruct-)?flash(?:-\d{4}-\d{2}-\d{2})?$/.test(model)) {
    throw new Error(
      "请使用非实时 qwen3-tts-flash 或 qwen3-tts-instruct-flash 模型。",
    );
  }
  return {
    model,
    input: {
      text: text.trim(),
      voice,
      language_type: "Chinese",
      ...(model.includes("instruct")
        ? { instructions, optimize_instructions: true }
        : {}),
    },
  };
};

/** A content hash makes repeated auditions free to reuse, including after restart. */
export const generateAudition = async ({
  settings,
  apiKey,
  outDir,
  request = fetch,
}) => {
  const hash = createHash("sha256")
    .update(JSON.stringify(settings))
    .digest("hex")
    .slice(0, 16);
  const output = join(outDir, `${settings.input.voice}-${hash}.wav`);
  if (existsSync(output)) {
    return {
      path: output,
      seconds: wavDuration(readFileSync(output)),
      cached: true,
    };
  }
  if (!apiKey?.trim()) {
    throw new Error(
      "缺少北京地域 DASHSCOPE_API_KEY，请在项目根目录 .env 中填写后重试。",
    );
  }
  // Preserve a short-lived download ticket privately, so a failed GET does not
  // require another paid synthesis. Never include it in the public metadata.
  const ticket = `${output}.pending.json`;
  let audioResult;
  if (existsSync(ticket)) {
    const pending = JSON.parse(readFileSync(ticket, "utf8"));
    if (pending.expires_at > Date.now() / 1000) audioResult = pending;
  }
  if (!audioResult) {
    let response;
    try {
      response = await request(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
				signal: AbortSignal.timeout(120000),
        redirect: "error",
      });
    } catch (cause) {
      // Do not print fetch errors: they can include credentials or request details.
      const code = cause?.cause?.code ?? cause?.code;
      const detail = /^[A-Z0-9_]{1,60}$/.test(code ?? "") ? ` (${code})` : "";
      throw new Error(
        `连接百炼北京接口失败或超时${detail}，请检查网络。为避免重复计费，未自动重发生成请求。`,
      );
    }
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`百炼返回非 JSON 响应（HTTP ${response.status}）。`);
    }
    if (
      !response.ok ||
      (result.status_code && result.status_code !== 200) ||
      result.code
    ) {
      const hint =
        response.status === 401 || response.status === 403
          ? "请检查北京地域 Key、模型权限和账户状态。"
          : "请检查模型可用性、参数、额度和账户状态。";
      // Redact secrets and signed URLs while keeping model/parameter errors actionable.
      const code = /^[A-Za-z0-9_.-]{1,100}$/.test(result.code ?? "")
        ? ` ${result.code}`
        : "";
      const detail =
        typeof result.message === "string"
          ? result.message
              .replaceAll(apiKey.trim(), "[redacted]")
              .replace(/https?:\/\/\S+/g, "[url]")
              .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
              .slice(0, 500)
          : "";
      const error = new Error(
        `百炼生成失败（HTTP ${response.status}${code}）。${hint}${detail ? `\n${detail}` : ""}`,
      );
      error.status = response.status;
      throw error;
    }
    if (!result.output?.audio?.url)
      throw new Error("百炼未返回完整音频下载地址。");
    audioResult = result.output.audio;
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      ticket,
      JSON.stringify({
        url: audioResult.url,
        expires_at: audioResult.expires_at ?? Date.now() / 1000 + 23 * 3600,
      }),
      { mode: 0o600 },
    );
  }
  const url = new URL(audioResult.url);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname.endsWith(".aliyuncs.com") ||
    url.username ||
    url.password
  ) {
    throw new Error("百炼返回的音频地址不是阿里云 OSS 地址。");
  }
  // Some responses use http URLs; use HTTPS for the same signed OSS resource.
  url.protocol = "https:";
  let buffer;
  try {
    // Deliberately omit Authorization; the signed URL provides download access.
    for (let attempt = 0; ; attempt++) {
      try {
        const audio = await request(url.toString(), {
          signal: AbortSignal.timeout(60000),
          redirect: "error",
        });
        if (!audio.ok) throw new Error("download failed");
        buffer = Buffer.from(await audio.arrayBuffer());
        break;
      } catch (error) {
        if (attempt >= 2) throw error;
      }
    }
  } catch {
    throw new Error("音频已生成，但下载失败。请检查网络；旧配音保持原样。");
  }
  buffer = normalizeWav(buffer);
  const seconds = wavDuration(buffer);
  mkdirSync(outDir, { recursive: true });
  const temp = `${output}.${process.pid}.tmp`;
  try {
    writeFileSync(temp, buffer, { flag: "wx" });
    renameSync(temp, output);
  } finally {
    rmSync(temp, { force: true });
  }
  // Keep text and settings locally for comparison, never the Key or signed URL.
  writeFileSync(
    output.replace(/\.wav$/, ".json"),
    `${JSON.stringify({ region: "cn-beijing", ...settings, seconds }, null, 2)}\n`,
  );
  rmSync(ticket, { force: true });
  return { path: output, seconds, cached: false };
};

const main = async () => {
  const { values, positionals } = parseArgs({
    options: {
      voice: { type: "string" },
      text: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });
  if (values.help) {
    console.log(
      'Usage: node scripts/tts-bailian.mjs [math|python|pi-durable] [--voice Cherry] [--text "试听文本"] [--dry-run]',
    );
    return;
  }
  if (positionals.length > 1) throw new Error("只需指定一个视频名称。");
  const manifest = JSON.parse(readFileSync(join(ROOT, "videos.json"), "utf8"));
  const key = positionals[0] ?? "math";
  if (!Object.hasOwn(manifest, key))
    throw new Error(
      `未知视频：${key}。可选：${Object.keys(manifest).join(", ")}`,
    );
  if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
  const narration = JSON.parse(
    readFileSync(join(ROOT, manifest[key].narration), "utf8"),
  );
  const text =
    values.text ?? narration.scenes[0].paragraphs.map((p) => p.say).join("\n");
  const settings = speechSettings({
    text,
    voice:
      values.voice ??
      (process.env.BAILIAN_TTS_VOICE?.trim() ||
        manifest[key].tts?.voice ||
        "Cherry"),
    model:
      process.env.BAILIAN_TTS_MODEL?.trim() ||
      manifest[key].tts?.model ||
      MODEL,
    instructions: process.env.BAILIAN_TTS_INSTRUCTIONS?.trim() || INSTRUCTIONS,
  });
  console.log(
    `百炼北京 · ${settings.model} · ${settings.input.voice} · ${Array.from(text).length} 字符`,
  );
  if (values["dry-run"]) {
    console.log(JSON.stringify(settings, null, 2));
    console.log("仅检查参数，没有调用接口或修改音频。");
    return;
  }
  const result = await generateAudition({
    settings,
    apiKey: process.env.DASHSCOPE_API_KEY,
    outDir: join(ROOT, "out", "tts-bailian", key),
  });
  console.log(
    `${result.cached ? "复用已有试听" : "试听已生成"} · ${result.seconds.toFixed(2)} 秒\n${result.path}`,
  );
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
