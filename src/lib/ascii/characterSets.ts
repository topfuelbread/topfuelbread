export type CharacterSetId =
  | "basic"
  | "dense"
  | "blocks"
  | "minimal"
  | "numbers"
  | "extendedBlocks";

export interface CharacterSetDef {
  name: string;
  characters: string;
  description: string;
}

export const CHARACTER_SETS: Record<CharacterSetId, CharacterSetDef> = {
  basic: {
    name: "Basic",
    characters: "  .:-=+*#%@",
    description: ".:-=+*#%@",
  },
  dense: {
    name: "Dense",
    characters:
      " .'\"`_-:;!iIl<>?][{}()/\\|~+tfjrnxvuczYUJCLQZ0Owmqpkdbaoh*#MW&8%B@$  ",
    description: " .'\",:;Il!i<>~+_-?][",
  },
  blocks: {
    name: "Blocks",
    characters: " ▏▎▍▌▋▊▉█",
    description: " ▏▎▍▌▋▊▉█",
  },
  minimal: {
    name: "Minimal",
    characters: " ▫▪",
    description: " ▫▪",
  },
  numbers: {
    name: "Numbers",
    characters: "0123456789",
    description: "0123456879",
  },
  extendedBlocks: {
    name: "Dithered Blocks",
    characters: " ░▒▓█",
    description: " ░▒▓█",
  },
};

export const CHARACTER_SET_OPTIONS: {
  id: CharacterSetId;
  name: string;
}[] = Object.entries(CHARACTER_SETS).map(([id, def]) => ({
  id: id as CharacterSetId,
  name: def.name,
}));

export function getCharacterRamp(id: CharacterSetId): string {
  return CHARACTER_SETS[id].characters;
}
