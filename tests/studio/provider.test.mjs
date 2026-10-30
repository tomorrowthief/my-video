import assert from 'node:assert/strict';
import {test, afterEach} from 'node:test';
import {project} from './helpers.mjs';
const {generateStoryboard, modifyStoryboard, synthesizeSpeech, testConnection} = await import('../../src/studio/provider.ts');

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const connection = {baseUrl: 'https://example.com/v1/', apiKey: 'private-key', model: 'model'};
const tts = {...connection, voice: 'voice', speed: 1};

test('storyboard uses same-origin proxy and sends credentials only in proxy JSON', async () => {
  const p = project();
  const controller = new AbortController();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/studio/models/request');
    assert.equal(options.signal, controller.signal);
    assert.equal(options.headers.Authorization, undefined);
    const input = JSON.parse(options.body);
    assert.equal(input.url, 'https://example.com/v1/chat/completions');
    assert.equal(input.apiKey, connection.apiKey);
    assert.equal(input.body.stream, false);
    assert.ok(!JSON.stringify(input.body).includes(connection.apiKey));
    return Response.json({choices: [{message: {content: JSON.stringify({scenes: p.scenes})}}]});
  };
  assert.deepEqual(await generateStoryboard(p, connection, controller.signal), p.scenes);
});

test('speech proxies full endpoint without appending it twice, and returns binary audio', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/studio/models/request');
    const input = JSON.parse(options.body);
    assert.equal(input.url, 'https://example.com/v1/audio/speech');
    assert.equal(input.body.input, '你好');
    assert.equal(input.body.voice, 'voice');
    return new Response(new Uint8Array([1, 2, 3]), {headers: {'content-type': 'audio/wav'}});
  };
  const audio = await synthesizeSpeech('你好', {...tts, baseUrl: 'https://example.com/v1/audio/speech'});
  assert.equal(audio.type, 'audio/wav');
  assert.equal(audio.size, 3);
});

test('connection test makes one actual inference request without a model-list probe', async () => {
  let calls = 0;
  globalThis.fetch = async (_, options) => {
    calls++;
    assert.equal(JSON.parse(options.body).url, 'https://example.com/v1/chat/completions');
    return Response.json({choices: [{message: {content: '连接成功'}}]});
  };
  await testConnection('language', {language: connection, tts});
  assert.equal(calls, 1);
});

test('proxy errors are surfaced, and unavailable backend explains how to recover', async () => {
  globalThis.fetch = async () => Response.json({error: {message: '模型服务认证失败。'}}, {status: 401});
  await assert.rejects(testConnection('language', {language: connection, tts}), /模型服务认证失败/);
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  await assert.rejects(testConnection('language', {language: connection, tts}), /本地 Studio 后端已启动/);
});

test('cancelled request preserves abort instead of reporting a network failure', async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_, options) => { options.signal.throwIfAborted(); };
  await assert.rejects(generateStoryboard(project(), connection, controller.signal), {name: 'AbortError'});
});

test('editing one scene preserves other scenes and rejects invalid model output', async () => {
  const p = project();
  p.scenes.push({...p.scenes[0], id: 'scene-2', durationInFrames: 30});
  const replacement = {...p.scenes[0], title: '新标题'};
  globalThis.fetch = async () => Response.json({choices: [{message: {content: JSON.stringify({scenes: [replacement]})}}]});
  const result = await modifyStoryboard(p, '改标题', connection, 'scene-1');
  assert.equal(result[0].title, '新标题');
  assert.deepEqual(result[1], p.scenes[1]);
  globalThis.fetch = async () => Response.json({choices: [{message: {content: '{"scenes":[]}'}}]});
  await assert.rejects(generateStoryboard(p, connection), /分镜格式或时长/);
});


test('native DashScope full speech URL is forwarded without an extra suffix', async () => {
  const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  globalThis.fetch = async (_, options) => {
    assert.equal(JSON.parse(options.body).url, baseUrl);
    return new Response(new Uint8Array([1]), {headers: {'content-type': 'audio/wav'}});
  };
  await synthesizeSpeech('你好', {...tts, baseUrl});
});
