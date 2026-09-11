export function formatRemaining(window: {
  kind: string;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
}): string {
  if (window.kind === "billing_cycle") {
    return `$${window.remaining.toFixed(1)} left`;
  }
  return `${window.remaining}% left`;
}

export function formatUsed(window: {
  kind: string;
  used: number;
  limit: number;
  percentUsed: number;
}): string {
  if (window.kind === "billing_cycle") {
    return `$${window.used.toFixed(1)} / $${window.limit.toFixed(1)}`;
  }
  return `${window.percentUsed}% used`;
}

export function formatReset(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "resets soon";

  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `resets in ${days}d`;
  if (hours > 0) return `resets in ${hours}h`;
  const mins = Math.floor(diffMs / 60_000);
  return `resets in ${mins}m`;
}

export function statusColor(percentUsed: number): string {
  if (percentUsed >= 90) return "#ef4444";
  if (percentUsed >= 75) return "#f59e0b";
  if (percentUsed >= 50) return "#eab308";
  return "#22c55e";
}
