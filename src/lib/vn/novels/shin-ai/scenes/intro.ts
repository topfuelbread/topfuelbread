import type { Scene } from "../../../types";
import { scenePath, shinAi } from "../config";

export const intro: Scene = {
  slug: "intro",
  title: `${shinAi.name} — Intro`,
  asciiArt: "yytd/shin",
  speaker: "Shin",
  dialogue: "Do you know what a majority vote is?",
  choices: [
    { label: "Say yes", href: scenePath("intro-yes"), flags: { affection: 5 } },
    { label: "Say no", href: scenePath("intro-no"), flags: { affection: -2 } },
  ],
};
