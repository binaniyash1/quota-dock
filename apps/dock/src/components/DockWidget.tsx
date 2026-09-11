"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { fetchUsage } from "@/lib/api";
import type { ProviderUsage } from "@/lib/types";
import { ProviderCard } from "./ProviderCard";

const POLL_MS = 60_000;

export function DockWidget() {
  const [providers, setProviders] = useState<ProviderUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchUsage(refresh);
      setProviders(data.providers);
      setLastSync(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const connected = providers.filter((p) => p.status === "connected").length;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl rounded-[32px] border border-dock-border bg-dock-bg p-5 shadow-dock backdrop-blur-dock"
      >
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Quota Dock</h1>
              <p className="text-sm text-zinc-400">
                Session & weekly limits across your AI stack
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
              {connected}/4 connected
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white transition hover:bg-white/12 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}. Start the local agent with{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5">
              npm run agent
            </code>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(loading && providers.length === 0
            ? Array.from({ length: 4 }).map((_, i) => ({
                id: ["cursor", "claude", "chatgpt", "grok"][i] as ProviderUsage["id"],
                name: ["Cursor", "Claude", "ChatGPT", "Grok"][i],
                status: "disconnected" as const,
                windows: [],
                lastSyncedAt: "",
                accent: "#666",
              }))
            : providers
          ).map((provider, index) => (
            <ProviderCard key={provider.id} provider={provider} index={index} />
          ))}
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-zinc-500">
          <span>
            Reads local OAuth tokens from Cursor, Claude Code, Codex, and Grok CLI.
          </span>
          <span>
            {lastSync ? `Synced ${new Date(lastSync).toLocaleTimeString()}` : "—"}
          </span>
        </footer>
      </motion.section>
    </div>
  );
}
