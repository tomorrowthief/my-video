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
import { NetworkExplainer } from "../src/nn/NetworkExplainer";
import networkTiming from "../src/nn/network-timing.json";

const car = manifest["car-energy"];

export const VIDEOS: readonly VideoDef[] = [
  ...explainers,
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
