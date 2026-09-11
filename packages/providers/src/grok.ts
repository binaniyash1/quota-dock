import type { ProviderUsage } from "./types.js";
import { clampPercent, makePercentWindow, safeFetch } from "./utils.js";

interface GrokBillingCredits {
  config?: {
    creditUsagePercent?: number;
    currentPeriod?: { end?: string };
  };
  productUsage?: Array<{
    name?: string;
    usagePercent?: number;
  }>;
}

export async function fetchGrokUsage(
  accessToken?: string
): Promise<ProviderUsage> {
  const base: ProviderUsage = {
    id: "grok",
    name: "Grok",
    status: "disconnected",
    windows: [],
    lastSyncedAt: new Date().toISOString(),
    accent: "#111827",
  };

  if (!accessToken) {
    return { ...base, error: "No Grok auth token found" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-XAI-Token-Auth": "xai-grok-cli",
  };

  const billing = await safeFetch<GrokBillingCredits>(
    "https://cli-chat-proxy.grok.com/v1/billing?format=credits",
    { headers }
  );

  if (!billing.ok) {
    return { ...base, status: "error", error: billing.error };
  }

  const windows: ProviderUsage["windows"] = [];
  const config = billing.data.config;

  if (config?.creditUsagePercent != null) {
    windows.push(
      makePercentWindow(
        "weekly",
        "Weekly credits",
        config.creditUsagePercent,
        config.currentPeriod?.end
      )
    );
  }

  for (const product of billing.data.productUsage ?? []) {
    if (product.usagePercent == null || !product.name) continue;
    windows.push({
      kind: "weekly",
      label: product.name,
      used: clampPercent(product.usagePercent),
      limit: 100,
      remaining: Math.max(0, 100 - clampPercent(product.usagePercent)),
      percentUsed: clampPercent(product.usagePercent),
      resetsAt: config?.currentPeriod?.end,
    });
  }

  if (windows.length === 0) {
    return {
      ...base,
      status: "error",
      error: "No billing windows returned",
    };
  }

  return {
    ...base,
    status: "connected",
    plan: "SuperGrok / Build",
    windows,
  };
}
