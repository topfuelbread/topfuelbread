export type FlagId = "affection" | "trust";

export type SceneChoice = {
  label: string;
  href: string;
  flags?: Partial<Record<FlagId, number>>;
};

export type Scene = {
  slug: string;
  title: string;
  asciiArt: string;
  speaker: string;
  dialogue: string;
  choices: SceneChoice[];
};

export type FlagState = Partial<Record<FlagId, number>>;
