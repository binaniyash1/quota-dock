import type { ProviderUsage } from "./types.js";
import { makePercentWindow, safeFetch } from "./utils.js";

interface ClaudeOAuthUsage {
  five_hour?: { utilization?: number; resets_at?: string };
  seven_day?: { utilization?: number; resets_at?: string };
  five_hour_sonnet?: { utilization?: number; resets_at?: string };
  seven_day_sonnet?: { utilization?: number; resets_at?: string };
  five_hour_opus?: { utilization?: number; resets_at?: string };
  seven_day_opus?: { utilization?: number; resets_at?: string };
}

interface ClaudeProfile {
  subscription_type?: string;
}

export async function fetchClaudeUsage(
  accessToken?: string
): Promise<ProviderUsage> {
  const base: ProviderUsage = {
    id: "claude",
    name: "Claude",
    status: "disconnected",
    windows: [],
    lastSyncedAt: new Date().toISOString(),
    accent: "#D97757",
  };

  if (!accessToken) {
    return { ...base, error: "No Claude OAuth token found" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "anthropic-beta": "oauth-2025-04-20",
  };

  const usage = await safeFetch<ClaudeOAuthUsage>(
    "https://api.anthropic.com/api/oauth/usage",
    { headers }
  );

  const profile = await safeFetch<ClaudeProfile>(
    "https://api.anthropic.com/api/oauth/profile",
    { headers }
  );

  if (!usage.ok) {
    return { ...base, status: "error", error: usage.error };
  }

  const windows: ProviderUsage["windows"] = [];
  const data = usage.data;

  const session =
    data.five_hour_sonnet ??
    data.five_hour_opus ??
    data.five_hour;
  const weekly =
    data.seven_day_sonnet ??
    data.seven_day_opus ??
    data.seven_day;

  if (session?.utilization != null) {
    windows.push(
      makePercentWindow(
        "session",
        "Session (5h)",
        session.utilization,
        session.resets_at
      )
    );
  }

  if (weekly?.utilization != null) {
    windows.push(
      makePercentWindow(
        "weekly",
        "Weekly",
        weekly.utilization,
        weekly.resets_at
      )
    );
  }

  if (windows.length === 0) {
    return {
      ...base,
      status: "error",
      error: "No usage windows in response",
    };
  }

  return {
    ...base,
    status: "connected",
    plan: profile.ok ? profile.data.subscription_type : undefined,
    windows,
  };
}
