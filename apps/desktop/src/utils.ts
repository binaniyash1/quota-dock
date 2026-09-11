import type { QuotaWindow } from "./types";

export function formatRemaining(window: QuotaWindow): string {
  if (window.kind === "billing_cycle") {
    return `$${window.remaining.toFixed(1)} left`;
  }
  return `${Math.round(window.remaining)}% left`;
}

export function formatUsed(window: QuotaWindow): string {
  if (window.kind === "billing_cycle") {
    return `$${window.used.toFixed(1)} / $${window.limit.toFixed(1)}`;
  }
  return `${Math.round(window.percentUsed)}% used`;
}

export function formatReset(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "resets soon";

  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `resets in ${days}d`;
  if (hours > 0) return `resets in ${hours}h`;
  const mins = Math.floor(diff / 60_000);
  return `resets in ${mins}m`;
}

export function statusColor(percent: number): string {
  if (percent >= 90) return "#ef4444";
  if (percent >= 75) return "#f59e0b";
  if (percent >= 50) return "#eab308";
  return "#22c55e";
}
