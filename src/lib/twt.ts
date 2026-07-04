import { getCollection, type CollectionEntry } from "astro:content";

export type TwtEntry = CollectionEntry<"twt">;

const TWT_ID_PATTERN = /^twt\/(\d{4})\/(\d{2})\/(\d{2})\/(\d{4})$/;

export function parseTwtId(entryId: string) {
  const match = entryId.match(TWT_ID_PATTERN);
  if (!match) {
    throw new Error(`Invalid twt id: ${entryId}`);
  }
  const [, y, m, d, hm] = match;
  return {
    date: `${y}-${m}-${d}`,
    sortKey: `${y}${m}${d}T${hm}`,
    daySlug: `${y}/${m}/${d}`,
  };
}

function normalizeDate(date: string): string {
  return date.slice(0, 10);
}

function sortByTwtIdDesc(a: TwtEntry, b: TwtEntry): number {
  return parseTwtId(b.id).sortKey.localeCompare(parseTwtId(a.id).sortKey);
}

function sortByTwtIdAsc(a: TwtEntry, b: TwtEntry): number {
  return parseTwtId(a.id).sortKey.localeCompare(parseTwtId(b.id).sortKey);
}

export async function getTwts(): Promise<TwtEntry[]> {
  return [...(await getCollection("twt"))].sort(sortByTwtIdDesc);
}

export async function getTwtDates(): Promise<
  { date: string; daySlug: string }[]
> {
  const dates = [
    ...new Set((await getTwts()).map((t) => parseTwtId(t.id).date)),
  ];
  return dates
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, daySlug: date.replace(/-/g, "/") }));
}

export async function getLatestTwts(n: number): Promise<TwtEntry[]> {
  return (await getTwts()).slice(0, n);
}

export async function getTwtsByDate(date: string): Promise<TwtEntry[]> {
  const normalized = normalizeDate(date);
  const entries = (await getCollection("twt")).filter(
    (entry) => parseTwtId(entry.id).date === normalized,
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

export async function getTwtDaySlugs(): Promise<string[]> {
  const twts = await getTwts();
  return [...new Set(twts.map((t) => parseTwtId(t.id).daySlug))];
}
