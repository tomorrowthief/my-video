import Busboy from 'busboy';
import sharp from 'sharp';
import {createWriteStream} from 'node:fs';
import {readFile, rename, rm, stat} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {join} from 'node:path';
import {parseStudioProject, referencedAssetIds, MAX_ASSET_BYTES, MAX_UPLOAD_BYTES} from '../src/studio/schema.ts';
import {HttpError, invalidAsset} from './errors.mjs';
import {runMediaTool} from './media-tools.mjs';

const bodyLimit = MAX_UPLOAD_BYTES + 2 * 1024 * 1024;
const tooLarge = () => new HttpError(413, 'UPLOAD_TOO_LARGE', '素材超过限制：单个 25 MiB，项目合计 100 MiB。');

export async function receiveProject(req, directory) {
  if (Number(req.headers['content-length']) > bodyLimit) throw tooLarge();
  let parser;
  try {
    parser = Busboy({headers: req.headers, limits: {fileSize: MAX_ASSET_BYTES, files: 20,
      fields: 1, fieldSize: 1024 * 1024, parts: 21, fieldNameSize: 120}});
  } catch { throw new HttpError(400, 'INVALID_PROJECT', '请使用 multipart/form-data 上传项目。'); }
  const files = new Map();
  const writes = [];
  let manifest;
  let error;
  let bytes = 0;
  const fail = (err) => { error ??= err; };
  const count = (chunk) => {
    bytes += chunk.length;
    if (bytes > bodyLimit) {
      fail(tooLarge());
      req.unpipe(parser);
      parser.destroy(error);
      req.resume();
    }
  };
  req.on('data', count);
  parser.on('field', (name, value, info) => {
    if (name !== 'project' || manifest !== undefined || info.valueTruncated || info.nameTruncated) {
      fail(new HttpError(400, 'INVALID_PROJECT', '项目字段重复、超限或不受支持。'));
    } else manifest = value;
  });
  parser.on('file', (name, stream) => {
    const match = /^asset\.([a-zA-Z0-9_-]{1,100})$/.exec(name);
    if (!match || files.has(match[1])) {
      fail(invalidAsset());
      stream.resume();
      return;
    }
    const file = join(directory, `${match[1]}.upload`);
    files.set(match[1], file);
    stream.on('limit', () => fail(tooLarge()));
    writes.push(pipeline(stream, createWriteStream(file, {flags: 'wx', mode: 0o600})).catch(() => fail(invalidAsset())));
  });
  for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(event, () => fail(tooLarge()));
  try {
    await new Promise((resolve, reject) => {
      parser.once('close', resolve);
      parser.once('error', reject);
      req.once('aborted', () => { parser.destroy(); reject(invalidAsset()); });
      req.pipe(parser);
    });
  } catch (err) { fail(err instanceof HttpError ? err : invalidAsset()); }
  finally { req.off('data', count); }
  await Promise.all(writes);
  if (error) throw error;
  let project;
  try { project = parseStudioProject(JSON.parse(manifest)); }
  catch { throw new HttpError(400, 'INVALID_PROJECT', '项目结构无效、引用失效或视频超过 90 秒。'); }
  const refs = referencedAssetIds(project);
  if (refs.length !== files.size || refs.some(id => !files.has(id))) throw invalidAsset();
  const assets = {};
  for (const id of refs) {
    const asset = project.assets.find(a => a.id === id);
    const file = files.get(id);
    if ((await stat(file)).size !== asset.size) throw invalidAsset();
    assets[id] = await validateAsset(asset, file, directory);
  }
  // Validate audio using measured server duration, never the user-provided metadata.
  for (const scene of project.scenes) {
    if (scene.voiceAssetId && Math.ceil(assets[scene.voiceAssetId].duration * project.fps) > scene.durationInFrames) {
      throw new HttpError(400, 'INVALID_ASSET', '配音长于镜头，请先调整镜头时长。');
    }
  }
  return {project, assets};
}

async function validateAsset(asset, source, directory) {
  try {
    const buffer = await readFile(source);
    const sig = buffer.subarray(0, 64);
    if (asset.kind === 'image') {
      const expected = asset.mimeType === 'image/jpeg' ? 'jpeg' : asset.mimeType.slice(6);
      const image = sharp(buffer, {limitInputPixels: 16_777_216, failOn: 'warning', animated: false});
      const metadata = await image.metadata();
      if (metadata.format !== expected || metadata.pages > 1 || !metadata.width || !metadata.height ||
        metadata.width > 8192 || metadata.height > 8192) throw invalidAsset();
      const path = join(directory, `${asset.id}.png`);
      // Fully decode and normalize; only re-encoded pixels enter the render browser.
      await image.rotate().png().toFile(path);
      await rm(source);
      return {path, mimeType: 'image/png'};
    }
    let demuxer;
    let extension;
    if (sig.subarray(4, 8).toString() === 'ftyp') { demuxer = 'mov'; extension = 'mp4'; }
    else if (sig.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) { demuxer = 'matroska'; extension = 'webm'; }
    else if (sig.subarray(0, 4).toString() === 'RIFF' && sig.subarray(8, 12).toString() === 'WAVE') { demuxer = 'wav'; extension = 'wav'; }
    else if (sig.subarray(0, 3).toString() === 'ID3' || (sig[0] === 0xff && (sig[1] & 0xe0) === 0xe0)) { demuxer = 'mp3'; extension = 'mp3'; }
    else throw invalidAsset();
    const allowedMime = {mov: ['video/mp4', 'audio/mp4', 'audio/x-m4a'], matroska: ['video/webm'],
      wav: ['audio/wav', 'audio/x-wav'], mp3: ['audio/mpeg', 'audio/mp3']};
    if (!allowedMime[demuxer].includes(asset.mimeType)) throw invalidAsset();
    const input = ['-protocol_whitelist', 'file,pipe', '-f', demuxer, '-i', source];
    const {stdout} = await runMediaTool('ffprobe', [
      '-v', 'error', ...input, '-show_format', '-show_streams', '-of', 'json',
    ], {timeout: 15_000, maxBuffer: 1024 * 1024, windowsHide: true});
    const metadata = JSON.parse(stdout);
    const streams = metadata.streams || [];
    const media = streams.find(s => s.codec_type === asset.kind);
    const duration = Math.max(Number(metadata.format?.duration) || 0, Number(media?.duration) || 0);
    if (!media || !Number.isFinite(duration) || duration <= 0 || duration > 600 || streams.length > 8) throw invalidAsset();
    const video = streams.filter(s => s.codec_type === 'video');
    const audio = streams.filter(s => s.codec_type === 'audio');
    if (video.some(s => !['h264', 'vp8', 'vp9'].includes(s.codec_name) ||
      s.width < 1 || s.height < 1 || s.width > 4096 || s.height > 4096 || s.width * s.height > 8_847_360)) throw invalidAsset();
    if (audio.some(s => !['aac', 'mp3', 'opus', 'vorbis', 'pcm_s16le', 'pcm_s24le', 'pcm_s32le', 'pcm_f32le'].includes(s.codec_name) ||
      s.channels > 8 || Number(s.sample_rate) > 192000)) throw invalidAsset();
    if (asset.kind === 'audio' && video.some(s => s.disposition?.attached_pic !== 1)) throw invalidAsset();
    // Force a safe demuxer: uploaded playlists and external protocols never reach ffmpeg.
    const decoded = await runMediaTool('ffmpeg', ['-v', 'error', '-xerror', '-threads', '2', ...input,
      '-map', `0:${asset.kind === 'video' ? 'v' : 'a'}:0`, '-progress', 'pipe:1', '-nostats', '-f', 'null', '-'],
    {timeout: 30_000, maxBuffer: 1024 * 1024, windowsHide: true});
    const decodedTimes = [...decoded.stdout.matchAll(/^out_time_us=(\d+)$/gm)].map(m => Number(m[1]) / 1_000_000);
    const measured = Math.max(0, ...decodedTimes);
    if (!Number.isFinite(measured) || measured <= 0 || measured > 600) throw invalidAsset();
    const path = join(directory, `${asset.id}.${extension}`);
    await rename(source, path);
    return {path, mimeType: asset.mimeType, duration: measured};
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw invalidAsset();
  }
}
