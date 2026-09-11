import { useState } from "react";
import type { ProviderId, ProviderUsage } from "../types";
import { disconnect, openLogin, saveToken } from "../api";
import { formatRemaining, formatReset, formatUsed } from "../utils";
import { ProgressRing } from "./ProgressRing";

interface ProviderCardProps {
  provider: ProviderUsage;
  connected: boolean;
  onUpdate: () => void;
}

export function ProviderCard({ provider, connected, onUpdate }: ProviderCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const primary = provider.windows[0];
  const isConnected = connected && provider.status === "connected";

  async function handleSave() {
    await saveToken(provider.id as ProviderId, token);
    setToken("");
    setShowToken(false);
    onUpdate();
  }

  async function handleDisconnect() {
    await disconnect(provider.id as ProviderId);
    onUpdate();
  }

  return (
    <article className="provider-card">
      <div className="provider-header">
        <div>
          <div className="provider-name">{provider.name}</div>
          <div className="provider-plan">
            {isConnected
              ? provider.plan ?? "Connected"
              : connected
                ? "Syncing..."
                : "Not connected"}
          </div>
        </div>

        {isConnected && primary ? (
          <div className="ring-wrap">
            <ProgressRing
              percent={primary.percentUsed}
              accent={provider.accent}
            />
            <div className="ring-label">{Math.round(primary.percentUsed)}%</div>
          </div>
        ) : null}
      </div>

      {isConnected ? (
        provider.windows.map((window) => (
          <div className="meter" key={`${window.kind}-${window.label}`}>
            <div className="meter-top">
              <span className="meter-label">{window.label}</span>
              <span className="meter-value">{formatRemaining(window)}</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-fill"
                style={{
                  width: `${window.percentUsed}%`,
                  background: provider.accent,
                }}
              />
            </div>
            <div className="meter-meta">
              <span>{formatUsed(window)}</span>
              <span>{formatReset(window.resetsAt)}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="disconnected-text">
          {provider.error ??
            "Connect once — we auto-detect if you're already logged in on this Mac."}
        </p>
      )}

      <div className="connect-row">
        <button
          className="btn btn-primary"
          onClick={() => openLogin(provider.id as ProviderId)}
        >
          Open login
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowToken((v) => !v)}
        >
          {showToken ? "Cancel" : "Paste token"}
        </button>
        {connected && (
          <button className="btn btn-secondary" onClick={handleDisconnect}>
            Disconnect
          </button>
        )}
      </div>

      {showToken && (
        <>
          <input
            className="token-input"
            placeholder="Paste session token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <div className="connect-row">
            <button className="btn btn-primary" onClick={handleSave}>
              Save & connect
            </button>
          </div>
        </>
      )}
    </article>
  );
}
