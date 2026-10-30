/* global structuredClone */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {project, asset} from './helpers.mjs';
const {parseStudioProject, totalFrames, dimensions, referencedAssetIds, MAX_ASSET_BYTES, MAX_UPLOAD_BYTES} = await import('../../src/studio/schema.ts');
const rejects = p => assert.throws(() => parseStudioProject(p));

test('valid Chinese project survives validation without mutation', () => {
  const p = project();
  const before = structuredClone(p);
  assert.deepEqual(parseStudioProject(p), p);
  assert.deepEqual(p, before);
});
test('sample project meets schema and declared 60-second duration', async () => {
  const {createSampleProject} = await import('../../src/studio/sample.ts');
  const p = parseStudioProject(createSampleProject());
  assert.equal(totalFrames(p), 60 * p.fps);
  assert.equal(p.targetDurationSeconds, 60);
});

for (const [label, change] of [
  ['remote asset sources', p => { p.assetSources = {image: 'https://evil.invalid/x.png'}; }],
  ['provider API key', p => { p.apiKey = 'secret'; }],
  ['model config', p => { p.language = {apiKey: 'secret'}; }],
  ['generated executable source', p => { p.scenes[0].code = 'fetch("https://evil.invalid")'; }],
  ['asset URL', p => { p.assets = [asset('image', {url: 'http://127.0.0.1/private'})]; }],
  ['asset path', p => { p.assets = [asset('image', {path: '/etc/passwd'})]; }],
  ['scene stylesheet', p => { p.scenes[0].css = 'url(https://evil.invalid)'; }],
  ['path traversal ID', p => { p.id = '../escape'; }],
  ['URL ID', p => { p.scenes[0].id = 'https://evil.invalid'; }],
  ['path asset reference', p => { p.scenes[0].assetId = '..\\file'; }],
  ['non-hex CSS color', p => { p.scenes[0].backgroundColor = 'url(https://evil.invalid)'; }],
  ['non-supported FPS', p => { p.fps = 60; }],
  ['non-supported aspect ratio', p => { p.aspectRatio = '1:1'; }],
  ['non-supported target duration', p => { p.targetDurationSeconds = 45; }],
  ['future schema', p => { p.schemaVersion = 2; }],
  ['invalid date', p => { p.createdAt = 'yesterday'; }],
  ['negative revision', p => { p.revision = -1; }],
  ['fractional scene frames', p => { p.scenes[0].durationInFrames = 1.5; }],
  ['zero scene frames', p => { p.scenes[0].durationInFrames = 0; }],
  ['empty scenes', p => { p.scenes = []; }],
  ['duplicate scene IDs', p => { p.scenes.push({...p.scenes[0]}); }],
  ['more than 20 scenes', p => { p.scenes = Array.from({length: 21}, (_, i) => ({...p.scenes[0], id: `s${i}`, durationInFrames: 1})); }],
  ['duplicate asset IDs', p => { p.assets = [asset(), asset()]; }],
  ['asset MIME-kind mismatch', p => { p.assets = [asset('audio', {mimeType: 'image/png'})]; }],
  ['unsupported SVG', p => { p.assets = [asset('image', {mimeType: 'image/svg+xml'})]; }],
  ['zero byte asset', p => { p.assets = [asset('image', {size: 0})]; }],
  ['oversized single asset', p => { p.assets = [asset('image', {size: MAX_ASSET_BYTES + 1})]; }],
  ['oversized project', p => { p.assets = Array.from({length: 5}, (_, i) => asset('image', {id: `a${i}`, size: MAX_ASSET_BYTES})); }],
  ['too many assets', p => { p.assets = Array.from({length: 21}, (_, i) => asset('image', {id: `a${i}`})); }],
  ['infinite duration', p => { p.assets = [asset('audio', {durationSeconds: Infinity})]; }],
  ['overlong media', p => { p.assets = [asset('audio', {durationSeconds: 600.01})]; }],
  ['negative music volume', p => { p.musicVolume = -0.1; }],
  ['over-amplified music', p => { p.musicVolume = 1.01; }],
]) test(`rejects ${label}`, () => { const p = project(); change(p); rejects(p); });

test('accepts exact 90-second boundary but rejects total exceeding by one frame', () => {
  const p = project();
  p.scenes[0].durationInFrames = 2700;
  assert.equal(totalFrames(parseStudioProject(p)), 2700);
  p.scenes.push({...p.scenes[0], id: 'scene-2', durationInFrames: 1});
  rejects(p);
});
test('accepts exact single-file and total-size boundaries', () => {
  const p = project();
  p.assets = Array.from({length: 4}, (_, i) => asset('image', {id: `a${i}`, size: MAX_ASSET_BYTES}));
  assert.equal(parseStudioProject(p).assets.reduce((n, a) => n + a.size, 0), MAX_UPLOAD_BYTES);
});

for (const [label, change] of [
  ['missing visual', p => { p.scenes[0].assetId = 'missing'; }],
  ['audio in visual slot', p => { p.assets = [asset('audio')]; p.scenes[0].assetId = 'audio-1'; }],
  ['missing voice', p => { p.scenes[0].voiceAssetId = 'missing'; p.scenes[0].voiceNarration = p.scenes[0].narration; }],
  ['image in voice slot', p => { p.assets = [asset()]; p.scenes[0].voiceAssetId = 'image-1'; p.scenes[0].voiceNarration = p.scenes[0].narration; }],
  ['missing music', p => { p.musicAssetId = 'missing'; }],
  ['video in music slot', p => { p.assets = [asset('video')]; p.musicAssetId = 'video-1'; }],
  ['stale narration audio', p => { p.assets = [asset('audio')]; p.scenes[0].voiceAssetId = 'audio-1'; p.scenes[0].voiceNarration = '旧旁白'; }],
  ['voice without narration provenance', p => { p.assets = [asset('audio')]; p.scenes[0].voiceAssetId = 'audio-1'; }],
]) test(`rejects ${label}`, () => { const p = project(); change(p); rejects(p); });

test('voice must fit after rounding real duration up to a full frame', () => {
  const p = project();
  p.assets = [asset('audio', {durationSeconds: 30})];
  Object.assign(p.scenes[0], {voiceAssetId: 'audio-1', voiceNarration: p.scenes[0].narration});
  assert.doesNotThrow(() => parseStudioProject(p));
  p.assets[0].durationSeconds = 30.001;
  rejects(p);
  p.scenes[0].durationInFrames = 901;
  assert.doesNotThrow(() => parseStudioProject(p));
});
test('optional voice settings fingerprint accepts SHA256 and rejects plaintext credentials', () => {
  const p = project();
  p.assets = [asset('audio', {durationSeconds: 1})];
  Object.assign(p.scenes[0], {voiceAssetId: 'audio-1', voiceNarration: p.scenes[0].narration,
    voiceSettingsFingerprint: 'a'.repeat(64)});
  assert.equal(parseStudioProject(p).scenes[0].voiceSettingsFingerprint, 'a'.repeat(64));
  p.scenes[0].voiceSettingsFingerprint = 'apiKey=private-key';
  rejects(p);
});
test('referenced assets include visuals, voice and music exactly once, omitting unused assets', () => {
  const p = project();
  p.assets = [asset(), asset('audio'), asset('video')];
  Object.assign(p.scenes[0], {assetId: 'image-1', voiceAssetId: 'audio-1', voiceNarration: p.scenes[0].narration});
  p.musicAssetId = 'audio-1';
  p.scenes.push({...p.scenes[0], id: 'scene-2'});
  assert.deepEqual(referencedAssetIds(parseStudioProject(p)), ['image-1', 'audio-1']);
});
test('dimensions map both user-selected orientations to 1080p', () => {
  assert.deepEqual(dimensions('16:9'), {width: 1920, height: 1080});
  assert.deepEqual(dimensions('9:16'), {width: 1080, height: 1920});
});
