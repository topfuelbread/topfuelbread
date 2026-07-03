import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    timezone: z.string().optional(),
  }),
});

const diary = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/diary" }),
  schema: z.object({
    pubDate: z.coerce.date(),
    asciiArt: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

export const collections = { blog, diary };
