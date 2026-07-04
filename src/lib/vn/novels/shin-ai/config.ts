import type { NovelConfig } from "../../types";

export const shinAi = {
  id: "shin-ai",
  name: "Shin-AI",
  basePath: "/if-side/shin-ai/",
  flagIds: ["affection", "trust"],
} satisfies NovelConfig;

export function scenePath(slug: string): string {
  return `${shinAi.basePath}${slug}/`;
}
