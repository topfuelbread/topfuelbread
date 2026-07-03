import type { FlagState } from "./types";

export function storageKey(novelId: string): string {
  return `vn-flags-${novelId}`;
}

export function getFlags(novelId: string): FlagState {
  if (typeof sessionStorage === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(storageKey(novelId));
    if (!raw) return {};
    return JSON.parse(raw) as FlagState;
  } catch {
    return {};
  }
}

export function applyFlags(novelId: string, deltas: FlagState): FlagState {
  const current = getFlags(novelId);

  for (const [key, delta] of Object.entries(deltas)) {
    if (delta === undefined) continue;
    current[key] = (current[key] ?? 0) + delta;
  }

  sessionStorage.setItem(storageKey(novelId), JSON.stringify(current));
  return current;
}

export function resetFlags(novelId: string): void {
  sessionStorage.removeItem(storageKey(novelId));
}
