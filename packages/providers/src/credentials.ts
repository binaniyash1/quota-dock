import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile } from "./utils.js";

function readText(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}

function findInHome(pattern: RegExp): string[] {
  const home = homedir();
  try {
    return readdirSync(home)
      .filter((name) => pattern.test(name))
      .map((name) => join(home, name));
  } catch {
    return [];
  }
}

export interface DiscoveredCredentials {
  cursorSessionToken?: string;
  claudeAccessToken?: string;
  chatgptAccessToken?: string;
  grokAccessToken?: string;
}

export function discoverCredentials(): DiscoveredCredentials {
  const creds: DiscoveredCredentials = {};

  // Cursor: state.vscdb or session from Cursor auth
  const cursorStorage = join(
    homedir(),
    ".config/Cursor/User/globalStorage/storage.json"
  );
  const cursorState = readText(cursorStorage);
  if (cursorState) {
    const match = cursorState.match(/WorkosCursorSessionToken["']?\s*[:=]\s*["']?([^"'\s,}]+)/);
    if (match?.[1]) creds.cursorSessionToken = match[1];
  }

  // Also check env override
  creds.cursorSessionToken ??=
    process.env.CURSOR_SESSION_TOKEN ?? creds.cursorSessionToken;

  // Claude: ~/.claude/.credentials.json and profile dirs
  const claudePaths = [
    join(homedir(), ".claude/.credentials.json"),
    ...findInHome(/^\.claude-/).map((dir) =>
      join(dir, ".credentials.json")
    ),
  ];

  for (const path of claudePaths) {
    const raw = readText(path);
    if (!raw) continue;
    const json = readJsonFile<{
      claudeAiOauth?: { accessToken?: string };
      oauth?: { accessToken?: string };
    }>(raw);
    const token =
      json?.claudeAiOauth?.accessToken ?? json?.oauth?.accessToken;
    if (token) {
      creds.claudeAccessToken = token;
      break;
    }
  }
  creds.claudeAccessToken ??= process.env.ANTHROPIC_OAUTH_TOKEN;

  // ChatGPT / Codex: ~/.codex/auth.json
  const codexPaths = [
    join(homedir(), ".codex/auth.json"),
    ...findInHome(/^\.codex-/).map((dir) => join(dir, "auth.json")),
  ];

  for (const path of codexPaths) {
    const raw = readText(path);
    if (!raw) continue;
    const json = readJsonFile<{
      tokens?: { access_token?: string };
      accessToken?: string;
    }>(raw);
    const token = json?.tokens?.access_token ?? json?.accessToken;
    if (token) {
      creds.chatgptAccessToken = token;
      break;
    }
  }
  creds.chatgptAccessToken ??= process.env.OPENAI_CODEX_TOKEN;

  // Grok: ~/.grok/auth.json
  const grokPaths = [
    join(homedir(), ".grok/auth.json"),
    ...findInHome(/^\.grok-/).map((dir) => join(dir, "auth.json")),
  ];

  for (const path of grokPaths) {
    const raw = readText(path);
    if (!raw) continue;
    const json = readJsonFile<Record<string, { key?: string }>>(raw);
    if (!json) continue;
    for (const value of Object.values(json)) {
      if (value?.key) {
        creds.grokAccessToken = value.key;
        break;
      }
    }
    if (creds.grokAccessToken) break;
  }
  creds.grokAccessToken ??= process.env.GROK_ACCESS_TOKEN;

  return creds;
}
