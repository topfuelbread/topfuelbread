import type { Scene } from "../types";

export const intro: Scene = {
  slug: "intro",
  title: "Shin — Intro",
  asciiArt: "yytd/shin",
  speaker: "Shin",
  dialogue: "Do you know what a majority vote is?",
  choices: [
    { label: "Say yes", href: "/shin/intro-yes/", flags: { affection: 5 } },
    { label: "Say no", href: "/shin/intro-no/", flags: { affection: -2 } },
  ],
};
