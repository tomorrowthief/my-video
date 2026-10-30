import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {mkdir, readdir, readFile, rename, rm, stat, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createHash, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {receiveProject} from './upload.mjs';
import {HttpError} from './errors.mjs';
import {runMediaTool} from './media-tools.mjs';
import {handleModelRequest} from './model-proxy.mjs';

const host = process.env.STUDIO_HOST || '127.0.0.1';
const port = Number(process.env.STUDIO_PORT || 3401);
const localIdentity = createHash('sha256').update(process.cwd()).digest('hex').slice(0, 12);
const data = resolve(process.env.STUDIO_DATA_DIR || join(tmpdir(), `video-studio-${localIdentity}`));
const jobsDirectory = join(data, 'jobs');
const bundleDirectory = join(data, 'bundle');
const origins = new Set((process.env.STUDIO_ALLOWED_ORIGINS || 'http://localhost:3200,http://127.0.0.1:3200,http://localhost:3412,http://127.0.0.1:3412').split(','));
const allowedHosts = new Set((process.env.STUDIO_ALLOWED_HOSTS || 'localhost,127.0.0.1,[::1]').split(','));
const maxQueue = 3;
const retention = 24 * 60 * 60 * 1000;
const maxRuntime = 15 * 60 * 1000;
const jobs = new Map();
const queue = [];
const hourly = new Map();
let active;
let uploads = 0;
let shuttingDown = false;
let ready = false;
let persistence = Promise.resolve();
const hash = token => createHash('sha256').update(token).digest('hex');
const timestamp = () => new Date().toISOString();
const terminal = job => ['completed', 'failed', 'cancelled'].includes(job.status);
const publicJob = job => Object.fromEntries(Object.entries(job).filter(([key]) => key !== 'tokenHash'));
const directoryFor = id => join(jobsDirectory, id);
const json = (res, status, value) => {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'}).end(JSON.stringify(value));
};
const save = job => {
  const snapshot = JSON.stringify(job);
  persistence = persistence.catch(() => {}).then(async () => {
    const file = join(directoryFor(job.jobId), 'job.json');
    await writeFile(file + '.tmp', snapshot, {mode: 0o600});
    await rename(file + '.tmp', file);
  });
  return persistence;
};
const update = (job, changes) => { Object.assign(job, changes, {updatedAt: timestamp()}); return save(job); };
async function cleanInputs(job, keepOutput = false) {
  const directory = directoryFor(job.jobId);
  for (const name of await readdir(directory).catch(() => [])) {
    if (['job.json', 'job.json.tmp'].includes(name) || (keepOutput && name === 'output.mp4')) continue;
    await rm(join(directory, name), {recursive: true, force: true});
  }
}

function checkQuota(client) {
  const cutoff = Date.now() - 3_600_000;
  for (const [key, times] of hourly) {
    const recent = times.filter(t => t > cutoff);
    if (recent.length) hourly.set(key, recent); else hourly.delete(key);
  }
  const global = hourly.get('global') || [];
  const personal = hourly.get(client) || [];
  if (global.length >= 20 || personal.length >= 5) throw new HttpError(429, 'QUOTA_EXCEEDED', '已达到本地试用额度，请一小时后重试。');
  hourly.set('global', [...global, Date.now()]);
  hourly.set(client, [...personal, Date.now()]);
}

function terminate(runtime) {
  if (runtime.stopping) return;
  runtime.stopping = true;
  try { runtime.child.send('cancel'); } catch {}
  const kill = signal => {
    try {
      if (process.platform === 'win32') runtime.child.kill(signal);
      else process.kill(-runtime.child.pid, signal);
    } catch {}
  };
  runtime.term = setTimeout(() => kill('SIGTERM'), 750);
  runtime.kill = setTimeout(() => kill('SIGKILL'), 3000);
}

async function pump() {
  if (active || shuttingDown || !queue.length) return;
  const job = jobs.get(queue.shift());
  if (!job || terminal(job)) { void pump(); return; }
  const child = spawn(process.execPath, ['--experimental-strip-types', resolve('server/render-worker.mjs'),
    directoryFor(job.jobId), bundleDirectory], {cwd: process.cwd(), detached: process.platform !== 'win32',
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'], env: process.env});
  const runtime = {job, child};
  active = runtime;
  let completed = false;
  void update(job, {status: 'rendering', progress: 0}).catch(() => terminate(runtime));
  runtime.timeout = setTimeout(() => {
    if (!terminal(job)) {
      void update(job, {status: 'failed', error: {code: 'RENDER_TIMEOUT', message: '导出超过 15 分钟，请减少素材复杂度后重试。'}});
      terminate(runtime);
    }
  }, maxRuntime);
  child.on('message', message => {
    if (terminal(job)) return;
    if (message?.completed === true) completed = true;
    if (typeof message?.progress === 'number' && Number.isFinite(message.progress)) {
      void update(job, {progress: Math.max(job.progress, Math.min(0.99, message.progress))}).catch(() => terminate(runtime));
    }
  });
  let ended = false;
  const finish = async code => {
    if (ended) return;
    ended = true;
    clearTimeout(runtime.timeout);
    clearTimeout(runtime.term);
    // The whole process group must be gone before starting the next render or deleting assets.
    if (runtime.stopping && process.platform !== 'win32') {
      try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    }
    clearTimeout(runtime.kill);
    if (!terminal(job)) {
      if (code === 0 && completed && (await stat(join(directoryFor(job.jobId), 'output.mp4')).catch(() => null))?.size > 0) {
        await update(job, {status: 'completed', progress: 1});
      } else {
        await update(job, {status: 'failed', error: {code: 'RENDER_FAILED', message: '视频导出失败，请检查素材，或确认渲染服务与浏览器已安装。'}});
      }
    }
    await cleanInputs(job, job.status === 'completed');
    active = undefined;
    void pump();
  };
  child.once('error', () => { void finish(1).catch(() => { active = undefined; }); });
  child.once('close', code => { void finish(code).catch(() => { active = undefined; }); });
}

function authorized(req, id) {
  const job = jobs.get(id);
  const token = /^Bearer ([a-zA-Z0-9_-]{40,100})$/.exec(req.headers.authorization || '')?.[1];
  if (!job || !token || Date.parse(job.expiresAt) <= Date.now() ||
    !timingSafeEqual(Buffer.from(hash(token), 'hex'), Buffer.from(job.tokenHash, 'hex'))) {
    throw new HttpError(404, 'JOB_NOT_FOUND', '任务不存在或已过期。');
  }
  return job;
}

async function handle(req, res) {
  const requestHost = (req.headers.host || '').replace(/:\d+$/, '');
  if (!allowedHosts.has(requestHost)) throw new HttpError(403, 'INVALID_ORIGIN', '请求来源不受支持。');
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) throw new HttpError(403, 'INVALID_ORIGIN', '请从已配置的工作室网页访问。');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600'}).end(); return;
  }
  // Render inputs are never interpreted as paths; model URLs use the isolated, validated proxy.
  const path = req.url?.split('?')[0];
  if (req.method === 'POST' && path === '/api/studio/models/request') {
    if (!origin || !origins.has(origin)) throw new HttpError(403, 'INVALID_ORIGIN', '请从已配置的工作室网页调用模型。');
    await handleModelRequest(req, res); return;
  }
  if (req.method === 'GET' && path === '/api/studio/health') {
    json(res, ready ? 200 : 503, {status: ready ? 'ok' : 'unavailable', renderer: 'remotion',
      maxDurationSeconds: 90, maxUploadBytes: 104857600}); return;
  }
  if (req.method === 'POST' && path === '/api/studio/renders') {
    if (!ready || shuttingDown) throw new HttpError(503, 'RENDERER_UNAVAILABLE', '渲染服务暂不可用。');
    if (uploads >= 2 || queue.length + uploads >= maxQueue) throw new HttpError(429, 'QUEUE_FULL', '导出队列已满，请稍后重试。');
    checkQuota(req.socket.remoteAddress || 'local');
    uploads++;
    const id = randomUUID();
    const directory = directoryFor(id);
    try {
      await mkdir(directory, {mode: 0o700});
      const input = await receiveProject(req, directory);
      await writeFile(join(directory, 'input.json'), JSON.stringify(input), {mode: 0o600});
      const token = randomBytes(32).toString('base64url');
      const job = {jobId: id, tokenHash: hash(token), status: 'queued', progress: 0,
        createdAt: timestamp(), updatedAt: timestamp(), expiresAt: new Date(Date.now() + retention).toISOString()};
      await save(job);
      jobs.set(id, job);
      queue.push(id);
      json(res, 202, {jobId: id, token, status: 'queued'});
      void pump();
    } catch (error) {
      await rm(directory, {recursive: true, force: true});
      throw error;
    } finally { uploads--; }
    return;
  }
  const match = /^\/api\/studio\/renders\/([a-f0-9-]{36})(?:\/(cancel|download))?$/.exec(path || '');
  if (!match) throw new HttpError(404, 'NOT_FOUND', '接口不存在。');
  const job = authorized(req, match[1]);
  if (req.method === 'GET' && !match[2]) { json(res, 200, publicJob(job)); return; }
  if (req.method === 'POST' && match[2] === 'cancel') {
    if (!terminal(job)) {
      await update(job, {status: 'cancelled'});
      const index = queue.indexOf(job.jobId);
      if (index !== -1) queue.splice(index, 1);
      if (active?.job === job) terminate(active); else await cleanInputs(job);
    }
    json(res, 200, publicJob(job)); return;
  }
  if (req.method === 'GET' && match[2] === 'download') {
    if (job.status !== 'completed') throw new HttpError(409, 'JOB_NOT_READY', '视频尚未导出完成。');
    const file = join(directoryFor(job.jobId), 'output.mp4');
    const {size} = await stat(file);
    res.writeHead(200, {'Content-Type': 'video/mp4', 'Content-Length': size, 'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="studio-${job.jobId}.mp4"`, 'X-Content-Type-Options': 'nosniff'});
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    res.once('close', () => stream.destroy());
    stream.pipe(res); return;
  }
  throw new HttpError(405, 'METHOD_NOT_ALLOWED', '请求方法不受支持。');
}

await mkdir(jobsDirectory, {recursive: true, mode: 0o700});
await rm(bundleDirectory, {recursive: true, force: true});
for (const id of await readdir(jobsDirectory)) {
  if (!/^[a-f0-9-]{36}$/.test(id)) continue;
  try {
    const job = JSON.parse(await readFile(join(directoryFor(id), 'job.json'), 'utf8'));
    if (job.jobId !== id || !/^[a-f0-9]{64}$/.test(job.tokenHash) || Date.parse(job.expiresAt) <= Date.now()) throw new Error();
    jobs.set(id, job);
    if (!terminal(job)) await update(job, {status: 'failed', error: {code: 'SERVICE_RESTARTED', message: '服务重启中断了任务，请重新导出。'}});
    await cleanInputs(job, job.status === 'completed');
  } catch { await rm(directoryFor(id), {recursive: true, force: true}); }
}
try {
  await Promise.all(['ffprobe', 'ffmpeg'].map(bin => runMediaTool(bin, ['-version'], {timeout: 5000})));
  ready = true;
} catch { console.error('渲染服务需要 ffmpeg 和 ffprobe，请安装后重启。'); }

const server = createServer((req, res) => {
  void handle(req, res).catch(error => {
    if (!(error instanceof HttpError)) console.error('Studio 请求失败：内部处理错误。');
    json(res, error instanceof HttpError ? error.status : 500, {error: {
      code: error instanceof HttpError ? error.code : 'INTERNAL_ERROR',
      message: error instanceof HttpError ? error.message : '操作失败，请稍后重试。',
    }});
    if (!req.complete) { req.resume(); res.once('finish', () => { if (!req.complete) req.destroy(); }); }
  });
});
server.requestTimeout = 120_000;
server.headersTimeout = 15_000;
server.maxRequestsPerSocket = 100;
const cleanupTimer = setInterval(() => {
  for (const [id, job] of jobs) if (terminal(job) && Date.parse(job.expiresAt) <= Date.now()) {
    jobs.delete(id);
    void rm(directoryFor(id), {recursive: true, force: true});
  }
}, 60_000).unref();
const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(cleanupTimer);
  if (active) terminate(active);
  server.close();
  setTimeout(() => process.exit(0), 4000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.listen(port, host, () => console.log(`视频渲染服务：http://${host}:${port}`));
