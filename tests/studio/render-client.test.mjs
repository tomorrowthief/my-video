/* global Response, sessionStorage */
import assert from 'node:assert/strict';
import {test, beforeEach, afterEach, mock} from 'node:test';
import {MemoryStorage} from './helpers.mjs';
const {readRender, cancelRender, restoreRender} = await import('../../src/studio/render-client.ts');
const active = {jobId: 'job/1?outside=1', token: 'private-token', projectName: '测试'};
beforeEach(() => { globalThis.sessionStorage = new MemoryStorage(); });
afterEach(() => mock.restoreAll());

test('status and cancellation encode task IDs and send tokens only in Authorization', async () => {
  const calls = [];
  const job = {jobId: active.jobId, status: 'cancelled', progress: 0};
  mock.method(globalThis, 'fetch', async (url, options) => { calls.push([url, options]); return Response.json(job); });
  assert.deepEqual(await readRender(active), job);
  assert.deepEqual(await cancelRender(active), job);
  assert.equal(calls[0][0], '/api/studio/renders/job%2F1%3Foutside%3D1');
  assert.equal(calls[1][0], '/api/studio/renders/job%2F1%3Foutside%3D1/cancel');
  assert.equal(calls[1][1].method, 'POST');
  for (const [url, options] of calls) {
    assert.equal(url.includes(active.token), false);
    assert.equal(options.headers.Authorization, `Bearer ${active.token}`);
  }
});
test('structured API failure keeps HTTP status available for task recovery', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({error: {code: 'JOB_NOT_FOUND', message: '任务已过期'}}, {status: 404}));
  await assert.rejects(readRender(active), error => error.message === '任务已过期' && error.status === 404);
});
test('non-JSON server errors have a readable fallback', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('unavailable', {status: 503}));
  await assert.rejects(cancelRender(active), error => error.status === 503 && error.message.includes('503'));
});
test('active render restores from session for post-refresh polling', () => {
  sessionStorage.setItem('studio-active-render', JSON.stringify(active));
  assert.deepEqual(restoreRender(), active);
});
for (const value of ['{bad', 'null', '{}', '{"jobId":1,"token":"x","projectName":"x"}']) test(`ignores invalid task session ${value}`, () => {
  sessionStorage.setItem('studio-active-render', value);
  assert.equal(restoreRender(), null);
});
