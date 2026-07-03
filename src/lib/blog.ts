import { getCollection, getEntry, type CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

export async function getBlogPost(id: string): Promise<BlogPost | undefined> {
  const post = await getEntry("blog", id);
  return post ?? undefined;
}

export async function getLatestBlogPost(): Promise<BlogPost | undefined> {
  const posts = await getCollection("blog");
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )[0];
}

export async function getLatestBlogPostId(): Promise<string | undefined> {
  const post = await getLatestBlogPost();
  return post?.id;
}
