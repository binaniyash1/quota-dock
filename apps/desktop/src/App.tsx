import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  autoDetect,
  getConnectionStatus,
  getUsage,
  setAlwaysOnTop,
} from "./api";
import { ProviderCard } from "./components/ProviderCard";
import type { ConnectionStatus, ProviderUsage } from "./types";

const POLL_MS = 60_000;

export default function App() {
  const [providers, setProviders] = useState<ProviderUsage[]>([]);
  const [connections, setConnections] = useState<ConnectionStatus>({
    cursor: false,
    claude: false,
    chatgpt: false,
    grok: false,
  });
  const [loading, setLoading] = useState(true);
  const [pinned, setPinned] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [usage, status] = await Promise.all([
        getUsage(),
        getConnectionStatus(),
      ]);
      setProviders(usage);
      setConnections(status);
      setLastSync(new Date().toLocaleTimeString());
      setSetupDone(
        status.cursor || status.claude || status.chatgpt || status.grok
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  async function handleAutoDetect() {
    setLoading(true);
    const status = await autoDetect();
    setConnections(status);
    setSetupDone(
      status.cursor || status.claude || status.chatgpt || status.grok
    );
    await refresh();
  }

  async function togglePin() {
    const next = !pinned;
    setPinned(next);
    await setAlwaysOnTop(next);
  }

  async function minimize() {
    await getCurrentWindow().hide();
  }

  const connectedCount = Object.values(connections).filter(Boolean).length;

  return (
    <div className="widget">
      <header className="drag-bar" data-tauri-drag-region>
        <div data-tauri-drag-region>
          <div className="drag-title">Quota Dock</div>
          <div className="drag-sub">Drag anywhere · stays on top</div>
        </div>
        <div className="window-actions">
          <button
            className="icon-btn"
            onClick={togglePin}
            title={pinned ? "Unpin" : "Pin on top"}
          >
            {pinned ? "📌" : "📍"}
          </button>
          <button className="icon-btn" onClick={refresh} title="Refresh">
            ↻
          </button>
          <button className="icon-btn" onClick={minimize} title="Hide to tray">
            –
          </button>
        </div>
      </header>

      <main className="content">
        {!setupDone && (
          <div className="setup-banner">
            <strong>One-time setup</strong>
            <br />
            Click Auto-detect to pull logins from Cursor, Claude Code, Codex,
            and Grok already on your computer. No terminal needed.
            <div className="setup-actions">
              <button className="btn btn-primary" onClick={handleAutoDetect}>
                Auto-detect logins
              </button>
              <button className="btn btn-secondary" onClick={refresh}>
                Refresh
              </button>
            </div>
          </div>
        )}

        {loading && providers.length === 0 ? (
          <p className="disconnected-text">Loading usage...</p>
        ) : (
          providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              connected={connections[provider.id as keyof ConnectionStatus]}
              onUpdate={refresh}
            />
          ))
        )}
      </main>

      <footer className="footer">
        <span>{connectedCount}/4 connected</span>
        <span>{lastSync ? `Synced ${lastSync}` : ""}</span>
      </footer>
    </div>
  );
}
