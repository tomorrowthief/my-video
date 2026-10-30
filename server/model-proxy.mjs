import {request as httpsRequest} from 'node:https';
import {lookup as dnsLookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {HttpError} from './errors.mjs';

const maxInput = 1024 * 1024;
const maxOutput = 32 * 1024 * 1024;
const invalid = message => new HttpError(400, 'INVALID_MODEL_REQUEST', message);
const upstreamError = () => new HttpError(502, 'MODEL_CONNECTION_FAILED', '无法连接模型服务，请检查 Base URL、网络及接口配置。');

export function publicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) ||
      (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)));
  }
  // Only globally routable IPv6, excluding transition mechanisms and documentation ranges.
  return isIP(address) === 6 && /^[23]/.test(address) && !/^200[12]:/i.test(address);
}

export async function checkedTarget(value, lookup = dnsLookup) {
  let url;
  try { url = new URL(value); } catch { throw invalid('模型 Base URL 无效。'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) {
    throw invalid('模型接口必须使用公网 HTTPS 地址（443 端口）。');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  let records;
  try { records = isIP(hostname) ? [{address: hostname, family: isIP(hostname)}] : await lookup(hostname, {all: true}); }
  catch { throw upstreamError(); }
  if (!records.length || records.some(record => !publicAddress(record.address))) throw invalid('模型接口不能指向本机或内网地址。');
  return {url, address: records[0]};
}

// Pin the validated DNS result for this TLS connection; never follow redirects or forward credentials to another host.
export function requestTarget(target, {method, headers, body, signal}) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(target.url, {method, headers, signal,
      lookup: (_hostname, options, callback) => options.all
        ? callback(null, [target.address]) : callback(null, target.address.address, target.address.family)}, response => {
      const parts = [];
      let length = 0;
      response.on('data', chunk => {
        length += chunk.length;
        if (length > maxOutput) { response.destroy(); reject(new HttpError(502, 'MODEL_RESPONSE_TOO_LARGE', '模型返回内容超过 32 MiB。')); }
        else parts.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => resolve({status: response.statusCode, contentType: response.headers['content-type'] || '', data: Buffer.concat(parts)}));
    });
    req.on('error', reject);
    req.end(body);
  });
}

export async function proxyModel(input, {signal, lookup = dnsLookup, transport = requestTarget} = {}) {
  if (!input || typeof input !== 'object' || typeof input.url !== 'string' ||
    typeof input.apiKey !== 'string' || !input.apiKey.trim() || input.apiKey.length > 8192 || /[\r\n]/.test(input.apiKey) ||
    !input.body || typeof input.body !== 'object' || Array.isArray(input.body)) throw invalid('请填写模型地址、API Key 和请求参数。');
  let url;
  try { url = new URL(input.url); } catch { throw invalid('模型 Base URL 无效。'); }
  let body = input.body;
  let nativeSpeech = false;
  const dashscope = ['dashscope.aliyuncs.com', 'dashscope-intl.aliyuncs.com', 'dashscope-us.aliyuncs.com'].includes(url.hostname);
  const nativePath = '/api/v1/services/aigc/multimodal-generation/generation';
  if (dashscope && (/^\/(?:api|compatible-mode)\/v1\/audio\/speech\/?$/.test(url.pathname) || url.pathname === nativePath)) {
    if (!/^qwen(?:3)?-tts-(?:instruct-)?flash(?:-\d{4}-\d{2}-\d{2})?$/.test(body.model || '')) {
      throw invalid('百炼此语音入口支持 qwen3-tts-flash 等非实时 Qwen-TTS 模型；请更换模型，或填写服务支持的完整语音接口地址。');
    }
    const speechInput = typeof body.input === 'object' && body.input !== null ? body.input : {text: body.input, voice: body.voice || 'Cherry', language_type: 'Auto'};
    if (typeof speechInput.text !== 'string' || !speechInput.text.trim()) throw invalid('配音文本不能为空。');
    url.pathname = nativePath;
    body = {model: body.model, input: speechInput};
    nativeSpeech = true;
  }
  if (dashscope && /^\/api\/v1\/chat\/completions\/?$/.test(url.pathname)) url.pathname = '/compatible-mode/v1/chat/completions';
  try {
    const target = await checkedTarget(url.href, lookup);
    signal?.throwIfAborted();
    const result = await transport(target, {method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${input.apiKey.trim()}`}, body: JSON.stringify(body), signal});
    if (result.status >= 300 && result.status < 400) throw new HttpError(502, 'MODEL_REDIRECT_REJECTED', '模型接口返回重定向，请填写最终接口地址。');
    if (result.status < 200 || result.status >= 400) {
      const messages = {401: '模型服务认证失败，请检查 API Key。', 403: '模型服务拒绝访问，请检查权限或区域配置。', 404: '模型接口或模型不存在，请检查 Base URL 和模型名称。', 429: '模型服务请求过于频繁或额度不足，请稍后重试。'};
      throw new HttpError(result.status >= 400 && result.status < 600 ? result.status : 502, 'MODEL_UPSTREAM_ERROR', messages[result.status] || '模型服务返回错误，请检查模型、音色及请求参数后重试。');
    }
    if (nativeSpeech && result.status >= 200 && result.status < 300) {
      let payload;
      try { payload = JSON.parse(result.data.toString()); } catch { throw upstreamError(); }
      if (!payload.output?.audio?.url) throw new HttpError(502, 'MODEL_INVALID_AUDIO', '百炼未返回音频地址，请检查语音模型和音色配置。');
      const audioUrl = new URL(payload.output.audio.url);
      // DashScope documented OSS URLs can use HTTP; upgrade to TLS before downloading.
      if (audioUrl.protocol === 'http:') audioUrl.protocol = 'https:';
      const audioTarget = await checkedTarget(audioUrl.href, lookup);
      signal?.throwIfAborted();
      const audio = await transport(audioTarget, {method: 'GET', headers: {}, signal});
      if (audio.status < 200 || audio.status >= 300) throw new HttpError(502, 'MODEL_AUDIO_DOWNLOAD_FAILED', '模型生成成功，但下载配音失败，请重试。');
      return {...audio, contentType: audio.contentType.startsWith('audio/') ? audio.contentType : 'audio/wav'};
    }
    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (signal?.aborted) throw new HttpError(504, 'MODEL_TIMEOUT', '模型请求已取消或超时，请稍后重试。');
    throw upstreamError();
  }
}

export async function handleModelRequest(req, res) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw invalid('请求必须为 JSON。');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  const cancel = () => { if (!res.writableEnded) controller.abort(); };
  req.once('aborted', cancel);
  res.once('close', cancel);
  try {
    let length = 0;
    const parts = [];
    for await (const chunk of req) {
      length += chunk.length;
      if (length > maxInput) throw new HttpError(413, 'MODEL_REQUEST_TOO_LARGE', '模型请求超过 1 MiB。');
      parts.push(chunk);
    }
    let input;
    try { input = JSON.parse(Buffer.concat(parts).toString()); } catch { throw invalid('请求 JSON 无效。'); }
    const result = await proxyModel(input, {signal: controller.signal});
    if (!res.destroyed) res.writeHead(result.status, {'Content-Type': result.contentType.startsWith('audio/') || result.contentType === 'application/octet-stream' ? result.contentType : 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}).end(result.data);
  } finally {
    clearTimeout(timer);
    req.removeListener('aborted', cancel);
    res.removeListener('close', cancel);
  }
}
