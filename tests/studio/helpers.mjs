import {registerHooks} from 'node:module';

// Match TypeScript's Bundler resolution without modifying application imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

export function project() {
  return {
    schemaVersion: 1, id: 'project-1', revision: 0, name: '中文创作',
    createdAt: '2026-10-22T00:00:00.000Z', updatedAt: '2026-10-22T00:00:00.000Z',
    brief: '给普通用户介绍一个新想法', stylePrompt: '简洁温暖', aspectRatio: '16:9',
    targetDurationSeconds: 30, fps: 30, assets: [], musicVolume: 0.15,
    scenes: [{id: 'scene-1', title: '一个好故事', body: '从一个想法开始', narration: '你好，世界。',
      durationInFrames: 900, layout: 'title', backgroundColor: '#F3F1EA', accentColor: '#CC5E37',
      showCaptions: true}],
  };
}

export function asset(kind = 'image', patch = {}) {
  return {id: `${kind}-1`, name: `${kind}.${kind === 'image' ? 'png' : kind === 'video' ? 'mp4' : 'wav'}`,
    kind, mimeType: `${kind}/${kind === 'image' ? 'png' : kind === 'video' ? 'mp4' : 'wav'}`, size: 100,
    ...patch};
}

export class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}
