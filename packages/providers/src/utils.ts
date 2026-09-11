import type { QuotaWindow, WindowKind } from "./types.js";

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function makeWindow(
  kind: WindowKind,
  label: string,
  used: number,
  limit: number,
  resetsAt?: string
): QuotaWindow {
  const remaining = Math.max(0, limit - used);
  const percentUsed = limit > 0 ? clampPercent((used / limit) * 100) : 0;
  return { kind, label, used, limit, remaining, percentUsed, resetsAt };
}

export function makePercentWindow(
  kind: WindowKind,
  label: string,
  percentUsed: number,
  resetsAt?: string
): QuotaWindow {
  const used = clampPercent(percentUsed);
  const limit = 100;
  const remaining = Math.max(0, limit - used);
  return { kind, label, used, limit, remaining, percentUsed: used, resetsAt };
}

export function readJsonFile<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function safeFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}
