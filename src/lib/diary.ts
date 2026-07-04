import { getCollection, getEntry, type CollectionEntry } from "astro:content";

type DiaryEntry = CollectionEntry<"diary">;

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  return await getCollection("diary");
}

export async function getDiaryEntry(
  id: string,
): Promise<DiaryEntry | undefined> {
  const entry = await getEntry("diary", id);
  return entry ?? undefined;
}
