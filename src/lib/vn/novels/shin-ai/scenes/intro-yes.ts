import type { Scene } from "../../../types";
import { scenePath, shinAi } from "../config";

export const introYes: Scene = {
  slug: "intro-yes",
  title: `${shinAi.name} — Yes`,
  asciiArt: "yytd/shin",
  speaker: "Shin",
  dialogue: "I'm glad you said yes.",
  choices: [{ label: "Next", href: scenePath("intro") }],
};
