import { getCollection, getEntry, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export async function getBlogPost(id: string): Promise<BlogPost | undefined> {
  const post = await getEntry("blog", id);
  return post ?? undefined;
}

export async function getLatestBlogPost(): Promise<BlogPost | undefined> {
  const posts = await getCollection("blog");
  const sorted = [...posts].sort((a, b) => b.id.localeCompare(a.id));
  return sorted[0];
}

export async function getLatestBlogPostId(): Promise<string | undefined> {
  const post = await getLatestBlogPost();
  return post?.id;
}
