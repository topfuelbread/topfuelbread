import { getCollection, type CollectionEntry } from "astro:content";

type DiaryEntry = CollectionEntry<"diary">;

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  return (await getCollection("diary")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getDiaryEntry(
  id: string,
): Promise<DiaryEntry | undefined> {
  const entries = await getDiaryEntries();
  return entries.find((entry) => entry.id === id);
}
