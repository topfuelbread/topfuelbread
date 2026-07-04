import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

function contentId(collection: "blog" | "diary" | "twt") {
  return ({ entry }: { entry: string }) =>
    `${collection}/${entry.replace(/\.md$/, "")}`;
}

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/blog",
    generateId: contentId("blog"),
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    updatedDate: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

const diary = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/diary",
    generateId: contentId("diary"),
  }),
  schema: z.object({
    pubDate: z.string(),
    asciiArt: z.string().optional(),
  }),
});

const twt = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/twt",
    generateId: contentId("twt"),
  }),
  schema: z.object({
    title: z.string(),
    id: z.string(),
    pubDate: z.string(),
    tags: z.array(z.string()).optional(),
    asciiArt: z.string().optional(),
  }),
});

export const collections = { blog, diary, twt };
