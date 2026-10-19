import assert from "node:assert/strict";
import test from "node:test";
import {
  MAIN_TABS,
  STORY_TYPES,
  STORY_SERIES,
  VIDEO_CATALOG,
  catalogEntry,
  catalogSearch,
  filterCatalogKeys,
  resolveCatalogState,
} from "./catalog.ts";

const published = [
  "pi-durable",
  "python",
  "math",
  "idiom-seedling",
  "car-energy",
];
const state = (query) => resolveCatalogState(query, published);

test("the homepage opens stories and only selects a published story", () => {
  assert.deepEqual(
    MAIN_TABS.map((tab) => tab.label),
    ["绘本与故事", "数学", "技术"],
  );
  assert.deepEqual(state(""), {
    tab: "stories",
    category: "all",
    series: "all",
    video: "idiom-seedling",
  });
});

test("legacy deep links restore every video's correct main tab", () => {
  for (const key of published) {
    const restored = state(`?video=${key}`);
    assert.equal(restored.video, key);
    assert.equal(restored.tab, catalogEntry(key).tab);
    assert.ok(filterCatalogKeys(published, restored).includes(key));
  }
  assert.equal(state("?video=car-energy").tab, "tech");
});

test("a valid video wins over conflicting tab, category, and series URL values", () => {
  assert.deepEqual(
    state("?tab=stories&category=history&series=three-kingdoms&video=math"),
    { tab: "math", category: "all", series: "all", video: "math" },
  );
  assert.deepEqual(
    state(
      "?tab=tech&category=history&series=three-kingdoms&video=idiom-seedling",
    ),
    {
      tab: "stories",
      category: "idiom",
      series: "all",
      video: "idiom-seedling",
    },
  );
  assert.equal(
    state("?tab=stories&category=fable&video=idiom-seedling").category,
    "idiom",
  );
});

test("mathematics and technology are disjoint and technology includes the car explainer", () => {
  assert.deepEqual(
    filterCatalogKeys(published, {
      tab: "math",
      category: "all",
      series: "all",
    }),
    ["math"],
  );
  assert.deepEqual(
    filterCatalogKeys(published, {
      tab: "tech",
      category: "all",
      series: "all",
    }),
    ["pi-durable", "python", "car-energy"],
  );
  assert.deepEqual(
    filterCatalogKeys(published, {
      tab: "stories",
      category: "all",
      series: "all",
    }),
    ["idiom-seedling"],
  );
});

test("unpublished story types have no selected video instead of retaining the old player", () => {
  for (const category of ["history", "fable", "myth", "fairytale"]) {
    const restored = state(`?tab=stories&category=${category}`);
    assert.equal(restored.category, category);
    assert.equal(restored.video, null);
    assert.deepEqual(filterCatalogKeys(published, restored), []);
    assert.equal(
      state(catalogSearch({ ...restored, category: "all", series: "all" }))
        .video,
      "idiom-seedling",
    );
  }
});

test("three kingdoms is a historical series and cannot become an unrelated filter", () => {
  assert.equal(
    STORY_TYPES.some((item) => item.id === "three-kingdoms"),
    false,
  );
  assert.equal(
    STORY_SERIES.find((item) => item.id === "three-kingdoms").storyType,
    "history",
  );
  const history = state("?tab=stories&category=history&series=three-kingdoms");
  assert.equal(history.series, "three-kingdoms");
  assert.equal(history.video, null);
  for (const query of [
    "?tab=stories&series=three-kingdoms",
    "?tab=stories&category=idiom&series=three-kingdoms",
    "?tab=math&category=history&series=three-kingdoms",
    "?tab=tech&category=history&series=three-kingdoms",
  ]) {
    assert.equal(state(query).series, "all");
  }
});

test("unknown, removed, and malformed query values degrade safely", () => {
  assert.deepEqual(
    state("?tab=missing&category=missing&series=missing&video=missing"),
    state(""),
  );
  assert.equal(state("?tab=tech&video=missing").video, "pi-durable");
  assert.equal(
    state("?tab=stories&category=history&video=missing").video,
    null,
  );
  assert.doesNotThrow(() => state("?video=%E0%A4%A&tab=%"));
  assert.deepEqual(resolveCatalogState("?video=math", []), {
    tab: "stories",
    category: "all",
    series: "all",
    video: null,
  });
});

test("serialized states survive refresh and history restoration without narrowing All Stories", () => {
  const queries = [
    "",
    "?tab=stories&category=all&video=idiom-seedling",
    "?video=math",
    "?video=car-energy",
    "?tab=stories&category=history&series=three-kingdoms",
    ...STORY_TYPES.map((item) => `?tab=stories&category=${item.id}`),
  ];
  for (const query of queries) {
    const original = state(query);
    assert.deepEqual(state(catalogSearch(original)), original);
  }
  assert.equal(
    state("?tab=stories&category=all&video=idiom-seedling").category,
    "all",
  );
});

test("catalog metadata cannot publish absent videos and uncatalogued explainers remain discoverable", () => {
  assert.equal(
    resolveCatalogState(
      "",
      published.filter((key) => key !== "idiom-seedling"),
    ).video,
    null,
  );
  assert.deepEqual(
    filterCatalogKeys([...published, "future-explainer"], {
      tab: "tech",
      category: "all",
      series: "all",
    }),
    ["pi-durable", "python", "car-energy", "future-explainer"],
  );
  for (const entry of Object.values(VIDEO_CATALOG)) {
    if (entry.tab !== "stories") continue;
    assert.ok(STORY_TYPES.some((item) => item.id === entry.storyType));
    if (entry.series)
      assert.equal(
        STORY_SERIES.find((item) => item.id === entry.series)?.storyType,
        entry.storyType,
      );
  }
});
