import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {RenderInternals} from '@remotion/renderer';

const execute = promisify(execFile);
// Keep media validation on the same pinned FFmpeg/FFprobe distribution as rendering.
// callFf also sets the dylib/library search path needed by Remotion's native binaries.
export async function runMediaTool(bin, args, options = {}) {
  const override = process.env[bin === 'ffprobe' ? 'STUDIO_FFPROBE' : 'STUDIO_FFMPEG'];
  if (override) return execute(override, args, {...options, windowsHide: true});
  return RenderInternals.callFf({bin, args, indent: false, logLevel: 'error',
    binariesDirectory: null, cancelSignal: undefined, options});
}
