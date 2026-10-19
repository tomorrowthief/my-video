import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { VideoDef } from "../src/videos";
import { VIDEOS } from "./videos";
import {
  MAIN_TABS,
  STORY_TYPES,
  STORY_SERIES,
  catalogEntry,
  catalogSearch,
  filterCatalogKeys,
  resolveCatalogState,
  type CatalogState,
  type CatalogEntry,
  type MainTab,
} from "./catalog";
import "./App.css";

const VIDEO_KEYS = VIDEOS.map((video) => video.key);
const runtime = (frames: number, fps: number): string => {
  const total = Math.floor(frames / fps);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const stateUrl = (state: CatalogState): URL => {
  const url = new URL(window.location.href);
  for (const key of ["tab", "category", "series", "video"])
    url.searchParams.delete(key);
  for (const [key, value] of catalogSearch(state))
    url.searchParams.set(key, value);
  return url;
};

const VideoViewer: React.FC<{
  video: VideoDef;
  presentation: CatalogEntry;
}> = ({ video, presentation }) => {
  const playerRef = useRef<PlayerRef>(null);
  return (
    <section
      id="selected-video"
      className="knowledge-viewer"
      aria-labelledby="video-heading"
    >
      <div className="knowledge-video-heading">
        <span className="knowledge-category">{presentation.label}</span>
        <h2 id="video-heading">{presentation.title}</h2>
        <p>{presentation.description}</p>
      </div>
      <div
        className="knowledge-player"
        role="group"
        aria-label={`${presentation.title}视频播放器`}
      >
        <Player
          ref={playerRef}
          component={video.Component}
          durationInFrames={video.timing.totalFrames}
          fps={video.timing.fps}
          compositionWidth={video.timing.width}
          compositionHeight={video.timing.height}
          style={{ width: "100%" }}
          controls
          // Keep category focus when a new player mounts. Its native buttons remain keyboard operable.
          spaceKeyToPlayOrPause={false}
          doubleClickToFullscreen
          acknowledgeRemotionLicense
          errorFallback={() => (
            <div className="knowledge-player-error" role="alert">
              视频暂时无法播放，请刷新页面后重试。
            </div>
          )}
        />
      </div>
      <div className="knowledge-player-note">
        <span>时长 {runtime(video.timing.totalFrames, video.timing.fps)}</span>
        <span>拖动进度条，或选择下方章节观看</span>
      </div>
      <section
        className="knowledge-chapters"
        aria-labelledby="chapters-heading"
      >
        <div className="knowledge-section-heading">
          <h3 id="chapters-heading">本片章节</h3>
          <span>{video.timing.scenes.length} 个章节</span>
        </div>
        <ol className="knowledge-chapter-list">
          {video.timing.scenes.map((scene, sceneIndex) => (
            <li key={scene.id}>
              <button
                type="button"
                className="knowledge-chapter"
                onClick={() => playerRef.current?.seekTo(scene.startFrame)}
                aria-label={`跳转到第 ${sceneIndex + 1} 章：${scene.title}，${runtime(scene.startFrame, video.timing.fps)}`}
              >
                <span className="knowledge-chapter-number" aria-hidden="true">
                  {String(sceneIndex + 1).padStart(2, "0")}
                </span>
                <span className="knowledge-chapter-title">{scene.title}</span>
                <span className="knowledge-chapter-time">
                  {runtime(scene.startFrame, video.timing.fps)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
};

export const App: React.FC = () => {
  const [state, setState] = useState(() =>
    resolveCatalogState(window.location.search, VIDEO_KEYS),
  );
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeTab =
    MAIN_TABS.find((tab) => tab.id === state.tab) ?? MAIN_TABS[0];
  const visibleKeys = filterCatalogKeys(VIDEO_KEYS, state);
  const visibleVideos = visibleKeys
    .map((key) => VIDEOS.find((video) => video.key === key))
    .filter((video): video is VideoDef => video !== undefined);
  const video = visibleVideos.find((item) => item.key === state.video);
  const count = (
    tab: MainTab,
    category: CatalogState["category"] = "all",
    series: CatalogState["series"] = "all",
  ) => filterCatalogKeys(VIDEO_KEYS, { tab, category, series }).length;

  useEffect(() => {
    const onPopState = () =>
      setState(resolveCatalogState(window.location.search, VIDEO_KEYS));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Normalize invalid/legacy links without adding a history entry on first load or Back.
  useEffect(() => {
    const url = stateUrl(state);
    if (url.href !== window.location.href)
      window.history.replaceState(null, "", url);
  }, [state]);

  const navigate = (next: CatalogState) => {
    const url = stateUrl(next);
    if (url.href !== window.location.href)
      window.history.pushState(null, "", url);
    setState(next);
  };
  const selectFilter = (
    next: Pick<CatalogState, "tab" | "category" | "series">,
  ) => {
    // Drop the old video before resolving filters: empty categories must stop playback.
    navigate(
      resolveCatalogState(catalogSearch({ ...next, video: null }), VIDEO_KEYS),
    );
  };
  const selectTab = (tab: MainTab) =>
    selectFilter({ tab, category: "all", series: "all" });
  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % MAIN_TABS.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + MAIN_TABS.length) % MAIN_TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = MAIN_TABS.length - 1;
    else return;
    event.preventDefault();
    selectTab(MAIN_TABS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };
  const backToStories = () => selectTab("stories");
  const categoryName =
    state.category === "all"
      ? "全部故事"
      : (STORY_TYPES.find((item) => item.id === state.category)?.label ??
        "故事");
  const emptyName =
    state.series === "all"
      ? categoryName
      : (STORY_SERIES.find((item) => item.id === state.series)?.label ??
        categoryName);

  return (
    <div className="knowledge-page">
      <div className="knowledge-shell">
        <header className="knowledge-header">
          <div className="knowledge-brand" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1>通过视频获取知识</h1>
            <p>跟着画面与讲解，让知识更好理解。</p>
          </div>
        </header>

        <main>
          <div className="knowledge-tabs" role="tablist" aria-label="知识分类">
            {MAIN_TABS.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={state.tab === tab.id}
                aria-controls={`panel-${tab.id}`}
                tabIndex={state.tab === tab.id ? 0 : -1}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                {tab.label}
                <span className="knowledge-count">{count(tab.id)}</span>
              </button>
            ))}
          </div>

          {MAIN_TABS.filter((tab) => tab.id !== state.tab).map((tab) => (
            <section
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              hidden
            />
          ))}
          <section
            id={`panel-${state.tab}`}
            className="knowledge-panel"
            role="tabpanel"
            aria-labelledby={`tab-${state.tab}`}
            tabIndex={0}
          >
            <div className="knowledge-panel-heading">
              <h2>{activeTab.label}</h2>
              <p>{activeTab.description}</p>
            </div>
            {state.tab === "stories" && (
              <div className="knowledge-filter-area">
                <div
                  className="knowledge-filter-row"
                  role="group"
                  aria-label="故事类型"
                >
                  <span className="knowledge-filter-label">故事类型</span>
                  <div className="knowledge-filter-buttons">
                    <button
                      type="button"
                      aria-pressed={state.category === "all"}
                      onClick={() =>
                        selectFilter({
                          tab: "stories",
                          category: "all",
                          series: "all",
                        })
                      }
                    >
                      全部故事 <span>{count("stories")}</span>
                    </button>
                    {STORY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        aria-pressed={state.category === type.id}
                        onClick={() =>
                          selectFilter({
                            tab: "stories",
                            category: type.id,
                            series: "all",
                          })
                        }
                      >
                        {type.label} <span>{count("stories", type.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {state.category === "history" && (
                  <div
                    className="knowledge-filter-row knowledge-series-row"
                    role="group"
                    aria-label="历史典故系列"
                  >
                    <span className="knowledge-filter-label">故事系列</span>
                    <div className="knowledge-filter-buttons">
                      <button
                        type="button"
                        aria-pressed={state.series === "all"}
                        onClick={() =>
                          selectFilter({
                            tab: "stories",
                            category: "history",
                            series: "all",
                          })
                        }
                      >
                        全部系列 <span>{count("stories", "history")}</span>
                      </button>
                      {STORY_SERIES.filter(
                        (item) => item.storyType === "history",
                      ).map((series) => (
                        <button
                          key={series.id}
                          type="button"
                          aria-pressed={state.series === series.id}
                          onClick={() =>
                            selectFilter({
                              tab: "stories",
                              category: "history",
                              series: series.id,
                            })
                          }
                        >
                          {series.label}{" "}
                          <span>{count("stories", "history", series.id)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="knowledge-layout">
              <aside
                className="knowledge-library"
                aria-labelledby="library-heading"
              >
                <div className="knowledge-section-heading">
                  <h3 id="library-heading">
                    {state.tab === "stories" ? "故事目录" : "视频目录"}
                  </h3>
                  <span>{visibleVideos.length} 个视频</span>
                </div>
                {visibleVideos.length > 0 ? (
                  <nav aria-label="选择讲解视频">
                    <ul className="knowledge-video-list">
                      {visibleVideos.map((item) => {
                        const info = catalogEntry(item.key, item.title);
                        return (
                          <li key={item.key}>
                            <button
                              type="button"
                              className="knowledge-video-option"
                              aria-current={
                                item.key === state.video ? "true" : undefined
                              }
                              aria-controls="selected-video"
                              onClick={() =>
                                navigate({ ...state, video: item.key })
                              }
                            >
                              <span
                                className={`knowledge-video-symbol knowledge-video-symbol--${item.key}`}
                                aria-hidden="true"
                              >
                                {info.symbol}
                              </span>
                              <span className="knowledge-option-content">
                                <span className="knowledge-option-category">
                                  {info.label}
                                </span>
                                <span className="knowledge-option-title">
                                  {info.title}
                                </span>
                                <span className="knowledge-option-meta">
                                  {runtime(
                                    item.timing.totalFrames,
                                    item.timing.fps,
                                  )}
                                  <span aria-hidden="true"> · </span>
                                  {item.timing.scenes.length} 个章节
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                ) : (
                  <p className="knowledge-directory-empty">
                    这个分类还没有已发布的视频。
                  </p>
                )}
                <p className="knowledge-library-note">
                  选一个感兴趣的主题，
                  <br />
                  从一个新知识开始。
                </p>
              </aside>

              {video !== undefined ? (
                <VideoViewer
                  key={`${state.tab}:${state.category}:${state.series}:${video.key}`}
                  video={video}
                  presentation={catalogEntry(video.key, video.title)}
                />
              ) : (
                <section
                  id="selected-video"
                  className="knowledge-viewer knowledge-empty-viewer"
                  aria-labelledby="empty-heading"
                >
                  <span className="knowledge-empty-symbol" aria-hidden="true">
                    □
                  </span>
                  <h2 id="empty-heading">
                    {state.tab === "stories"
                      ? `${emptyName}，敬请期待`
                      : "暂无已发布的视频"}
                  </h2>
                  <p>
                    这个分类目前还没有可播放的内容。可以先看看已经发布的故事。
                  </p>
                  <button
                    type="button"
                    className="knowledge-back-button"
                    onClick={backToStories}
                  >
                    回到全部故事
                  </button>
                </section>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
