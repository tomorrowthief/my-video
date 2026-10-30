/* global structuredClone */
import assert from 'node:assert/strict';
import {test, beforeEach} from 'node:test';
import {project} from './helpers.mjs';

// The browser API is mocked; these exercise application ordering and recovery,
// not IndexedDB durability, quota policy or browser transaction semantics.
const stores = new Map(['projects', 'blobs', 'history'].map(name => [name, new Map()]));
let failNextWrite = false;
let pendingWrites = 0;
let maxPendingWrites = 0;
const browserDatabase = {
  transaction(name) {
    const operations = [];
    let scheduled = false;
    const enqueue = operation => {
      operations.push(operation);
      if (scheduled) return;
      scheduled = true;
      pendingWrites++;
      maxPendingWrites = Math.max(maxPendingWrites, pendingWrites);
      globalThis.setTimeout(() => {
        pendingWrites--;
        if (failNextWrite) { failNextWrite = false; tx.onerror?.(); }
        else { operations.forEach(run => run()); tx.oncomplete?.(); }
      }, 1);
    };
    const tx = {objectStore() {
      return {
        get(key) {
          const request = {};
          globalThis.queueMicrotask(() => {
            request.result = structuredClone(stores.get(name).get(key));
            request.onsuccess?.();
          });
          return request;
        },
        put(value, key) {
          enqueue(() => stores.get(name).set(key, structuredClone(value)));
        },
        delete(key) { enqueue(() => stores.get(name).delete(key)); },
      };
    }};
    return tx;
  },
};
globalThis.indexedDB = {open() {
  const request = {};
  globalThis.queueMicrotask(() => { request.result = browserDatabase; request.onsuccess?.(); });
  return request;
}};
const {saveProject, loadProject, storeAssetBlob, loadAssetBlob, saveVersion, loadVersions, deleteAssetBlobs} = await import('../../src/studio/storage.ts');
beforeEach(() => {
  stores.forEach(store => store.clear());
  failNextWrite = false;
  pendingWrites = 0;
  maxPendingWrites = 0;
});

test('rapid saves preserve the latest revision and serialize writes', async () => {
  const p = project();
  await Promise.all(Array.from({length: 5}, (_, revision) => saveProject({...p, revision, name: `Revision ${revision}`})));
  const restored = await loadProject();
  assert.equal(restored.revision, 4);
  assert.equal(restored.name, 'Revision 4');
  assert.equal(maxPendingWrites, 1);
});
test('saving snapshots nested content before caller mutation', async () => {
  const p = project();
  const saving = saveProject(p);
  p.scenes[0].title = 'later edit';
  await saving;
  assert.equal((await loadProject()).scenes[0].title, '一个好故事');
});
test('a failed autosave is reported and does not poison later saves', async () => {
  failNextWrite = true;
  await assert.rejects(saveProject(project()), /保存失败/);
  await saveProject({...project(), revision: 1});
  assert.equal((await loadProject()).revision, 1);
});
test('loading invalid persisted projects refuses unexpected credential fields', async () => {
  stores.get('projects').set('current', {...project(), apiKey: 'must-not-be-in-project'});
  await assert.rejects(loadProject());
});
test('simultaneous checkpoints retain newest 20 distinct revisions and keep projects separate', async () => {
  const p = project();
  await Promise.all(Array.from({length: 25}, (_, revision) => saveVersion({...p, revision})));
  await saveVersion({...p, revision: 24, name: 'updated checkpoint'});
  await saveVersion({...p, id: 'another-project', revision: 1});
  const versions = await loadVersions(p.id);
  assert.deepEqual(versions.map(v => v.revision), Array.from({length: 20}, (_, i) => 24 - i));
  assert.equal(versions[0].name, 'updated checkpoint');
  assert.equal((await loadVersions('another-project')).length, 1);
});
test('binary asset content round-trips independently from project JSON', async () => {
  const blob = new globalThis.Blob(['audio bytes'], {type: 'audio/mpeg'});
  await storeAssetBlob('audio-1', blob);
  const restored = await loadAssetBlob('audio-1');
  assert.equal(restored.type, 'audio/mpeg');
  assert.equal(await restored.text(), 'audio bytes');
  assert.equal(await loadAssetBlob('missing'), undefined);
});
test('staged asset cleanup deletes only the requested blobs and tolerates missing IDs', async () => {
  const blob = new globalThis.Blob(['content']);
  for (const id of ['staged-1', 'staged-2', 'committed']) await storeAssetBlob(id, blob);
  await deleteAssetBlobs(['staged-1', 'staged-2', 'missing']);
  assert.equal(await loadAssetBlob('staged-1'), undefined);
  assert.equal(await loadAssetBlob('staged-2'), undefined);
  assert.equal(await (await loadAssetBlob('committed')).text(), 'content');
  await deleteAssetBlobs([]);
});
test('failed staged cleanup reports failure and keeps unrelated committed assets', async () => {
  await storeAssetBlob('committed', new globalThis.Blob(['retained']));
  failNextWrite = true;
  await assert.rejects(deleteAssetBlobs(['staged']));
  assert.equal(await (await loadAssetBlob('committed')).text(), 'retained');
});
