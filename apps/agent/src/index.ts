import cors from "cors";
import express from "express";
import {
  discoverCredentials,
  fetchAllUsage,
  mockUsage,
} from "@quota-dock/providers";

const PORT = Number(process.env.QUOTA_DOCK_PORT ?? 3847);
const USE_MOCK = process.env.QUOTA_DOCK_MOCK === "1";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

let cache: { data: Awaited<ReturnType<typeof fetchAllUsage>>; at: number } | null =
  null;
const CACHE_TTL_MS = 60_000;

app.get("/health", (_req, res) => {
  res.json({ ok: true, mock: USE_MOCK });
});

app.get("/api/credentials", (_req, res) => {
  const creds = discoverCredentials();
  res.json({
    cursor: Boolean(creds.cursorSessionToken),
    claude: Boolean(creds.claudeAccessToken),
    chatgpt: Boolean(creds.chatgptAccessToken),
    grok: Boolean(creds.grokAccessToken),
  });
});

app.get("/api/usage", async (_req, res) => {
  try {
    const force = _req.query.refresh === "1";
    const now = Date.now();

    if (
      !force &&
      cache &&
      now - cache.at < CACHE_TTL_MS
    ) {
      return res.json({ providers: cache.data, cached: true });
    }

    const providers = USE_MOCK ? mockUsage() : await fetchAllUsage();
    cache = { data: providers, at: now };
    res.json({ providers, cached: false });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch usage",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Quota Dock agent listening on http://localhost:${PORT}`);
  console.log(USE_MOCK ? "Running in mock mode" : "Reading local credentials");
});
