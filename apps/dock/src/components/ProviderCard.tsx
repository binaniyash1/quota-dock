"use client";

import { motion } from "framer-motion";
import { AlertCircle, WifiOff } from "lucide-react";
import { formatRemaining, formatReset, formatUsed } from "@/lib/format";
import type { ProviderUsage } from "@/lib/types";
import { ProgressRing } from "./ProgressRing";
import { ProviderIcon } from "./ProviderIcon";

interface ProviderCardProps {
  provider: ProviderUsage;
  index: number;
}

export function ProviderCard({ provider, index }: ProviderCardProps) {
  const primary = provider.windows[0];
  const secondary = provider.windows[1];
  const disconnected = provider.status !== "connected";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group relative min-w-[220px] rounded-3xl border border-dock-border bg-dock-card p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px ${provider.accent}22`,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProviderIcon id={provider.id} />
          <div>
            <h3 className="text-sm font-semibold text-white">{provider.name}</h3>
            <p className="text-xs text-zinc-400">
              {provider.plan ?? (disconnected ? "Not connected" : "Subscription")}
            </p>
          </div>
        </div>

        {primary && !disconnected ? (
          <div className="relative">
            <ProgressRing
              percent={primary.percentUsed}
              accent={provider.accent}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
              {primary.percentUsed}%
            </div>
          </div>
        ) : (
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/5 text-zinc-500">
            {provider.status === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </div>
        )}
      </div>

      {disconnected ? (
        <p className="text-xs leading-relaxed text-zinc-500">
          {provider.error ?? "Log in locally to sync usage."}
        </p>
      ) : (
        <div className="space-y-3">
          {provider.windows.map((window) => (
            <div key={`${window.kind}-${window.label}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">{window.label}</span>
                <span className="font-medium text-zinc-200">
                  {formatRemaining(window)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${window.percentUsed}%`,
                    background: provider.accent,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{formatUsed(window)}</span>
                <span>{formatReset(window.resetsAt) ?? ""}</span>
              </div>
            </div>
          ))}

          {secondary && (
            <div className="rounded-2xl bg-black/20 px-3 py-2 text-[10px] text-zinc-400">
              {secondary.label}: {formatRemaining(secondary)}
            </div>
          )}
        </div>
      )}
    </motion.article>
  );
}
