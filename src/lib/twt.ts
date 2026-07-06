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
    time: `${hm.slice(0, 2)}:${hm.slice(2)}`,
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
  return (await getCollection("twt"))
    .filter((entry) => parseTwtId(entry.id).date === normalized)
    .sort(sortByTwtIdDesc);
}

export async function getTwtsForDayDisplay(date: string): Promise<{
  mainTwt?: TwtEntry;
  twts: TwtEntry[];
}> {
  const entries = await getTwtsByDate(date);
  const mainTwt = entries.find((entry) => entry.data.tags?.includes("main"));
  const twts = entries.filter((entry) => entry.id !== mainTwt?.id);

  return { mainTwt, twts };
}

export async function getMainTwts(): Promise<TwtEntry[]> {
  return (await getTwts()).filter((entry) => entry.data.tags?.includes("main"));
}

export async function getLatestMainTwt(): Promise<TwtEntry | undefined> {
  const [latestMainTwt] = await getMainTwts();
  return latestMainTwt;
}
