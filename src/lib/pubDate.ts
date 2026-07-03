export function getPubDateParts(date: Date) {
  const isoLocal = date.toISOString().slice(0, 19);
  const [datePart, timePart] = isoLocal.split("T");
  const [year, month, day] = datePart.split("-");

  return {
    isoLocal,
    datePart,
    timePart,
    slashDate: `${year}/${month}/${day}`,
  };
}

export function formatTimeLabel(
  timePart: string | undefined,
  timezone?: string,
): string {
  if (!timePart) return "";

  const time = timePart.slice(0, 5);
  return timezone ? `${time} ${timezone}` : time;
}

export function formatBlogPubDate(date: Date, timezone?: string): string {
  const { datePart, timePart } = getPubDateParts(date);
  const time = timePart?.slice(0, 5);

  if (timezone && time && time !== "00:00") {
    return `${datePart} ${formatTimeLabel(timePart, timezone)}`;
  }

  return datePart;
}
