import type { UsageResponse } from "./types";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:3847";

export async function fetchUsage(refresh = false): Promise<UsageResponse> {
  const url = `${AGENT_URL}/api/usage${refresh ? "?refresh=1" : ""}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Agent unreachable (${response.status})`);
  }
  return response.json();
}
