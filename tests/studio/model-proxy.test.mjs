import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {checkedTarget, proxyModel, publicAddress, handleModelRequest} from '../../server/model-proxy.mjs';

const lookup = async () => [{address: '8.8.8.8', family: 4}];
const input = {url: 'https://models.example/v1/chat/completions', apiKey: 'test-key', body: {model: 'test', messages: []}};
const json = value => ({status: 200, contentType: 'application/json', data: Buffer.from(JSON.stringify(value))});

test('forwards JSON and bearer to validated pinned target, sanitizes upstream failure', async () => {
  await assert.rejects(proxyModel(input, {lookup, transport: async (target, request) => {
    assert.equal(target.address.address, '8.8.8.8');
    assert.equal(request.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(request.body), input.body);
    return {...json({error: {message: 'bad model'}}), status: 400};
  }}), error => error.status === 400 && error.code === 'MODEL_UPSTREAM_ERROR' && !error.message.includes('bad model'));
});

test('rejects insecure URLs, private and mixed DNS addresses before transport', async () => {
  for (const url of ['http://models.example', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://user:pass@models.example', 'https://models.example:8443']) {
    await assert.rejects(checkedTarget(url, async () => [{address: '127.0.0.1', family: 4}]), {code: 'INVALID_MODEL_REQUEST'});
  }
  await assert.rejects(checkedTarget(input.url, async () => [{address: '8.8.8.8', family: 4}, {address: '10.0.0.1', family: 4}]), {code: 'INVALID_MODEL_REQUEST'});
  for (const ip of ['169.254.169.254', '172.16.0.1', '192.168.1.1', '100.64.0.1', '::ffff:127.0.0.1', 'fc00::1', '2001:db8::1']) assert.equal(publicAddress(ip), false);
});

test('normalizes native DashScope chat endpoint', async () => {
  await proxyModel({...input, url: 'https://dashscope.aliyuncs.com/api/v1/chat/completions'}, {lookup, transport: async target => {
    assert.equal(target.url.pathname, '/compatible-mode/v1/chat/completions');
    return json({choices: []});
  }});
});

test('adapts Qwen TTS, downloads over TLS without bearer and returns WAV', async () => {
  let calls = 0;
  const result = await proxyModel({...input, url: 'https://dashscope.aliyuncs.com/api/v1/audio/speech', body: {model: 'qwen3-tts-flash', input: '你好', voice: 'Cherry', speed: 1}}, {lookup, transport: async (target, request) => {
    calls++;
    if (calls === 1) {
      assert.equal(target.url.pathname, '/api/v1/services/aigc/multimodal-generation/generation');
      assert.deepEqual(JSON.parse(request.body), {model: 'qwen3-tts-flash', input: {text: '你好', voice: 'Cherry', language_type: 'Auto'}});
      return json({output: {audio: {url: 'http://result.oss-cn-beijing.aliyuncs.com/result.wav?Signature=secret'}}});
    }
    assert.equal(target.url.protocol, 'https:');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers.Authorization, undefined);
    return {status: 200, contentType: 'application/octet-stream', data: Buffer.from('RIFF')};
  }});
  assert.equal(calls, 2);
  assert.equal(result.contentType, 'audio/wav');
});

test('rejects unsupported DashScope TTS model and redirects without a second call', async () => {
  await assert.rejects(proxyModel({...input, url: 'https://dashscope.aliyuncs.com/api/v1/audio/speech', body: {model: 'cosyvoice-v2'}}, {lookup}), {code: 'INVALID_MODEL_REQUEST'});
  await assert.rejects(proxyModel(input, {lookup, transport: async () => ({status: 302})}), {code: 'MODEL_REDIRECT_REJECTED'});
});

test('validates native audio URL and does not fetch private output target', async () => {
  let calls = 0;
  await assert.rejects(proxyModel({...input, url: 'https://dashscope.aliyuncs.com/api/v1/audio/speech', body: {model: 'qwen3-tts-flash', input: '你好'}}, {lookup, transport: async () => {
    calls++;
    return json({output: {audio: {url: 'https://127.0.0.1/private'}}});
  }}), {code: 'INVALID_MODEL_REQUEST'});
  assert.equal(calls, 1);
});

test('sanitizes transport failures and honors cancellation', async () => {
  await assert.rejects(proxyModel(input, {lookup, transport: async () => {throw new Error('test-key secret');}}), error => error.code === 'MODEL_CONNECTION_FAILED' && !error.message.includes('secret'));
  await assert.rejects(proxyModel(input, {lookup, signal: AbortSignal.abort()}), {code: 'MODEL_TIMEOUT'});
});

test('bounds incoming JSON before parsing or any upstream request', async () => {
  const req = Readable.from([Buffer.alloc(1024 * 1024 + 1)]);
  req.headers = {'content-type': 'application/json'};
  const res = new Readable({read() {}});
  await assert.rejects(handleModelRequest(req, res), {status: 413});
});

 test('supports complete native TTS endpoint with native input body', async () => {
  let calls = 0;
  const result = await proxyModel({...input, url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', body: {model: 'qwen3-tts-flash', input: {text: '你好', voice: 'Cherry'}}}, {lookup, transport: async (_target, request) => {
    if (++calls === 1) {
      assert.deepEqual(JSON.parse(request.body).input, {text: '你好', voice: 'Cherry'});
      return json({output: {audio: {url: 'https://audio.example/result.wav'}}});
    }
    return {status: 200, contentType: 'audio/wav', data: Buffer.from('RIFF')};
  }});
  assert.equal(result.contentType, 'audio/wav');
});
