import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, readFile, readdir, rm, writeFile, mkdir} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {setTimeout as pause} from 'node:timers/promises';
import sharp from 'sharp';
import {runMediaTool} from './media-tools.mjs';

const temporary = await mkdtemp(join(tmpdir(), 'studio-api-test-'));
const port = 35000 + Math.floor(Math.random() * 20000);
const base = `http://127.0.0.1:${port}/api/studio`;
const service = spawn(process.execPath, ['--experimental-strip-types', 'server/index.mjs'], {
  cwd: process.cwd(), env: {...process.env, STUDIO_PORT: String(port), STUDIO_DATA_DIR: temporary},
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
service.stdout.on('data', chunk => { logs += chunk; });
service.stderr.on('data', chunk => { logs += chunk; });
const project = (aspectRatio = '16:9') => ({schemaVersion: 1, id: 'smoke-project', revision: 0,
  name: '中文视频导出验收', createdAt: '2026-10-22T00:00:00.000Z', updatedAt: '2026-10-22T00:00:00.000Z',
  brief: '测试', stylePrompt: '温暖简洁', aspectRatio, targetDurationSeconds: 30, fps: 30,
  scenes: [{id: 'scene-1', title: '让每个想法，成为视频', body: '独立模型配置 · 分镜与配音 · MP4 导出',
    narration: '中文视频导出验收。', durationInFrames: 45, layout: 'title', backgroundColor: '#F3F1EA',
    accentColor: '#CC5E37', showCaptions: true}], assets: [], musicVolume: 0.15});
async function submit(p, files = {}) {
  const form = new FormData();
  form.set('project', JSON.stringify(p));
  for (const [id, buffer] of Object.entries(files)) {
    const asset = p.assets.find(a => a.id === id);
    form.set(`asset.${id}`, new Blob([buffer], {type: asset.mimeType}), asset.name);
  }
  return fetch(`${base}/renders`, {method: 'POST', body: form});
}
const headers = receipt => ({Authorization: `Bearer ${receipt.token}`});
async function complete(receipt) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const response = await fetch(`${base}/renders/${receipt.jobId}`, {headers: headers(receipt)});
    assert.equal(response.status, 200);
    const job = await response.json();
    assert.equal('tokenHash' in job, false);
    if (job.status === 'completed') { assert.equal(job.progress, 1); return; }
    if (job.status === 'failed') throw new Error(`真实渲染失败：${job.error?.code}`);
    await pause(300);
  }
  throw new Error('导出测试超时');
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    const response = await fetch(`${base}/health`).catch(() => null);
    if (response?.ok) { ready = true; break; }
    if (service.exitCode !== null) throw new Error('渲染服务启动失败');
    await pause(100);
  }
  assert(ready, '健康检查失败；请检查 ffmpeg/ffprobe');
  assert.equal((await fetch(`${base}/health`, {headers: {Origin: 'https://unknown.invalid'}})).status, 403);
  const invalid = await submit({...project(), assetSources: {image: 'http://127.0.0.1/private'}});
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error.code, 'INVALID_PROJECT');
  const invalidImage = Buffer.from('this is not a PNG');
  const broken = project();
  broken.assets = [{id: 'broken', name: 'fake.png', kind: 'image', mimeType: 'image/png', size: invalidImage.length}];
  broken.scenes[0].assetId = 'broken';
  const brokenResponse = await submit(broken, {broken: invalidImage});
  assert.equal(brokenResponse.status, 400);
  assert.equal((await brokenResponse.json()).error.code, 'INVALID_ASSET');

  const image = await sharp({create: {width: 640, height: 480, channels: 3, background: '#CEDDC5'}}).png().toBuffer();
  const audioPath = join(temporary, 'voice.wav');
  await runMediaTool('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.5',
    '-c:a', 'pcm_s16le', audioPath]);
  const audio = await readFile(audioPath);
  const landscape = project();
  landscape.assets = [
    {id: 'picture', name: 'picture.png', kind: 'image', mimeType: 'image/png', size: image.length},
    {id: 'voice', name: 'voice.wav', kind: 'audio', mimeType: 'audio/wav', size: audio.length, durationSeconds: 0.5},
  ];
  Object.assign(landscape.scenes[0], {layout: 'split', assetId: 'picture', voiceAssetId: 'voice',
    voiceNarration: landscape.scenes[0].narration});
  for (const [aspect, p, files] of [
    ['landscape', landscape, {picture: image, voice: audio}], ['portrait', project('9:16'), {}],
  ]) {
    const response = await submit(p, files);
    assert.equal(response.status, 202, `创建 ${aspect} 任务失败`);
    const receipt = await response.json();
    assert.equal((await fetch(`${base}/renders/${receipt.jobId}`)).status, 404);
    assert.equal((await fetch(`${base}/renders/${receipt.jobId}`, {headers: {Authorization: `Bearer ${'x'.repeat(43)}`}})).status, 404);
    assert.equal((await fetch(`${base}/renders/${receipt.jobId}/download`, {headers: headers(receipt)})).status, 409);
    await complete(receipt);
    const download = await fetch(`${base}/renders/${receipt.jobId}/download`, {headers: headers(receipt)});
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('content-type'), 'video/mp4');
    const file = join(temporary, `${aspect}.mp4`);
    await writeFile(file, Buffer.from(await download.arrayBuffer()));
    const {stdout} = await runMediaTool('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
    const info = JSON.parse(stdout);
    const video = info.streams.find(s => s.codec_type === 'video');
    assert.equal(video.codec_name, 'h264');
    assert.equal(video.width, aspect === 'landscape' ? 1920 : 1080);
    assert.equal(video.height, aspect === 'landscape' ? 1080 : 1920);
    assert.equal(info.streams.find(s => s.codec_type === 'audio')?.codec_name, 'aac');
    assert(Math.abs(Number(info.format.duration) - 1.5) < 0.15);
    if (process.env.STUDIO_TEST_OUTPUT_DIR) {
      await mkdir(resolve(process.env.STUDIO_TEST_OUTPUT_DIR), {recursive: true});
      await writeFile(join(resolve(process.env.STUDIO_TEST_OUTPUT_DIR), `${aspect}.mp4`), await readFile(file));
    }
    console.log(`${aspect}: H.264/AAC ${video.width}×${video.height}，1.5 秒，真实导出通过。`);
  }

  const long = project();
  long.scenes[0].durationInFrames = 2700;
  const startCancel = await submit(long);
  assert.equal(startCancel.status, 202);
  const cancellation = await startCancel.json();
  const cancelUrl = `${base}/renders/${cancellation.jobId}/cancel`;
  const cancelled = await fetch(cancelUrl, {method: 'POST', headers: headers(cancellation)});
  assert.equal((await cancelled.json()).status, 'cancelled');
  assert.equal((await (await fetch(cancelUrl, {method: 'POST', headers: headers(cancellation)})).json()).status, 'cancelled');
  assert.equal((await fetch(`${base}/renders/${cancellation.jobId}/download`, {headers: headers(cancellation)})).status, 409);
  await pause(3500);
  assert.deepEqual((await readdir(join(temporary, 'jobs', cancellation.jobId))).sort(), ['job.json']);
  const quota = await submit(project());
  assert.equal(quota.status, 429);
  assert.equal((await quota.json()).error.code, 'QUOTA_EXCEEDED');
  console.log('非法来源/项目/伪造素材、任务鉴权、取消清理、额度检查全部通过。');
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  service.kill('SIGTERM');
  await new Promise(resolveExit => {
    if (service.exitCode !== null) resolveExit(); else service.once('close', resolveExit);
  });
  await rm(temporary, {recursive: true, force: true});
}
