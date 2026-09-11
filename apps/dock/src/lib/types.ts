export type ProviderId = "cursor" | "claude" | "chatgpt" | "grok";

export type WindowKind = "session" | "weekly" | "monthly" | "billing_cycle";

export type ProviderStatus = "connected" | "disconnected" | "error" | "stale";

export interface QuotaWindow {
  kind: WindowKind;
  label: string;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  resetsAt?: string;
}

export interface ProviderUsage {
  id: ProviderId;
  name: string;
  plan?: string;
  status: ProviderStatus;
  windows: QuotaWindow[];
  lastSyncedAt: string;
  error?: string;
  accent: string;
}

export interface UsageResponse {
  providers: ProviderUsage[];
  cached?: boolean;
}
