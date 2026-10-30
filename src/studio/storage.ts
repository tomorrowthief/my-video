import type { StudioModelSettings, StudioProject } from "./types";
import { parseStudioProject } from "./schema";

const DB_NAME = "everyday-video-studio";
let database: Promise<IDBDatabase> | undefined;
function db() {
  if (!database)
    database = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        for (const name of ["projects", "blobs", "history"])
          if (!request.result.objectStoreNames.contains(name))
            request.result.createObjectStore(name);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        database = undefined;
        reject(new Error("无法打开浏览器存储，请检查隐私模式或磁盘空间。"));
      };
    });
  return database;
}
async function read<T>(store: string, key: string): Promise<T | undefined> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(new Error("读取本地项目失败。"));
  });
}
async function write(store: string, key: string, value: unknown) {
  const database = await db();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(store, "readwrite");
    transaction.objectStore(store).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        new Error("本地保存失败，可能是浏览器存储空间不足。请下载项目备份。"),
      );
    transaction.onabort = () => reject(new Error("本地保存被中止。"));
  });
}
export const loadProject = async () => {
  const value = await read<unknown>("projects", "current");
  return value ? parseStudioProject(value) : undefined;
};
let saveQueue = Promise.resolve();
export function saveProject(project: StudioProject) {
  const snapshot = structuredClone(project);
  const next = saveQueue
    .catch(() => {})
    .then(() => write("projects", "current", snapshot));
  saveQueue = next;
  return next;
}
export const loadAssetBlob = (id: string) => read<Blob>("blobs", id);
export const storeAssetBlob = (id: string, blob: Blob) =>
  write("blobs", id, blob);
export async function deleteAssetBlobs(ids: string[]) {
  if (!ids.length) return;
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("blobs", "readwrite");
    for (const id of ids) transaction.objectStore("blobs").delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("清理暂存素材失败。"));
    transaction.onabort = () => reject(new Error("清理暂存素材被中止。"));
  });
}
export const loadVersions = async (id: string) =>
  (await read<StudioProject[]>("history", id)) ?? [];
let historyQueue = Promise.resolve();
export function saveVersion(project: StudioProject) {
  const snapshot = structuredClone(project);
  const next = historyQueue
    .catch(() => {})
    .then(async () => {
      const previous = await loadVersions(project.id);
      await write(
        "history",
        project.id,
        [
          snapshot,
          ...previous.filter((p) => p.revision !== project.revision),
        ].slice(0, 20),
      );
    });
  historyQueue = next;
  return next;
}
export const emptySettings = (): StudioModelSettings => ({
  language: { baseUrl: "", apiKey: "", model: "" },
  tts: { baseUrl: "", apiKey: "", model: "", voice: "", speed: 1 },
});
export function loadModelSettings(): StudioModelSettings {
  const result = emptySettings();
  for (const kind of ["language", "tts"] as const) {
    try {
      const raw =
        sessionStorage.getItem(`studio-config-${kind}`) ??
        localStorage.getItem(`studio-config-${kind}`);
      if (raw) {
        const value = JSON.parse(raw) as Record<string, unknown>;
        result[kind].baseUrl =
          typeof value.baseUrl === "string" ? value.baseUrl : "";
        result[kind].apiKey =
          typeof value.apiKey === "string" ? value.apiKey : "";
        result[kind].model = typeof value.model === "string" ? value.model : "";
        if (kind === "tts") {
          result.tts.voice = typeof value.voice === "string" ? value.voice : "";
          result.tts.speed =
            typeof value.speed === "number" &&
            value.speed >= 0.25 &&
            value.speed <= 4
              ? value.speed
              : 1;
        }
      }
    } catch {
      /* Invalid settings do not prevent opening projects. */
    }
  }
  return result;
}
export function rememberModel(
  kind: "language" | "tts",
  value: StudioModelSettings["language"] | StudioModelSettings["tts"],
  remember: boolean,
) {
  const key = `studio-config-${kind}`;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  (remember ? localStorage : sessionStorage).setItem(
    key,
    JSON.stringify(value),
  );
}
