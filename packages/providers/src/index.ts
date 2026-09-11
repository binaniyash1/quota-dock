import { discoverCredentials } from "./credentials.js";
import { fetchChatGptUsage } from "./chatgpt.js";
import { fetchClaudeUsage } from "./claude.js";
import { fetchCursorUsage } from "./cursor.js";
import { fetchGrokUsage } from "./grok.js";
import type { ProviderUsage } from "./types.js";

export * from "./types.js";
export { discoverCredentials } from "./credentials.js";

export async function fetchAllUsage(): Promise<ProviderUsage[]> {
  const creds = discoverCredentials();
  const [cursor, claude, chatgpt, grok] = await Promise.all([
    fetchCursorUsage(creds.cursorSessionToken),
    fetchClaudeUsage(creds.claudeAccessToken),
    fetchChatGptUsage(creds.chatgptAccessToken),
    fetchGrokUsage(creds.grokAccessToken),
  ]);
  return [cursor, claude, chatgpt, grok];
}

export function mockUsage(): ProviderUsage[] {
  const now = new Date();
  const sessionReset = new Date(now.getTime() + 2.5 * 3600 * 1000).toISOString();
  const weeklyReset = new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString();

  return [
    {
      id: "cursor",
      name: "Cursor",
      plan: "Pro",
      status: "connected",
      accent: "#7C3AED",
      lastSyncedAt: now.toISOString(),
      windows: [
        {
          kind: "billing_cycle",
          label: "Monthly included",
          used: 14.2,
          limit: 20,
          remaining: 5.8,
          percentUsed: 71,
          resetsAt: weeklyReset,
        },
        {
          kind: "monthly",
          label: "API models",
          used: 68,
          limit: 100,
          remaining: 32,
          percentUsed: 68,
        },
      ],
    },
    {
      id: "claude",
      name: "Claude",
      plan: "Max",
      status: "connected",
      accent: "#D97757",
      lastSyncedAt: now.toISOString(),
      windows: [
        {
          kind: "session",
          label: "Session (5h)",
          used: 42,
          limit: 100,
          remaining: 58,
          percentUsed: 42,
          resetsAt: sessionReset,
        },
        {
          kind: "weekly",
          label: "Weekly",
          used: 78,
          limit: 100,
          remaining: 22,
          percentUsed: 78,
          resetsAt: weeklyReset,
        },
      ],
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      plan: "Plus",
      status: "connected",
      accent: "#10A37F",
      lastSyncedAt: now.toISOString(),
      windows: [
        {
          kind: "session",
          label: "Session (5h)",
          used: 55,
          limit: 100,
          remaining: 45,
          percentUsed: 55,
          resetsAt: sessionReset,
        },
        {
          kind: "weekly",
          label: "Weekly",
          used: 31,
          limit: 100,
          remaining: 69,
          percentUsed: 31,
          resetsAt: weeklyReset,
        },
      ],
    },
    {
      id: "grok",
      name: "Grok",
      plan: "SuperGrok",
      status: "connected",
      accent: "#111827",
      lastSyncedAt: now.toISOString(),
      windows: [
        {
          kind: "weekly",
          label: "Weekly credits",
          used: 23,
          limit: 100,
          remaining: 77,
          percentUsed: 23,
          resetsAt: weeklyReset,
        },
      ],
    },
  ];
}
