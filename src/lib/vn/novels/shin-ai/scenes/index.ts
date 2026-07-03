import type { Scene } from "../../../types";
import { shinAi } from "../config";
import { intro } from "./intro";
import { introNo } from "./intro-no";
import { introYes } from "./intro-yes";

export const scenes: Record<string, Scene> = {
  [intro.slug]: intro,
  [introYes.slug]: introYes,
  [introNo.slug]: introNo,
};

export function getScene(slug: string): Scene {
  const scene = scenes[slug];
  if (!scene) {
    throw new Error(
      `${shinAi.name} scene "${slug}" not found. Available: ${Object.keys(scenes).join(", ")}`,
    );
  }
  return scene;
}
