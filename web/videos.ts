import { CarEnergyFlow } from "../src/car/CarEnergyFlow";
import carTiming from "../src/car/timing.json";
import { VIDEOS as explainers, type VideoDef } from "../src/videos";
import manifest from "../videos.json";
import { SeedlingStory } from "../src/idioms/SeedlingStory";
import idiomTiming from "../src/idioms/timing.json";

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
    key: "car-energy",
    title: car.title,
    brand: car.brand,
    folder: car.folder,
    timing: carTiming,
    Component: CarEnergyFlow,
  },
];
