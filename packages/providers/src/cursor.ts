import type { ProviderUsage } from "./types.js";
import { clampPercent, makeWindow, safeFetch } from "./utils.js";

interface CursorPlanUsage {
  totalSpend?: number;
  includedSpend?: number;
  limit?: number;
  totalPercentUsed?: number;
  autoPercentUsed?: number;
  apiPercentUsed?: number;
}

interface CursorPeriodUsage {
  planUsage?: CursorPlanUsage;
  billingCycleEnd?: string;
  membershipType?: string;
}

interface CursorUsageSummary {
  billingCycleEnd?: string;
  membershipType?: string;
  individualUsage?: {
    plan?: {
      used?: number;
      limit?: number;
      remaining?: number;
      totalPercentUsed?: number;
      apiPercentUsed?: number;
      autoPercentUsed?: number;
    };
  };
}

export async function fetchCursorUsage(
  sessionToken?: string
): Promise<ProviderUsage> {
  const base: ProviderUsage = {
    id: "cursor",
    name: "Cursor",
    status: "disconnected",
    windows: [],
    lastSyncedAt: new Date().toISOString(),
    accent: "#7C3AED",
  };

  if (!sessionToken) {
    return { ...base, error: "No session token found" };
  }

  const headers = {
    Cookie: `WorkosCursorSessionToken=${sessionToken}`,
    "Content-Type": "application/json",
  };

  const period = await safeFetch<CursorPeriodUsage>(
    "https://api2.cursor.sh/aiserver.v1.DashboardService/GetCurrentPeriodUsage",
    {
      method: "POST",
      headers,
      body: "{}",
    }
  );

  const summary = await safeFetch<CursorUsageSummary>(
    "https://www.cursor.com/api/usage-summary",
    { headers: { Cookie: headers.Cookie } }
  );

  const windows: ProviderUsage["windows"] = [];

  if (period.ok && period.data.planUsage) {
    const plan = period.data.planUsage;
    const limit = (plan.limit ?? 0) / 100;
    const used = (plan.totalSpend ?? plan.includedSpend ?? 0) / 100;

    if (limit > 0) {
      windows.push(
        makeWindow(
          "billing_cycle",
          "Monthly included",
          used,
          limit,
          period.data.billingCycleEnd
        )
      );
    }

    if (plan.totalPercentUsed != null) {
      windows.push({
        kind: "monthly",
        label: "Total usage",
        used: clampPercent(plan.totalPercentUsed),
        limit: 100,
        remaining: Math.max(0, 100 - clampPercent(plan.totalPercentUsed)),
        percentUsed: clampPercent(plan.totalPercentUsed),
        resetsAt: period.data.billingCycleEnd,
      });
    }

    if (plan.apiPercentUsed != null) {
      windows.push({
        kind: "monthly",
        label: "API models",
        used: clampPercent(plan.apiPercentUsed),
        limit: 100,
        remaining: Math.max(0, 100 - clampPercent(plan.apiPercentUsed)),
        percentUsed: clampPercent(plan.apiPercentUsed),
      });
    }

    if (plan.autoPercentUsed != null) {
      windows.push({
        kind: "monthly",
        label: "Cursor models",
        used: clampPercent(plan.autoPercentUsed),
        limit: 100,
        remaining: Math.max(0, 100 - clampPercent(plan.autoPercentUsed)),
        percentUsed: clampPercent(plan.autoPercentUsed),
      });
    }
  }

  if (summary.ok && summary.data.individualUsage?.plan) {
    const plan = summary.data.individualUsage.plan;
    if (plan.limit && plan.used != null && windows.length === 0) {
      windows.push(
        makeWindow(
          "billing_cycle",
          "Plan requests",
          plan.used,
          plan.limit,
          summary.data.billingCycleEnd
        )
      );
    }
  }

  if (windows.length === 0) {
    return {
      ...base,
      status: "error",
      error: period.ok
        ? "Connected but no usage windows returned"
        : period.error,
    };
  }

  return {
    ...base,
    status: "connected",
    plan: period.ok
      ? period.data.membershipType
      : summary.ok
        ? summary.data.membershipType
        : undefined,
    windows,
  };
}
