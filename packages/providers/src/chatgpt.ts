import type { ProviderUsage, QuotaWindow } from "./types.js";
import { clampPercent, safeFetch } from "./utils.js";

interface ChatGptRateLimit {
  allowed?: boolean;
  limit_reached?: boolean;
  primary_window?: {
    used_percent?: number;
    limit_window_seconds?: number;
    reset_after_seconds?: number;
  };
  secondary_window?: {
    used_percent?: number;
    limit_window_seconds?: number;
    reset_after_seconds?: number;
  };
}

function windowLabel(seconds?: number): { kind: "session" | "weekly"; label: string } {
  if (!seconds) return { kind: "session", label: "Session" };
  if (seconds >= 6 * 24 * 3600) return { kind: "weekly", label: "Weekly" };
  return { kind: "session", label: "Session (5h)" };
}

function toWindow(
  window: ChatGptRateLimit["primary_window"],
  fallbackLabel: string
): QuotaWindow | null {
  if (window?.used_percent == null) return null;
  const { kind, label } = windowLabel(window.limit_window_seconds);
  const used = clampPercent(window.used_percent);
  const resetsAt = window.reset_after_seconds
    ? new Date(Date.now() + window.reset_after_seconds * 1000).toISOString()
    : undefined;

  return {
    kind,
    label: label || fallbackLabel,
    used,
    limit: 100,
    remaining: Math.max(0, 100 - used),
    percentUsed: used,
    resetsAt,
  };
}

export async function fetchChatGptUsage(
  accessToken?: string
): Promise<ProviderUsage> {
  const base: ProviderUsage = {
    id: "chatgpt",
    name: "ChatGPT",
    status: "disconnected",
    windows: [],
    lastSyncedAt: new Date().toISOString(),
    accent: "#10A37F",
  };

  if (!accessToken) {
    return { ...base, error: "No ChatGPT/Codex token found" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "OpenAI-Beta": "codex-1",
    originator: "Codex Desktop",
  };

  const usage = await safeFetch<ChatGptRateLimit>(
    "https://chatgpt.com/backend-api/wham/usage",
    { headers }
  );

  if (!usage.ok) {
    return { ...base, status: "error", error: usage.error };
  }

  const windows: QuotaWindow[] = [];
  const primary = toWindow(usage.data.primary_window, "Primary");
  const secondary = toWindow(usage.data.secondary_window, "Weekly");

  if (primary) windows.push(primary);
  if (secondary) windows.push(secondary);

  if (windows.length === 0) {
    return {
      ...base,
      status: "error",
      error: "No rate limit windows returned",
    };
  }

  return {
    ...base,
    status: "connected",
    plan: "Plus / Pro",
    windows,
  };
}
