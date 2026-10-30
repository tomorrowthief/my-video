import { referencedAssetIds } from "./schema";
import { loadAssetBlob } from "./storage";
import type { RenderJob, StudioProject } from "./types";
export interface ActiveRender {
  jobId: string;
  token: string;
  projectName: string;
}
async function responseError(response: Response) {
  const value = await response.json().catch(() => null);
  return Object.assign(
    new Error(
      value?.error?.message ?? `渲染服务返回错误（${response.status}）。`,
    ),
    { status: response.status },
  );
}
export async function createRender(
  project: StudioProject,
  signal?: AbortSignal,
): Promise<ActiveRender> {
  const form = new FormData();
  form.set("project", JSON.stringify(project));
  for (const id of referencedAssetIds(project)) {
    const blob = await loadAssetBlob(id);
    if (!blob) throw new Error("部分素材未保存在本机，请重新上传后再导出。");
    const asset = project.assets.find((a) => a.id === id)!;
    form.set(`asset.${id}`, blob, asset.name);
  }
  let response: Response;
  try {
    response = await fetch("/api/studio/renders", {
      method: "POST",
      body: form,
      signal,
    });
  } catch {
    throw new Error("无法连接渲染服务。请启动本地渲染服务，或稍后重试。");
  }
  if (!response.ok) throw await responseError(response);
  const value = await response.json();
  if (typeof value.jobId !== "string" || typeof value.token !== "string")
    throw new Error("渲染服务响应无效。");
  return { jobId: value.jobId, token: value.token, projectName: project.name };
}
export async function readRender(
  active: ActiveRender,
  signal?: AbortSignal,
): Promise<RenderJob> {
  const response = await fetch(
    `/api/studio/renders/${encodeURIComponent(active.jobId)}`,
    { headers: { Authorization: `Bearer ${active.token}` }, signal },
  );
  if (!response.ok) throw await responseError(response);
  return response.json();
}
export async function cancelRender(active: ActiveRender) {
  const response = await fetch(
    `/api/studio/renders/${encodeURIComponent(active.jobId)}/cancel`,
    { method: "POST", headers: { Authorization: `Bearer ${active.token}` } },
  );
  if (!response.ok) throw await responseError(response);
  return response.json() as Promise<RenderJob>;
}
export async function downloadRender(active: ActiveRender) {
  const response = await fetch(
    `/api/studio/renders/${encodeURIComponent(active.jobId)}/download`,
    { headers: { Authorization: `Bearer ${active.token}` } },
  );
  if (!response.ok) throw await responseError(response);
  downloadBlob(await response.blob(), `${active.projectName}.mp4`);
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}
export function restoreRender(): ActiveRender | null {
  try {
    const raw = sessionStorage.getItem("studio-active-render");
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value.jobId === "string" &&
      typeof value.token === "string" &&
      typeof value.projectName === "string"
      ? value
      : null;
  } catch {
    return null;
  }
}
