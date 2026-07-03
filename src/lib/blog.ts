import { getCollection, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export async function getLatestBlogPost(): Promise<BlogPost | undefined> {
  const posts = await getCollection("blog");
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )[0];
}
