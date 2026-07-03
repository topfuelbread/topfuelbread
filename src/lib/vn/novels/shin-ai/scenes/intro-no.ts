import type { Scene } from "../../../types";
import { scenePath, shinAi } from "../config";

export const introNo: Scene = {
  slug: "intro-no",
  title: `${shinAi.name} — No`,
  asciiArt: "yytd/shin",
  speaker: "Shin",
  dialogue: "Oh... alright. Maybe next time.",
  choices: [{ label: "Next", href: scenePath("intro") }],
};
