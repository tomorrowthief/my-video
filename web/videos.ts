import { TaihuDrive } from "../src/taihu/TaihuDrive";
import taihuTiming from "../src/taihu/timing.json";
import { DreamStory } from "../src/dream/DreamStory";
import dreamTiming from "../src/dream/timing.json";
import { CarEnergyFlow } from "../src/car/CarEnergyFlow";
import carTiming from "../src/car/timing.json";
import { VIDEOS as explainers, type VideoDef } from "../src/videos";
import manifest from "../videos.json";
import { SeedlingStory } from "../src/idioms/SeedlingStory";
import idiomTiming from "../src/idioms/timing.json";
import { StumpStory } from "../src/idiom-stump/StumpStory";
import stumpTiming from "../src/idiom-stump/timing.json";
import { FoxStory } from "../src/fable/FoxStory";
import foxTiming from "../src/fable/timing.json";
import { PlumStory } from "../src/history/PlumStory";
import plumTiming from "../src/history/timing.json";
import { ArrowStory } from "../src/history-arrows/ArrowStory";
import arrowsTiming from "../src/history-arrows/timing.json";
import { SilkStory } from "../src/fable-silk/SilkStory";
import silkTiming from "../src/fable-silk/timing.json";
import { WindStory } from "../src/fable-wind/WindStory";
import windTiming from "../src/fable-wind/timing.json";
import { NetworkExplainer } from "../src/nn/NetworkExplainer";
import networkTiming from "../src/nn/network-timing.json";

const car = manifest["car-energy"];

export const VIDEOS: readonly VideoDef[] = [
  ...explainers,
  { key: "taihu-drive", title: "TaihuDayDrive", brand: "环湖出游", folder: "Travel", timing: taihuTiming, Component: TaihuDrive },
  {
    key: "idiom-seedling",
    title: manifest["idiom-seedling"].title,
    brand: manifest["idiom-seedling"].brand,
    folder: manifest["idiom-seedling"].folder,
    timing: idiomTiming,
    Component: SeedlingStory,
  },
  {
    key: "idiom-stump",
    title: manifest["idiom-stump"].title,
    brand: manifest["idiom-stump"].brand,
    folder: manifest["idiom-stump"].folder,
    timing: stumpTiming,
    Component: StumpStory,
  },
  {
    key: "fable-fox",
    title: manifest["fable-fox"].title,
    brand: manifest["fable-fox"].brand,
    folder: manifest["fable-fox"].folder,
    timing: foxTiming,
    Component: FoxStory,
  },
  {
    key: "history-plum",
    title: manifest["history-plum"].title,
    brand: manifest["history-plum"].brand,
    folder: manifest["history-plum"].folder,
    timing: plumTiming,
    Component: PlumStory,
  },
  {
    key: "history-arrows",
    title: manifest["history-arrows"].title,
    brand: manifest["history-arrows"].brand,
    folder: manifest["history-arrows"].folder,
    timing: arrowsTiming,
    Component: ArrowStory,
  },
  {
    key: "fable-silk",
    title: manifest["fable-silk"].title,
    brand: manifest["fable-silk"].brand,
    folder: manifest["fable-silk"].folder,
    timing: silkTiming,
    Component: SilkStory,
  },
  {
    key: "fable-wind",
    title: manifest["fable-wind"].title,
    brand: manifest["fable-wind"].brand,
    folder: manifest["fable-wind"].folder,
    timing: windTiming,
    Component: WindStory,
  },
  {
    key: "dream-thief",
    title: "DreamThief",
    brand: "月光故事集",
    folder: "Fairytales",
    timing: dreamTiming,
    Component: DreamStory,
  },
  {
    key: "nn-forward",
    title: "NetworkExplainer",
    brand: "机器学习",
    folder: "NeuralNetwork",
    timing: networkTiming,
    Component: NetworkExplainer,
  },
  {
    key: "car-energy",
    title: car.title,
    brand: car.brand,
    folder: car.folder,
    timing: carTiming,
    Component: CarEnergyFlow,
  },
];
