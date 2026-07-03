import type { FlagId, FlagState } from "./types";

export const STORAGE_KEY = "shin-vn-flags";

export const FLAG_IDS: FlagId[] = ["affection", "trust"];

export function getFlags(): FlagState {
  if (typeof sessionStorage === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as FlagState;
  } catch {
    return {};
  }
}

export function applyFlags(deltas: FlagState): FlagState {
  const current = getFlags();

  for (const [key, delta] of Object.entries(deltas)) {
    if (delta === undefined) continue;
    const id = key as FlagId;
    current[id] = (current[id] ?? 0) + delta;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
}

export function resetFlags(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
