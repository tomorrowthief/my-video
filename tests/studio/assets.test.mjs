/* global URL, File, queueMicrotask */
import assert from 'node:assert/strict';
import {test, beforeEach, afterEach, mock} from 'node:test';
import './helpers.mjs';
const {inspectAsset} = await import('../../src/studio/assets.ts');
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0]);
const wav = new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 65, 86, 69, 0, 0, 0, 0]);
let created;
let revoked;
let imageSize;
let decodeError;
let mediaDuration;
let mediaFailure;
const previousImage = globalThis.Image;
const previousDocument = globalThis.document;
const previousWindow = globalThis.window;
beforeEach(() => {
  created = [];
  revoked = [];
  imageSize = [1200, 800];
  decodeError = null;
  mediaDuration = 2.5;
  mediaFailure = false;
  mock.method(URL, 'createObjectURL', () => { const url = `blob:test-${created.length}`; created.push(url); return url; });
  mock.method(URL, 'revokeObjectURL', url => { revoked.push(url); });
  globalThis.Image = class {
    naturalWidth = imageSize[0];
    naturalHeight = imageSize[1];
    async decode() { if (decodeError) throw decodeError; }
  };
  globalThis.window = globalThis;
  globalThis.document = {
    createElement() {
      return {
        duration: mediaDuration, onerror: null, onloadedmetadata: null,
        removeAttribute() {}, load() {},
        set src(_value) { queueMicrotask(() => mediaFailure ? this.onerror?.() : this.onloadedmetadata?.()); },
      };
    },
  };
});
afterEach(() => {
  mock.restoreAll();
  globalThis.Image = previousImage;
  globalThis.document = previousDocument;
  globalThis.window = previousWindow;
});
for (const [name, type, content] of [
  ['unsafe.svg', 'image/svg+xml', '<svg/>'],
  ['renamed.png', 'text/html', '<script/>'],
  ['wrong.png', 'image/jpeg', png],
  ['empty.png', 'image/png', ''],
  ['fake.png', 'image/png', 'not a PNG'],
]) test(`rejects ${name} before asking the browser to decode`, async () => {
  await assert.rejects(inspectAsset(new File([content], name, {type})));
  assert.deepEqual(created, []);
});
test('rejects file over 25 MiB before reading bytes or creating an object URL', async () => {
  await assert.rejects(inspectAsset({name: 'large.png', type: 'image/png', size: 25 * 1024 * 1024 + 1,
    slice() { throw new Error('must not read oversized file'); }}), /25 MB/);
  assert.deepEqual(created, []);
});
test('successful decoded image returns manifest only and releases its temporary URL', async () => {
  const result = await inspectAsset(new File([png], 'Picture.PNG', {type: 'image/png'}));
  assert.equal(result.kind, 'image');
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.size, png.length);
  assert.match(result.id, /^[a-zA-Z0-9_-]+$/);
  assert.equal('url' in result, false);
  assert.equal('blob' in result, false);
  assert.equal('durationSeconds' in result, false);
  assert.deepEqual(revoked, created);
});
test('browser decode failure releases the object URL and rejects the upload', async () => {
  decodeError = new Error('decode failed');
  await assert.rejects(inspectAsset(new File([png], 'broken.png', {type: 'image/png'})), /decode failed/);
  assert.deepEqual(revoked, created);
});
test('image above pixel budget is rejected and temporary URL is released', async () => {
  imageSize = [10000, 10000];
  await assert.rejects(inspectAsset(new File([png], 'huge.png', {type: 'image/png'})), /1677/);
  assert.deepEqual(revoked, created);
});
test('ordinary 24-megapixel image is rejected before accepting an unrenderable asset', async () => {
  imageSize = [6000, 4000];
  await assert.rejects(inspectAsset(new File([png], 'camera.png', {type: 'image/png'})), /1677/);
  assert.deepEqual(revoked, created);
});
for (const size of [[8193, 100], [100, 8193]]) test(`skinny image ${size.join('x')} exceeds supported edge length`, async () => {
  imageSize = size;
  await assert.rejects(inspectAsset(new File([png], 'panorama.png', {type: 'image/png'})), /8192/);
  assert.deepEqual(revoked, created);
});
for (const size of [[4096, 4096], [8192, 2048], [2048, 8192]]) test(`image ${size.join('x')} exactly meets pixel and edge boundaries`, async () => {
  imageSize = size;
  const result = await inspectAsset(new File([png], 'boundary.png', {type: 'image/png'}));
  assert.equal(result.kind, 'image');
  assert.deepEqual(revoked, created);
});
test('decoded audio duration is included in manifest and its URL is released', async () => {
  const result = await inspectAsset(new File([wav], 'voice.wav', {type: 'audio/wav'}));
  assert.equal(result.kind, 'audio');
  assert.equal(result.durationSeconds, 2.5);
  assert.deepEqual(revoked, created);
});
for (const duration of [0, -1, Infinity, NaN, 600.001]) test(`rejects invalid decoded media duration ${duration}`, async () => {
  mediaDuration = duration;
  await assert.rejects(inspectAsset(new File([wav], 'voice.wav', {type: 'audio/wav'})), /时长/);
  assert.deepEqual(revoked, created);
});
test('browser media decoding failure rejects upload and releases temporary URL', async () => {
  mediaFailure = true;
  await assert.rejects(inspectAsset(new File([wav], 'voice.wav', {type: 'audio/wav'})), /无法解码/);
  assert.deepEqual(revoked, created);
});
