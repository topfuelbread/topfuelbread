import { getCollection, type CollectionEntry } from "astro:content";

export type TwtEntry = CollectionEntry<"twt">;

function normalizeDate(pubDate: string): string {
  return pubDate.slice(0, 10);
}

function sortByTwtIdDesc(a: TwtEntry, b: TwtEntry): number {
  return b.data.id.localeCompare(a.data.id);
}

function sortByTwtIdAsc(a: TwtEntry, b: TwtEntry): number {
  return a.data.id.localeCompare(b.data.id);
}

export async function getTwts(): Promise<TwtEntry[]> {
  return [...(await getCollection("twt"))].sort(sortByTwtIdDesc);
}

export async function getLatestTwts(n: number): Promise<TwtEntry[]> {
  return (await getTwts()).slice(0, n);
}

export async function getTwtsByDate(date: string): Promise<TwtEntry[]> {
  const normalized = normalizeDate(date);
  const entries = (await getCollection("twt")).filter(
    (entry) => normalizeDate(entry.data.pubDate) === normalized,
  );

  const main = entries.filter((e) => e.data.tags?.includes("main"));
  const rest = entries
    .filter((e) => !e.data.tags?.includes("main"))
    .sort(sortByTwtIdAsc);

  return [...main.sort(sortByTwtIdAsc), ...rest];
}

export async function getMainTwts(): Promise<TwtEntry[]> {
  return (await getTwts()).filter((entry) => entry.data.tags?.includes("main"));
}

export function pubDateToSlug(pubDate: string): string {
  return normalizeDate(pubDate).replace(/-/g, "/");
}
