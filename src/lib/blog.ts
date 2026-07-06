const DISPLAY_TIME_ZONE = "America/New_York";

function isMidnightInTimeZone(date: Date, timeZone: string): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return value("hour") === 0 && value("minute") === 0 && value("second") === 0;
}

export function formatBlogDate(date: Date): string {
  if (isMidnightInTimeZone(date, DISPLAY_TIME_ZONE)) {
    return date.toLocaleDateString("en-CA", { timeZone: DISPLAY_TIME_ZONE });
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

export function sortBlogPostsByDateDesc<
  T extends { data: { pubDate: Date } },
>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}
