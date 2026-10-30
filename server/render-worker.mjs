import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {access, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {makeCancelSignal, openBrowser, renderMedia, selectComposition} from '@remotion/renderer';

const directory = process.argv[2];
const bundleDirectory = process.argv[3];
const {project, assets} = JSON.parse(await readFile(join(directory, 'input.json'), 'utf8'));
const secret = randomBytes(32).toString('hex');
const {cancel, cancelSignal} = makeCancelSignal();
let cancelled = false;
let browser;
const stop = () => { cancelled = true; cancel(); };
process.on('message', message => { if (message === 'cancel') stop(); });
process.on('SIGTERM', stop);
const assetServer = createServer(async (req, res) => {
  const match = new RegExp(`^/${secret}/([a-zA-Z0-9_-]{1,100})$`).exec(req.url || '');
  const asset = match && assets[match[1]];
  if (!asset || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end(); return; }
  try {
    const {size} = await stat(asset.path);
    const range = req.headers.range;
    let start = 0;
    let end = size - 1;
    if (range) {
      const matchRange = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!matchRange || (!matchRange[1] && !matchRange[2])) { res.writeHead(416).end(); return; }
      if (!matchRange[1]) start = Math.max(0, size - Number(matchRange[2]));
      else { start = Number(matchRange[1]); if (matchRange[2]) end = Math.min(end, Number(matchRange[2])); }
      if (start > end || start >= size || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
        res.writeHead(416, {'Content-Range': `bytes */${size}`}).end(); return;
      }
    }
    res.writeHead(range ? 206 : 200, {'Content-Type': asset.mimeType, 'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store',
      ...(range ? {'Content-Range': `bytes ${start}-${end}/${size}`} : {})});
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(asset.path, {start, end});
    stream.on('error', () => res.destroy());
    res.once('close', () => stream.destroy());
    stream.pipe(res);
  } catch { res.writeHead(404).end(); }
});

try {
  await new Promise(resolveListen => assetServer.listen(0, '127.0.0.1', resolveListen));
  await mkdir(bundleDirectory, {recursive: true, mode: 0o700});
  let ready = true;
  try { await access(join(bundleDirectory, '.ready')); } catch { ready = false; }
  if (!ready) {
    const emptyPublic = join(bundleDirectory, 'empty-public');
    await mkdir(emptyPublic, {recursive: true});
    await bundle({entryPoint: resolve('src/studio/render-entry.tsx'), outDir: bundleDirectory,
      publicDir: emptyPublic, enableCaching: false});
    await writeFile(join(bundleDirectory, '.ready'), '1');
  }
  if (cancelled) throw new Error('cancelled');
  const assetSources = Object.fromEntries(Object.keys(assets).map(id => [id,
    `http://127.0.0.1:${assetServer.address().port}/${secret}/${id}`]));
  const inputProps = {project, assetSources};
  browser = await openBrowser('chrome', {logLevel: 'error',
    ...(process.env.STUDIO_BROWSER_EXECUTABLE ? {browserExecutable: process.env.STUDIO_BROWSER_EXECUTABLE} : {})});
  if (cancelled) throw new Error('cancelled');
  const composition = await selectComposition({serveUrl: bundleDirectory, id: 'StudioVideo', inputProps,
    puppeteerInstance: browser, logLevel: 'error', timeoutInMilliseconds: 60_000});
  if (cancelled) throw new Error('cancelled');
  let reported = 0;
  await renderMedia({serveUrl: bundleDirectory, composition, inputProps,
    puppeteerInstance: browser, outputLocation: join(directory, 'output.mp4'),
    codec: 'h264', audioCodec: 'aac', enforceAudioTrack: true, pixelFormat: 'yuv420p',
    crf: 20, x264Preset: 'veryfast', concurrency: 1, offthreadVideoThreads: 1,
    overwrite: true, cancelSignal, logLevel: 'error', timeoutInMilliseconds: 60_000,
    onProgress: ({progress}) => {
      const now = Date.now();
      if (now - reported > 500) { process.send?.({progress: Math.min(0.99, progress)}); reported = now; }
    },
  });
  process.send?.({completed: true});
} catch {
  // Do not forward raw renderer errors: paths, local URLs and props are private.
  process.exitCode = cancelled ? 2 : 1;
} finally {
  if (browser) await browser.close({silent: true}).catch(() => {});
  assetServer.closeAllConnections();
  await new Promise(resolveClose => assetServer.close(resolveClose));
  process.disconnect?.();
}
