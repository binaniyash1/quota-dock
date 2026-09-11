export interface QuotaWindow {
  kind: string;
  label: string;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  resetsAt?: string;
}

export interface ProviderUsage {
  id: string;
  name: string;
  plan?: string;
  status: string;
  windows: QuotaWindow[];
  lastSyncedAt: string;
  error?: string;
  accent: string;
}

export interface ConnectionStatus {
  cursor: boolean;
  claude: boolean;
  chatgpt: boolean;
  grok: boolean;
}

export type ProviderId = "cursor" | "claude" | "chatgpt" | "grok";
