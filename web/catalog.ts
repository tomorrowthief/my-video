/** Editorial metadata only: keep animation imports out of the catalog. */
export const MAIN_TABS = [
  {
    id: "stories",
    label: "绘本与故事",
    description: "翻开故事，在画面中认识道理与世界。",
  },
  {
    id: "math",
    label: "数学",
    description: "用看得见的过程，理解数学里的思考方式。",
  },
  {
    id: "tech",
    label: "技术",
    description: "从编程到科学与工程，把复杂的原理讲清楚。",
  },
] as const;

export const STORY_TYPES = [
  { id: "idiom", label: "成语故事" },
  { id: "history", label: "历史典故" },
  { id: "fable", label: "寓言故事" },
  { id: "myth", label: "神话传说" },
  { id: "fairytale", label: "童话绘本" },
] as const;

export const STORY_SERIES = [
  { id: "xiaohe-idioms", label: "小禾的成语故事", storyType: "idiom" },
  { id: "three-kingdoms", label: "三国小故事", storyType: "history" },
] as const;

export type MainTab = (typeof MAIN_TABS)[number]["id"];
export type StoryType = (typeof STORY_TYPES)[number]["id"];
export type StorySeries = (typeof STORY_SERIES)[number]["id"];
export type HistorySeries = Extract<
  (typeof STORY_SERIES)[number],
  { storyType: "history" }
>["id"];

type StoryPlacement = {
  [Kind in StoryType]: {
    tab: "stories";
    storyType: Kind;
    series?: Extract<(typeof STORY_SERIES)[number], { storyType: Kind }>["id"];
  };
}[StoryType];

type Placement =
  | StoryPlacement
  | { tab: "math" | "tech"; storyType?: never; series?: never };

export type CatalogEntry = {
  title: string;
  label: string;
  description: string;
  symbol: string;
} & Placement;

export const VIDEO_CATALOG: Readonly<Record<string, CatalogEntry>> = {
  "idiom-seedling": {
    title: "拔苗助长",
    label: "小禾的成语故事",
    tab: "stories",
    storyType: "idiom",
    series: "xiaohe-idioms",
    description:
      "跟着小禾翻开绘本，看看着急的农夫做了什么。成长，需要照顾，也需要时间。",
    symbol: "芽",
  },
  math: {
    title: "鸡兔同笼",
    label: "数学思维",
    tab: "math",
    description:
      "用列表法、假设法和抬腿法，看看同一道数学题背后的三种思考方式。",
    symbol: "∑",
  },
  python: {
    title: "Python 学习路线",
    label: "编程开发",
    tab: "tech",
    description:
      "从数据模型到工程实践，串起 Python 的核心概念，找到下一步的学习方向。",
    symbol: "</>",
  },
  "pi-durable": {
    title: "数据持久化原理",
    label: "计算机原理",
    tab: "tech",
    description:
      "从一次意外断电出发，理解持久化系统里的提交、任务状态与存储设计。",
    symbol: "▤",
  },
  "car-energy": {
    title: "汽车能量流动",
    label: "科学与工程",
    tab: "tech",
    description: "通过三维拆解与能量流动图，理解电动汽车的驱动过程与再生制动。",
    symbol: "↔",
  },
};

/** Uncatalogued explainers stay discoverable in Technology. */
export const catalogEntry = (key: string, fallbackTitle = key): CatalogEntry =>
  VIDEO_CATALOG[key] ?? {
    title: fallbackTitle,
    label: "其他讲解",
    tab: "tech",
    description: "通过动画与讲解，理解一个新知识。",
    symbol: "▷",
  };

export type CatalogState = {
  tab: MainTab;
  category: StoryType | "all";
  series: HistorySeries | "all";
  video: string | null;
};

type CatalogFilter = Pick<CatalogState, "tab" | "category" | "series">;

export const filterCatalogKeys = (
  keys: readonly string[],
  filter: CatalogFilter,
): string[] =>
  keys.filter((key) => {
    const entry = catalogEntry(key);
    if (entry.tab !== filter.tab) return false;
    if (filter.tab !== "stories") return true;
    if (filter.category !== "all" && entry.storyType !== filter.category)
      return false;
    return (
      filter.category !== "history" ||
      filter.series === "all" ||
      entry.series === filter.series
    );
  });

/** A valid video deep link wins over incompatible filters, never the other way around. */
export const resolveCatalogState = (
  search: string | URLSearchParams,
  keys: readonly string[],
): CatalogState => {
  const query =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const requestedTab = query.get("tab");
  let tab: MainTab =
    MAIN_TABS.find((item) => item.id === requestedTab)?.id ?? "stories";
  let category: CatalogState["category"] =
    tab === "stories"
      ? (STORY_TYPES.find((item) => item.id === query.get("category"))?.id ??
        "all")
      : "all";
  let series: CatalogState["series"] =
    tab === "stories" && category === "history"
      ? (STORY_SERIES.filter((item) => item.storyType === "history").find(
          (item) => item.id === query.get("series"),
        )?.id ?? "all")
      : "all";
  const requestedVideo = query.get("video");
  const video =
    requestedVideo !== null && keys.includes(requestedVideo)
      ? requestedVideo
      : null;

  if (video !== null) {
    const entry = catalogEntry(video);
    if (entry.tab !== tab || requestedTab === null) {
      tab = entry.tab;
      category = entry.storyType ?? "all";
      series = "all";
    }
    if (
      tab === "stories" &&
      category !== "all" &&
      category !== entry.storyType
    ) {
      category = entry.storyType ?? "all";
      series = "all";
    }
    if (
      tab !== "stories" ||
      category !== "history" ||
      (series !== "all" && entry.series !== series)
    ) {
      series = "all";
    }
  }

  const filter = { tab, category, series };
  const matches = filterCatalogKeys(keys, filter);
  return {
    ...filter,
    video:
      video !== null && matches.includes(video) ? video : (matches[0] ?? null),
  };
};

/** Canonical URL fields; unrelated URL parameters are preserved by the page. */
export const catalogSearch = (state: CatalogState): URLSearchParams => {
  const query = new URLSearchParams({ tab: state.tab });
  if (state.tab === "stories") {
    query.set("category", state.category);
    if (state.category === "history") query.set("series", state.series);
  }
  if (state.video !== null) query.set("video", state.video);
  return query;
};
