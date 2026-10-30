/* eslint-disable @remotion/warn-native-media-tag -- These thumbnails belong to the editor DOM, not the video composition. */
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type {
  StudioCompositionProps,
  StudioModelSettings,
  StudioProject,
  StudioScene,
  StudioAsset,
  RenderJob,
} from "./types";
import {
  dimensions,
  MAX_UPLOAD_BYTES,
  parseStudioProject,
  referencedAssetIds,
  totalFrames,
} from "./schema";
import { createSampleProject, newScene } from "./sample";
import {
  loadAssetBlob,
  loadModelSettings,
  loadProject,
  loadVersions,
  rememberModel,
  saveProject,
  saveVersion,
  storeAssetBlob,
  emptySettings,
  deleteAssetBlobs,
} from "./storage";
import { inspectAsset } from "./assets";
import {
  cancelRender,
  createRender,
  downloadBlob,
  downloadRender,
  readRender,
  restoreRender,
  type ActiveRender,
} from "./render-client";
import { StudioComposition } from "./StudioComposition";
import {
  generateStoryboard,
  modifyStoryboard,
  synthesizeSpeech,
  testConnection,
} from "./provider";
import "./StudioApp.css";

class PreviewBoundary extends Component<
  { children: ReactNode; resetKey: number },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidUpdate(previous: { resetKey: number }) {
    if (previous.resetKey !== this.props.resetKey && this.state.error)
      this.setState({ error: false });
  }
  render() {
    return this.state.error ? (
      <div className="st-preview-error">
        预览暂时无法显示。请检查素材，或切换镜头后重试。
      </div>
    ) : (
      this.props.children
    );
  }
}
const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "操作未完成，请重试。";
const styles = [
  {
    name: "清新讲解",
    description: "干净的浅色背景，自然绿与淡蓝点缀，清晰的重点与舒展的排版。",
  },
  {
    name: "温暖故事",
    description: "温暖的纸张质感，柔和的自然色彩，像一本缓缓翻开的生活手册。",
  },
  {
    name: "简洁产品",
    description:
      "简洁的产品展示，大幅实物素材，精炼文案，沉稳的黑白与少量品牌色。",
  },
];
type ModelKind = "language" | "tts";
function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>(
      "button,input,textarea,select",
    );
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]",
          ) ?? [],
        );
        if (!items.length) return;
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          items[items.length - 1].focus();
        } else if (!event.shiftKey && index === items.length - 1) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="st-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`st-modal ${wide ? "st-wide" : ""}`}
      >
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="st-icon-button"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function StudioApp() {
  const [project, setProject] = useState<StudioProject>(createSampleProject);
  const current = useRef(project);
  current.current = project;
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState("正在打开本地项目…");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [aiBusy, setAiBusy] = useState("");
  const [instruction, setInstruction] = useState("");
  const aiController = useRef<AbortController | null>(null);
  useEffect(() => () => aiController.current?.abort(), []);
  const [tab, setTab] = useState<"create" | "assets" | "scenes">("create");
  const [selected, setSelected] = useState("");
  const [sources, setSources] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] =
    useState<StudioModelSettings>(loadModelSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<StudioProject[]>([]);
  const undo = useRef<StudioProject[]>([]);
  const [activeRender, setActiveRender] = useState<ActiveRender | null>(
    restoreRender,
  );
  const [job, setJob] = useState<RenderJob | null>(null);
  const [renderBusy, setRenderBusy] = useState(false);
  const player = useRef<PlayerRef>(null);
  const scene =
    project.scenes.find((item) => item.id === selected) ?? project.scenes[0];
  const frames = totalFrames(project);
  const [isSample, setIsSample] = useState(true);
  const operation = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeExport = useCallback(() => setExportOpen(false), []);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  useEffect(() => {
    const previous = document.title;
    document.title = "叙影 · 视频工作室";
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    let active = true;
    loadProject()
      .then((value) => {
        if (active) {
          if (value) {
            setProject(value);
            current.current = value;
            setIsSample(false);
          }
          setReady(true);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            `本地项目恢复失败：${messageOf(err)} 请重新打开页面，或导入结构备份恢复。`,
          );
          setSaveState("本地项目恢复失败");
          setReady(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    setSaveState("正在保存…");
    let active = true;
    const timer = setTimeout(() => {
      saveProject(project)
        .then(() => {
          if (active) setSaveState("已保存在此浏览器");
        })
        .catch((err) => {
          if (active) {
            setSaveState("保存失败");
            setError(messageOf(err));
          }
        });
    }, 450);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [project, ready]);
  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      if (document.visibilityState === "hidden")
        void saveProject(current.current).catch(() => {});
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [ready]);
  const assetKey = project.assets.map((a) => a.id).join(",");
  useEffect(() => {
    let active = true;
    const created: string[] = [];
    const ids = assetKey.split(",").filter(Boolean);
    Promise.all(
      ids.map(async (id) => {
        const blob = await loadAssetBlob(id);
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        created.push(url);
        return [id, url] as const;
      }),
    )
      .then((values) => {
        if (active) {
          const next = Object.fromEntries(
            values.filter((value): value is readonly [string, string] =>
              Boolean(value),
            ),
          );
          setSources(next);
        } else created.forEach((url) => URL.revokeObjectURL(url));
      })
      .catch((err) => {
        if (active) setError(messageOf(err));
      });
    return () => {
      active = false;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [assetKey]);
  useEffect(() => {
    if (!activeRender) return;
    try {
      sessionStorage.setItem(
        "studio-active-render",
        JSON.stringify(activeRender),
      );
    } catch {
      setNotice("浏览器不允许保存任务信息，刷新后可能无法恢复本次导出。");
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const result = await readRender(activeRender, controller.signal);
        if (!active) return;
        setJob(result);
        if (["queued", "rendering"].includes(result.status))
          timer = setTimeout(poll, 1500);
      } catch (err) {
        if (active) {
          setError(`渲染状态查询失败：${messageOf(err)}`);
          if (err instanceof Error && "status" in err && err.status === 404) {
            setActiveRender(null);
            setJob(null);
            try {
              sessionStorage.removeItem("studio-active-render");
            } catch {
              /* Session storage is optional. */
            }
          } else timer = setTimeout(poll, 6000);
        }
      }
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [activeRender]);
  const mutate = (update: (previous: StudioProject) => StudioProject) => {
    const previous = current.current;
    undo.current = [...undo.current.slice(-19), previous];
    const next = {
      ...update(previous),
      revision: previous.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    current.current = next;
    setProject(next);
  };
  const updateScene = (patch: Partial<StudioScene>) =>
    mutate((previous) => ({
      ...previous,
      scenes: previous.scenes.map((item) => {
        if (item.id !== scene.id) return item;
        const next = { ...item, ...patch };
        if (
          patch.narration !== undefined &&
          patch.narration !== item.narration
        ) {
          delete next.voiceAssetId;
          delete next.voiceNarration;
        }
        return next;
      }),
    }));
  const seekScene = (id: string) => {
    setSelected(id);
    let start = 0;
    for (const item of project.scenes) {
      if (item.id === id) break;
      start += item.durationInFrames;
    }
    const item = project.scenes.find((value) => value.id === id);
    player.current?.seekTo(
      start + Math.min(24, Math.max(0, (item?.durationInFrames ?? 1) - 1)),
    );
  };
  const checkpoint = async () => {
    try {
      await saveVersion(current.current);
      setNotice("已保存一个可恢复的版本。");
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const showHistory = async () => {
    try {
      setVersions(await loadVersions(project.id));
      setHistoryOpen(true);
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const handleUploads = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploading(true);
    setError("");
    const origin = current.current.id;
    const number = ++operation.current;
    const staged: string[] = [];
    let committed = false;
    try {
      const assets: StudioAsset[] = [];
      const inputFiles = Array.from(files);
      for (const file of inputFiles) {
        if (current.current.assets.length + assets.length >= 20)
          throw new Error("一个项目最多保存 20 个素材。");
        const asset = await inspectAsset(file);
        if (
          current.current.assets.reduce((n, a) => n + a.size, 0) +
            assets.reduce((n, a) => n + a.size, 0) +
            asset.size >
          MAX_UPLOAD_BYTES
        )
          throw new Error("项目素材总量不能超过 100 MB。");
        assets.push(asset);
      }
      // Validate the entire selection before persisting any Blob.
      for (let i = 0; i < assets.length; i++) {
        staged.push(assets[i].id);
        await storeAssetBlob(assets[i].id, inputFiles[i]);
      }
      if (current.current.id !== origin || number !== operation.current) return;
      if (
        current.current.assets.length + assets.length > 20 ||
        current.current.assets.reduce((n, a) => n + a.size, 0) +
          assets.reduce((n, a) => n + a.size, 0) >
          MAX_UPLOAD_BYTES
      )
        throw new Error("项目素材容量已变化，请减少所选文件后重试。");
      mutate((previous) => ({
        ...previous,
        assets: [...previous.assets, ...assets],
      }));
      committed = true;
      setNotice(`已添加 ${assets.length} 个素材。`);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      if (!committed)
        await deleteAssetBlobs(staged).catch(() =>
          setNotice("部分暂存素材未能清理，请检查浏览器存储空间。"),
        );
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };
  const removeAsset = (id: string) => {
    const used = project.scenes.filter(
      (s) => s.assetId === id || s.voiceAssetId === id,
    );
    if (
      (used.length || project.musicAssetId === id) &&
      !window.confirm(
        `此素材用于${used.length ? `「${used.map((s) => s.title).join("、")}」` : ""}${project.musicAssetId === id ? "及背景音乐" : ""}。删除会解除这些引用，是否继续？`,
      )
    )
      return;
    mutate((previous) => ({
      ...previous,
      assets: previous.assets.filter((a) => a.id !== id),
      musicAssetId:
        previous.musicAssetId === id ? undefined : previous.musicAssetId,
      scenes: previous.scenes.map((s) => ({
        ...s,
        assetId: s.assetId === id ? undefined : s.assetId,
        voiceAssetId: s.voiceAssetId === id ? undefined : s.voiceAssetId,
        voiceNarration: s.voiceAssetId === id ? undefined : s.voiceNarration,
      })),
    }));
  };
  const importProject = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("项目文件过大。");
      const next = parseStudioProject(JSON.parse(await file.text()));
      if (
        !window.confirm(
          "导入将替换当前编辑的项目。当前项目会先保存为历史版本。是否继续？",
        )
      )
        return;
      await saveVersion(current.current);
      operation.current++;
      undo.current = [];
      setProject({
        ...next,
        revision: next.revision + 1,
        updatedAt: new Date().toISOString(),
      });
      setIsSample(false);
      setReady(true);
      setSelected(next.scenes[0].id);
      setNotice(
        "已导入结构备份。图片、音频和视频需在此浏览器中存在，缺失时请重新上传并关联。",
      );
    } catch (err) {
      setError(`无法导入项目：${messageOf(err)}`);
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  };
  const startExport = async () => {
    setRenderBusy(true);
    setError("");
    try {
      parseStudioProject(current.current);
      const next = await createRender(structuredClone(current.current));
      setJob(null);
      setActiveRender(next);
      await saveVersion(current.current);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setRenderBusy(false);
    }
  };
  const restoreVersion = async (value: StudioProject) => {
    try {
      await saveVersion(current.current);
      mutate((previous) => ({ ...value, revision: previous.revision }));
      setHistoryOpen(false);
      setSelected(value.scenes[0].id);
      setNotice("已恢复版本，原版本仍可在历史中查看。");
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const requireModel = (kind: ModelKind) => {
    const config = settings[kind];
    if (
      !config.baseUrl ||
      !config.apiKey ||
      !config.model ||
      (kind === "tts" && !settings.tts.voice)
    ) {
      setSettingsOpen(true);
      throw new Error(
        `请先保存${kind === "tts" ? " TTS 语音" : "语言"}模型的独立配置。`,
      );
    }
    return config;
  };
  const runStoryboard = async (modify = false) => {
    if (aiController.current) return;
    setError("");
    const snapshot = structuredClone(current.current);
    const controller = new AbortController();
    aiController.current = controller;
    try {
      const connection = requireModel("language");
      if (modify && !instruction.trim())
        throw new Error("请描述你希望修改的内容。");
      setAiBusy(modify ? "正在调整分镜…" : "正在生成分镜…");
      const scenes = modify
        ? await modifyStoryboard(
            snapshot,
            instruction,
            connection,
            scene.id,
            controller.signal,
          )
        : await generateStoryboard(snapshot, connection, controller.signal);
      if (
        current.current.id !== snapshot.id ||
        current.current.revision !== snapshot.revision
      ) {
        setNotice("生成期间项目发生了变化，已保留你的最新编辑，请重新生成。");
        return;
      }
      const next = parseStudioProject({ ...snapshot, scenes });
      await saveVersion(snapshot);
      if (
        controller.signal.aborted ||
        current.current.id !== snapshot.id ||
        current.current.revision !== snapshot.revision
      ) {
        setNotice("项目已更新，已保留你的最新编辑，请重新生成。");
        return;
      }
      mutate((previous) => ({ ...previous, scenes: next.scenes }));
      setIsSample(false);
      setSelected(next.scenes[0].id);
      setTab("scenes");
      setInstruction("");
    } catch (err) {
      if (!controller.signal.aborted) setError(messageOf(err));
    } finally {
      setAiBusy("");
      aiController.current = null;
    }
  };
  const runTts = async () => {
    if (aiController.current) return;
    setError("");
    const snapshot = structuredClone(current.current);
    const controller = new AbortController();
    aiController.current = controller;
    try {
      requireModel("tts");
      setAiBusy("正在准备配音…");
      const voiceSettings = structuredClone(settings.tts);
      const fingerprintBytes = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify([
            voiceSettings.baseUrl,
            voiceSettings.model,
            voiceSettings.voice,
            voiceSettings.speed,
          ]),
        ).buffer as ArrayBuffer,
      );
      const voiceSettingsFingerprint = Array.from(
        new Uint8Array(fingerprintBytes),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      await saveVersion(snapshot);
      let expectedRevision = snapshot.revision;
      for (let index = 0; index < snapshot.scenes.length; index++) {
        const item = snapshot.scenes[index];
        if (
          !item.narration.trim() ||
          (item.voiceAssetId &&
            item.voiceNarration === item.narration &&
            item.voiceSettingsFingerprint === voiceSettingsFingerprint)
        )
          continue;
        setAiBusy(`正在生成配音 ${index + 1}/${snapshot.scenes.length}…`);
        const blob = await synthesizeSpeech(
          item.narration,
          voiceSettings,
          controller.signal,
        );
        const extension = blob.type.includes("wav")
          ? "wav"
          : blob.type.includes("mp4")
            ? "m4a"
            : "mp3";
        const audioFile = new File([blob], `配音-${index + 1}.${extension}`, {
          type: blob.type || "audio/mpeg",
        });
        const asset = await inspectAsset(audioFile);
        await storeAssetBlob(asset.id, audioFile);
        if (
          controller.signal.aborted ||
          current.current.id !== snapshot.id ||
          current.current.revision !== expectedRevision
        ) {
          setNotice(
            "配音期间项目发生了变化，已停止应用后续结果。已完成的配音保留。",
          );
          return;
        }
        const nextScene = {
          ...item,
          voiceAssetId: asset.id,
          voiceNarration: item.narration,
          voiceSettingsFingerprint,
          durationInFrames: Math.max(
            item.durationInFrames,
            Math.ceil(((asset.durationSeconds ?? 0) + 0.15) * 30),
          ),
        };
        const next = parseStudioProject({
          ...current.current,
          assets: [...current.current.assets, asset],
          scenes: current.current.scenes.map((s) =>
            s.id === item.id ? nextScene : s,
          ),
          revision: expectedRevision + 1,
          updatedAt: new Date().toISOString(),
        });
        current.current = next;
        setProject(next);
        expectedRevision = next.revision;
      }
      setNotice("配音处理完成；镜头已按音频真实时长调整。");
    } catch (err) {
      if (!controller.signal.aborted) setError(messageOf(err));
    } finally {
      setAiBusy("");
      aiController.current = null;
    }
  };
  const activeBusy = Boolean(
    activeRender &&
    (!job || job.status === "queued" || job.status === "rendering"),
  );
  const missing = project.assets.filter((asset) => !sources[asset.id]);
  const missingReferenced = referencedAssetIds(project).filter(
    (id) => !sources[id],
  );
  const voiceCount = project.scenes.filter(
    (item) => item.voiceAssetId && item.voiceNarration === item.narration,
  ).length;
  return (
    <div className="studio-app">
      <header className="st-topbar">
        <a className="st-brand" href="/" aria-label="返回视频首页">
          <span className="st-brand-mark">▧</span>
          <span>
            叙影<span className="st-brand-en">STUDIO</span>
          </span>
        </a>
        <span className="st-header-divider" />
        <div className="st-project-heading">
          <input
            aria-label="项目名称"
            maxLength={150}
            value={project.name}
            onChange={(event) => {
              if (event.target.value.trim())
                mutate((previous) => ({
                  ...previous,
                  name: event.target.value,
                }));
            }}
          />
          <span>
            <i
              className={
                saveState === "保存失败" ? "st-dot st-danger" : "st-dot"
              }
            />
            {saveState}
          </span>
        </div>
        <div className="st-top-actions">
          <button className="st-quiet" onClick={() => void showHistory()}>
            版本历史
          </button>
          <button className="st-outline" onClick={() => setSettingsOpen(true)}>
            ⚙ 模型设置
          </button>
          <button
            className="st-primary"
            disabled={!ready || uploading}
            onClick={() => setExportOpen(true)}
          >
            导出 MP4 <span>↗</span>
          </button>
        </div>
      </header>
      {(error || notice) && (
        <div
          className={`st-notification ${error ? "st-error" : ""}`}
          role={error ? "alert" : "status"}
        >
          <span>{error || notice}</span>
          <button
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="关闭提示"
          >
            ×
          </button>
        </div>
      )}
      <div className="st-workspace">
        <aside className="st-sidebar">
          <div className="st-sidebar-intro">
            <span className="st-eyebrow">FROM AN IDEA TO A STORY</span>
            <h1>
              让想法，
              <br />
              开始有画面。
            </h1>
          </div>
          <nav className="st-tabs" aria-label="工作区">
            <button
              aria-pressed={tab === "create"}
              onClick={() => setTab("create")}
            >
              ✧ 创作
            </button>
            <button
              aria-pressed={tab === "assets"}
              onClick={() => setTab("assets")}
            >
              ▧ 素材 <small>{project.assets.length}</small>
            </button>
            <button
              aria-pressed={tab === "scenes"}
              onClick={() => setTab("scenes")}
            >
              ☷ 分镜
            </button>
          </nav>
          <div className="st-sidebar-content">
            {tab === "create" && (
              <>
                <div className="st-section-heading">
                  <h2>你想讲什么？</h2>
                  <span>01 / 创作简报</span>
                </div>
                <label className="st-field">
                  视频想法
                  <textarea
                    rows={5}
                    maxLength={5000}
                    value={project.brief}
                    onChange={(event) =>
                      mutate((previous) => ({
                        ...previous,
                        brief: event.target.value,
                      }))
                    }
                    placeholder="描述主题、受众和希望传达的内容…"
                  />
                </label>
                <div className="st-field">
                  目标时长
                  <div className="st-segment">
                    {([30, 60, 90] as const).map((duration) => (
                      <button
                        key={duration}
                        aria-pressed={
                          project.targetDurationSeconds === duration
                        }
                        onClick={() =>
                          mutate((previous) => ({
                            ...previous,
                            targetDurationSeconds: duration,
                          }))
                        }
                      >
                        {duration} 秒
                      </button>
                    ))}
                  </div>
                </div>
                <div className="st-field">
                  画面比例
                  <div className="st-ratios">
                    {(["16:9", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        aria-pressed={project.aspectRatio === ratio}
                        onClick={() =>
                          mutate((previous) => ({
                            ...previous,
                            aspectRatio: ratio,
                          }))
                        }
                      >
                        <span
                          className={
                            ratio === "16:9"
                              ? "st-landscape-icon"
                              : "st-portrait-icon"
                          }
                        />
                        <span>
                          {ratio}
                          <small>
                            {ratio === "16:9" ? "横屏叙事" : "竖屏分享"}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="st-section-heading st-space">
                  <h2>给故事一种气质</h2>
                  <span>02 / 视觉风格</span>
                </div>
                <div className="st-style-pills">
                  {styles.map((style, index) => (
                    <button
                      key={style.name}
                      className={`st-style-${index}`}
                      onClick={() =>
                        mutate((previous) => ({
                          ...previous,
                          stylePrompt: style.description,
                        }))
                      }
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
                <label className="st-field">
                  风格描述
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={project.stylePrompt}
                    onChange={(event) =>
                      mutate((previous) => ({
                        ...previous,
                        stylePrompt: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="st-model-note">
                  <span>✧</span>
                  <p>
                    先设定故事，再让 AI 帮你完成分镜。
                    <br />
                    <small>语言模型接口适配待确认，目前可编辑示例。</small>
                  </p>
                </div>
                <button
                  className="st-primary st-full"
                  disabled={Boolean(aiBusy) || !ready}
                  onClick={() => void runStoryboard()}
                >
                  ✧ 生成分镜
                </button>
                <p className="st-help">
                  没有模型也能先体验：编辑示例，预览并导出。
                </p>
              </>
            )}
            {tab === "assets" && (
              <>
                <div className="st-section-heading">
                  <h2>你的故事素材</h2>
                  <span>
                    {Math.round(
                      project.assets.reduce((n, a) => n + a.size, 0) /
                        1024 /
                        1024,
                    )}{" "}
                    / 100 MB
                  </span>
                </div>
                <button
                  className="st-upload"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  <b>
                    {uploading ? "正在检查素材…" : "＋ 添加图片、视频或音频"}
                  </b>
                  <small>
                    单个 ≤25 MB · 最多 20 个<br />
                    PNG / JPG / WebP / MP4 / WebM / MP3 / WAV / M4A
                  </small>
                </button>
                <input
                  hidden
                  ref={fileInput}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/mp4"
                  onChange={(event) => void handleUploads(event.target.files)}
                />
                <div className="st-asset-list">
                  {project.assets.map((asset) => (
                    <article key={asset.id} className="st-asset">
                      <div className="st-asset-thumb">
                        {asset.kind === "image" && sources[asset.id] ? (
                          <img src={sources[asset.id]} alt="" />
                        ) : (
                          <span>{asset.kind === "audio" ? "♫" : "▷"}</span>
                        )}
                      </div>
                      <div>
                        <b>{asset.name}</b>
                        <small>
                          {asset.kind === "image"
                            ? "图片"
                            : asset.kind === "video"
                              ? "视频"
                              : "音频"}{" "}
                          · {(asset.size / 1024 / 1024).toFixed(1)} MB
                          {!sources[asset.id] ? " · 缺失" : ""}
                        </small>
                      </div>
                      <button
                        className="st-icon-button"
                        aria-label={`删除 ${asset.name}`}
                        onClick={() => removeAsset(asset.id)}
                      >
                        ×
                      </button>
                    </article>
                  ))}
                  {!project.assets.length && (
                    <p className="st-empty">
                      一张照片、一段旋律，
                      <br />
                      都可以是故事的开始。
                    </p>
                  )}
                </div>
                <label className="st-field st-space">
                  背景音乐
                  <select
                    value={project.musicAssetId ?? ""}
                    onChange={(event) =>
                      mutate((previous) => ({
                        ...previous,
                        musicAssetId: event.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">不使用背景音乐</option>
                    {project.assets
                      .filter((a) => a.kind === "audio")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </label>
                {project.musicAssetId && (
                  <label className="st-field">
                    音乐音量 · {Math.round(project.musicVolume * 100)}%
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step=".01"
                      value={project.musicVolume}
                      onChange={(event) =>
                        mutate((previous) => ({
                          ...previous,
                          musicVolume: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                )}
              </>
            )}
            {tab === "scenes" && (
              <>
                <div className="st-section-heading">
                  <h2>故事的每一幕</h2>
                  <button
                    className="st-text-button"
                    disabled={project.scenes.length >= 20 || frames >= 2700}
                    onClick={() => {
                      const next = newScene(Math.min(150, 2700 - frames));
                      mutate((previous) => ({
                        ...previous,
                        scenes: [...previous.scenes, next],
                      }));
                      setSelected(next.id);
                    }}
                  >
                    ＋ 添加
                  </button>
                </div>
                <div className="st-scene-list">
                  {project.scenes.map((item, index) => (
                    <div
                      key={item.id}
                      className={`st-scene-item ${scene.id === item.id ? "st-active" : ""}`}
                    >
                      <button onClick={() => seekScene(item.id)}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <b>{item.title || "未命名镜头"}</b>
                          <small>
                            {(item.durationInFrames / 30).toFixed(1)} 秒 ·{" "}
                            {item.voiceAssetId ? "已配音" : "无配音"}
                          </small>
                        </div>
                      </button>
                      <div className="st-scene-order">
                        <button
                          disabled={index === 0}
                          aria-label="上移镜头"
                          onClick={() =>
                            mutate((previous) => {
                              const list = [...previous.scenes];
                              [list[index - 1], list[index]] = [
                                list[index],
                                list[index - 1],
                              ];
                              return { ...previous, scenes: list };
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          disabled={index === project.scenes.length - 1}
                          aria-label="下移镜头"
                          onClick={() =>
                            mutate((previous) => {
                              const list = [...previous.scenes];
                              [list[index + 1], list[index]] = [
                                list[index],
                                list[index + 1],
                              ];
                              return { ...previous, scenes: list };
                            })
                          }
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="st-outline st-full st-space"
                  disabled={Boolean(aiBusy)}
                  onClick={() => void runTts()}
                >
                  ♫ 生成全部配音
                </button>
                <p className="st-help">
                  配音进度 {voiceCount}/{project.scenes.length} ·
                  字幕按镜头估算对齐
                </p>
              </>
            )}
          </div>
          <footer className="st-sidebar-footer">
            <span>◉ 仅保存在本机</span>
            <button
              onClick={() => {
                downloadBlob(
                  new Blob([JSON.stringify(project, null, 2)], {
                    type: "application/json",
                  }),
                  `${project.name}.json`,
                );
                setNotice("已下载结构备份，不含图片、视频、音频及模型配置。");
              }}
            >
              备份
            </button>
            <button
              disabled={uploading}
              onClick={() => importInput.current?.click()}
            >
              导入
            </button>
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => void importProject(event.target.files?.[0])}
            />
          </footer>
        </aside>
        <main className="st-main">
          <div className="st-canvas-top">
            <div>
              <span className="st-eyebrow">YOUR STORY, IN MOTION</span>
              <h2>每一个想法，都值得被看见。</h2>
            </div>
            <span className="st-badge">
              {isSample ? "示例内容 · 可自由编辑" : "本地项目"}
            </span>
          </div>
          <div
            className={`st-preview-stage ${project.aspectRatio === "9:16" ? "st-is-portrait" : ""}`}
          >
            <div className="st-player-wrap">
              <PreviewBoundary resetKey={project.revision}>
                <Player
                  ref={player}
                  component={StudioComposition}
                  initialFrame={Math.min(24, Math.max(0, frames - 1))}
                  inputProps={
                    {
                      project,
                      assetSources: sources,
                    } satisfies StudioCompositionProps
                  }
                  durationInFrames={Math.max(1, frames)}
                  fps={30}
                  compositionWidth={dimensions(project.aspectRatio).width}
                  compositionHeight={dimensions(project.aspectRatio).height}
                  controls
                  style={{
                    width: "100%",
                    aspectRatio:
                      project.aspectRatio === "16:9" ? "16 / 9" : "9 / 16",
                  }}
                />
              </PreviewBoundary>
            </div>
          </div>
          <div className="st-preview-meta">
            <span>
              <i className="st-dot" />
              实时预览 · {dimensions(project.aspectRatio).width} ×{" "}
              {dimensions(project.aspectRatio).height}
            </span>
            <span>
              {voiceCount ? "已配音 " + voiceCount + " 个镜头" : "当前无配音"} ·
              字幕为估算对齐
            </span>
          </div>
          {missing.length > 0 && (
            <p className="st-inline-warning">
              {missing.length}{" "}
              个素材正在读取或已缺失；缺失素材请在素材库重新上传并关联。
            </p>
          )}
          <section className="st-timeline">
            <div className="st-section-heading">
              <h3>
                故事时间线{" "}
                <small>
                  {project.scenes.length} 个镜头 · {(frames / 30).toFixed(1)} 秒
                </small>
              </h3>
              <div className="st-timeline-actions">
                <label className="st-check st-all-captions">
                  <input
                    type="checkbox"
                    checked={project.scenes.every(
                      (value) => value.showCaptions,
                    )}
                    onChange={(event) =>
                      mutate((previous) => ({
                        ...previous,
                        scenes: previous.scenes.map((item) => ({
                          ...item,
                          showCaptions: event.target.checked,
                        })),
                      }))
                    }
                  />
                  全部字幕
                </label>
                <button
                  className="st-text-button"
                  disabled={!undo.current.length}
                  onClick={() => {
                    const value = undo.current.pop();
                    if (value) {
                      const next = {
                        ...value,
                        revision: current.current.revision + 1,
                        updatedAt: new Date().toISOString(),
                      };
                      current.current = next;
                      setProject(next);
                    }
                  }}
                >
                  ↶ 撤销
                </button>
                <button
                  className="st-text-button"
                  onClick={() => void checkpoint()}
                >
                  保存版本
                </button>
              </div>
            </div>
            <div className="st-timeline-scenes">
              {project.scenes.map((item, index) => (
                <button
                  key={item.id}
                  className={scene.id === item.id ? "st-selected" : ""}
                  onClick={() => seekScene(item.id)}
                >
                  <div
                    style={{
                      background: item.backgroundColor,
                      color: item.accentColor,
                    }}
                  >
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <b>{item.title}</b>
                    {item.assetId &&
                      sources[item.assetId] &&
                      project.assets.find((a) => a.id === item.assetId)
                        ?.kind === "image" && (
                        <img alt="" src={sources[item.assetId]} />
                      )}
                  </div>
                  <span>{(item.durationInFrames / 30).toFixed(1)}s</span>
                </button>
              ))}
            </div>
          </section>
          <div className="st-modify">
            <input
              aria-label="描述当前镜头的修改"
              placeholder="描述对当前镜头的修改，例如：标题更简洁，颜色温暖一点…"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              maxLength={2000}
            />
            <button
              className="st-outline"
              disabled={Boolean(aiBusy) || !instruction.trim()}
              onClick={() => void runStoryboard(true)}
            >
              ✧ 修改这一幕
            </button>
          </div>
          {aiBusy && (
            <div className="st-provider-status" role="status">
              {aiBusy}{" "}
              <button
                className="st-text-button"
                onClick={() => aiController.current?.abort()}
              >
                取消
              </button>
            </div>
          )}
          <div className="st-main-bottom">
            <span>✧ 灵感在这里成形，故事由你决定。</span>
            <span>Remotion 驱动</span>
          </div>
        </main>
        <aside className="st-inspector">
          <div className="st-inspector-title">
            <span className="st-eyebrow">
              SCENE{" "}
              {String(
                project.scenes.findIndex((item) => item.id === scene.id) + 1,
              ).padStart(2, "0")}
            </span>
            <h2>打磨这一幕</h2>
            <p>修改会直接同步到预览。</p>
          </div>
          <div className="st-inspector-fields">
            <label className="st-field">
              镜头标题
              <input
                value={scene.title}
                maxLength={100}
                onChange={(event) => updateScene({ title: event.target.value })}
              />
            </label>
            <label className="st-field">
              画面文案
              <textarea
                value={scene.body}
                rows={3}
                maxLength={600}
                onChange={(event) => updateScene({ body: event.target.value })}
              />
            </label>
            <label className="st-field">
              旁白
              <textarea
                value={scene.narration}
                rows={4}
                maxLength={2000}
                onChange={(event) =>
                  updateScene({ narration: event.target.value })
                }
              />
              <small>修改旁白会使本镜头原配音失效。</small>
            </label>
            <label className="st-field">
              画面布局
              <select
                value={scene.layout}
                onChange={(event) =>
                  updateScene({
                    layout: event.target.value as StudioScene["layout"],
                  })
                }
              >
                <option value="title">文字叙事</option>
                <option value="split">图文并排</option>
                <option value="full-media">全屏素材</option>
              </select>
            </label>
            <label className="st-field">
              关联画面素材
              <select
                value={scene.assetId ?? ""}
                onChange={(event) =>
                  updateScene({ assetId: event.target.value || undefined })
                }
              >
                <option value="">使用图形背景</option>
                {project.assets
                  .filter((a) => a.kind !== "audio")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="st-field">
              关联配音音频
              <select
                value={scene.voiceAssetId ?? ""}
                onChange={(event) => {
                  const asset = project.assets.find(
                    (a) => a.id === event.target.value,
                  );
                  const min = asset?.durationSeconds
                    ? Math.ceil((asset.durationSeconds + 0.15) * 30)
                    : scene.durationInFrames;
                  if (
                    frames -
                      scene.durationInFrames +
                      Math.max(min, scene.durationInFrames) >
                    2700
                  ) {
                    setError("这段音频将使成片超过 90 秒，请先缩短其他镜头。");
                    return;
                  }
                  updateScene({
                    voiceAssetId: asset?.id,
                    voiceNarration: asset ? scene.narration : undefined,
                    durationInFrames: Math.max(min, scene.durationInFrames),
                  });
                }}
              >
                <option value="">无配音</option>
                {project.assets
                  .filter((a) => a.kind === "audio")
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="st-color-row">
              <label>
                背景色
                <input
                  type="color"
                  aria-label="背景色"
                  value={scene.backgroundColor}
                  onChange={(event) =>
                    updateScene({ backgroundColor: event.target.value })
                  }
                />
              </label>
              <label>
                强调色
                <input
                  type="color"
                  aria-label="强调色"
                  value={scene.accentColor}
                  onChange={(event) =>
                    updateScene({ accentColor: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="st-field">
              镜头时长 · {(scene.durationInFrames / 30).toFixed(1)} 秒
              <input
                type="range"
                min={Math.max(
                  30,
                  Math.ceil(
                    (project.assets.find((a) => a.id === scene.voiceAssetId)
                      ?.durationSeconds ?? 0) * 30,
                  ),
                )}
                max={Math.max(
                  scene.durationInFrames,
                  2700 - frames + scene.durationInFrames,
                )}
                step="1"
                value={scene.durationInFrames}
                onChange={(event) =>
                  updateScene({ durationInFrames: Number(event.target.value) })
                }
              />
            </label>
            <label className="st-check">
              <input
                type="checkbox"
                checked={scene.showCaptions}
                onChange={(event) =>
                  updateScene({ showCaptions: event.target.checked })
                }
              />
              显示旁白字幕
            </label>
            <button
              className="st-delete"
              disabled={project.scenes.length <= 1}
              onClick={() => {
                mutate((previous) => ({
                  ...previous,
                  scenes: previous.scenes.filter(
                    (item) => item.id !== scene.id,
                  ),
                }));
              }}
            >
              删除这个镜头
            </button>
          </div>
        </aside>
      </div>
      {settingsOpen && (
        <Modal
          title="让灵感，连接你的模型"
          subtitle="语言模型负责脚本与分镜，TTS 负责配音。两套配置独立保存。"
          onClose={closeSettings}
          wide
        >
          <div className="st-settings-grid">
            {(["language", "tts"] as const).map((kind) => (
              <ModelCard
                key={kind}
                kind={kind}
                value={settings[kind]}
                onSave={(value, remember) => {
                  try {
                    rememberModel(kind, value, remember);
                    setSettings((previous) => ({ ...previous, [kind]: value }));
                    setNotice(
                      `${kind === "language" ? "语言模型" : "TTS"}配置已${remember ? "保存在此浏览器" : "保存在当前会话"}。`,
                    );
                  } catch (err) {
                    setError(messageOf(err));
                  }
                }}
              />
            ))}
          </div>
          <p className="st-settings-warning">
            Key
            默认仅在当前会话使用。开启“记住”后，同源页面脚本可读取这些凭据；请仅使用可信设备。配置不会加入项目备份、版本历史或视频渲染请求。模型请求与 Key 会经本地 Studio 后端转发到你填写的服务地址，不保存在后端。Base URL 请包含版本路径（如 /v1），也可填写完整接口地址；阿里云 DashScope 的非实时 Qwen-TTS 使用原生语音接口，语速由模型决定。连接测试会实际调用模型。
          </p>
        </Modal>
      )}
      {historyOpen && (
        <Modal
          title="版本历史"
          subtitle="最近 20 个手动或导出前保存的版本。恢复前会保存当前版本。"
          onClose={closeHistory}
        >
          {versions.length ? (
            versions.map((value) => (
              <div key={value.revision} className="st-version">
                <div>
                  <b>{value.name}</b>
                  <small>
                    {new Date(value.updatedAt).toLocaleString("zh-CN")} · 修订{" "}
                    {value.revision}
                  </small>
                </div>
                <button
                  className="st-outline"
                  onClick={() => void restoreVersion(value)}
                >
                  恢复
                </button>
              </div>
            ))
          ) : (
            <p className="st-empty">
              还没有历史版本。点击“保存版本”收藏当前进度。
            </p>
          )}
        </Modal>
      )}
      {exportOpen && (
        <Modal
          title="把故事带走"
          subtitle="导出适合分享的 1080p MP4 视频。"
          onClose={closeExport}
        >
          <div className="st-export-summary">
            <span>
              MP4 <small>H.264 / AAC</small>
            </span>
            <span>
              {dimensions(project.aspectRatio).width} ×{" "}
              {dimensions(project.aspectRatio).height}
              <small>30 fps · {(frames / 30).toFixed(1)} 秒</small>
            </span>
          </div>
          <p className="st-export-note">
            {voiceCount
              ? `${voiceCount}/${project.scenes.length} 个镜头包含配音。`
              : "当前无配音，将导出无旁白视频。"}
            {project.musicAssetId ? "包含背景音乐。" : ""}字幕与预览一致。
          </p>
          <p className="st-help">
            导出需要将本次使用的素材临时上传到渲染服务；不上传模型配置及
            Key。本地服务需已启动，云端渲染尚未部署。
          </p>
          {activeRender && job && (
            <div className="st-render-status">
              <div>
                <b>
                  {
                    {
                      queued: "等待渲染",
                      rendering: "正在生成视频",
                      completed: "视频已准备好",
                      failed: "渲染失败",
                      cancelled: "已取消",
                    }[job.status]
                  }
                </b>
                <span>{Math.round(job.progress * 100)}%</span>
              </div>
              <progress max="1" value={job.progress} />
              {job.error && <p role="alert">{job.error.message}</p>}
              {job.status === "completed" && (
                <button
                  className="st-primary st-full"
                  disabled={renderBusy}
                  onClick={() => {
                    setRenderBusy(true);
                    downloadRender(activeRender)
                      .catch((err) => setError(messageOf(err)))
                      .finally(() => setRenderBusy(false));
                  }}
                >
                  {renderBusy ? "准备下载…" : "↓ 下载 MP4"}
                </button>
              )}
              {["queued", "rendering"].includes(job.status) && (
                <button
                  className="st-outline st-full"
                  onClick={() =>
                    void cancelRender(activeRender)
                      .then(setJob)
                      .catch((err) => setError(messageOf(err)))
                  }
                >
                  取消导出
                </button>
              )}
            </div>
          )}
          <button
            className="st-primary st-full st-space"
            disabled={
              renderBusy ||
              activeBusy ||
              uploading ||
              missingReferenced.length > 0
            }
            onClick={() => void startExport()}
          >
            {renderBusy
              ? "正在提交…"
              : activeBusy
                ? "渲染任务进行中…"
                : job?.status === "completed"
                  ? "重新导出当前版本"
                  : "确认并导出 MP4"}
          </button>
        </Modal>
      )}
    </div>
  );
}
function ModelCard({
  kind,
  value,
  onSave,
}: {
  kind: ModelKind;
  value: StudioModelSettings["language"] | StudioModelSettings["tts"];
  onSave: (
    value: StudioModelSettings["language"] | StudioModelSettings["tts"],
    remember: boolean,
  ) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [remember, setRemember] = useState(() => {
    try {
      return Boolean(localStorage.getItem(`studio-config-${kind}`));
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("");
  const tts = kind === "tts" ? (draft as StudioModelSettings["tts"]) : null;
  const save = () => {
    try {
      const url = new URL(draft.baseUrl);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        throw new Error();
    } catch {
      setStatus("请输入有效的 HTTP(S) Base URL，不含凭据、查询或片段。");
      return;
    }
    if (
      !draft.apiKey.trim() ||
      !draft.model.trim() ||
      (tts && !tts.voice.trim())
    ) {
      setStatus("请填写 Key、模型名称以及所需的音色。");
      return;
    }
    onSave(draft, remember);
    setStatus("已保存，可以测试连接或直接生成。");
  };
  return (
    <section className="st-model-card">
      <span className="st-eyebrow">
        {kind === "language" ? "STORY & DIRECTION" : "VOICE & NARRATION"}
      </span>
      <h3>{kind === "language" ? "✧ 语言模型" : "♫ TTS 语音模型"}</h3>
      <label className="st-field">
        Base URL
        <input
          type="url"
          autoComplete="off"
          value={draft.baseUrl}
          placeholder="https://你的模型服务地址"
          onChange={(event) =>
            setDraft({ ...draft, baseUrl: event.target.value })
          }
        />
      </label>
      <label className="st-field">
        API Key
        <div className="st-key-input">
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={draft.apiKey}
            placeholder="仅存储在你的浏览器"
            onChange={(event) =>
              setDraft({ ...draft, apiKey: event.target.value })
            }
          />
          <button
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "隐藏 Key" : "显示 Key"}
          >
            {visible ? "隐藏" : "显示"}
          </button>
        </div>
      </label>
      <label className="st-field">
        模型名称
        <input
          autoComplete="off"
          value={draft.model}
          placeholder="填写服务商提供的模型 ID"
          onChange={(event) =>
            setDraft({ ...draft, model: event.target.value })
          }
        />
      </label>
      {tts && (
        <>
          <label className="st-field">
            音色 ID
            <input
              value={tts.voice}
              placeholder="填写音色名称或 ID"
              onChange={(event) =>
                setDraft({ ...tts, voice: event.target.value })
              }
            />
          </label>
          <label className="st-field">
            语速 · {tts.speed.toFixed(2)}×
            <input
              type="range"
              min="0.25"
              max="4"
              step=".05"
              value={tts.speed}
              onChange={(event) =>
                setDraft({ ...tts, speed: Number(event.target.value) })
              }
            />
          </label>
        </>
      )}
      <label className="st-check">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        记住到此浏览器
      </label>
      <div className="st-model-actions">
        <button className="st-primary" onClick={save}>
          保存配置
        </button>
        <button
          className="st-outline"
          onClick={() => {
            setStatus("正在测试连接…");
            const settings = emptySettings();
            if (kind === "language") settings.language = draft;
            else settings.tts = draft as StudioModelSettings["tts"];
            testConnection(kind, settings)
              .then(() => setStatus("连接成功。"))
              .catch((err) => setStatus(messageOf(err)));
          }}
        >
          测试连接
        </button>
        <button
          className="st-text-button"
          onClick={() => {
            const blank = emptySettings()[kind];
            setDraft(blank);
            onSave(blank, false);
            setRemember(false);
            setStatus("已清除本卡片配置。");
          }}
        >
          清除
        </button>
      </div>
      {status && (
        <p className="st-help" role="status">
          {status}
        </p>
      )}
    </section>
  );
}
