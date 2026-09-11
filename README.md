# Quota Dock

A **floating desktop widget** that shows how much AI quota you have left across **Cursor**, **Claude**, **ChatGPT**, and **Grok**.

Drag it anywhere on your screen. It stays on top of every app. No terminal. No localhost. No npm.

---

## For you (the user)

### Install (one time)

1. Download **Quota Dock** for your OS:
   - **Mac**: `Quota-Dock.dmg` (from Releases)
   - **Windows**: `Quota-Dock-setup.exe`
2. Open it. Drag to Applications (Mac) or run the installer (Windows).
3. Launch **Quota Dock** from your dock / start menu.

### First launch

1. Click **Auto-detect logins** — if you already use Cursor, Claude Code, Codex, or Grok on this computer, we pick it up automatically.
2. For anything missing, click **Open login** on that provider, sign in, then click Auto-detect again.
3. Done. The widget floats on your screen and refreshes every 60 seconds.

### Controls

| Action | How |
|--------|-----|
| Move widget | Drag the top bar |
| Hide | Click `–` (lives in system tray) |
| Show again | Click tray icon |
| Pin / unpin | Click 📌 |
| Refresh | Click ↻ |

---

## For customers (how you'd sell this)

```
Download → Install → Auto-detect → Floating widget
```

No API keys to configure. No dev environment. Tokens stay on the user's machine in an encrypted local store. We read the same session files their AI tools already created.

**Pricing model options:**
- One-time purchase ($9–19)
- Subscription for multi-device sync + alerts ($3/mo)
- Team tier with read-only dashboard (no token sharing)

---

## Architecture

```
┌─────────────────────────────────────┐
│  Quota Dock.app (Tauri)              │
│  • Frameless, always-on-top window   │
│  • Draggable across all apps         │
│  • System tray hide/show             │
│  • Local credential store          │
└──────────────┬──────────────────────┘
               │ reads local OAuth tokens
    ┌──────────┼──────────┬─────────────┐
    ▼          ▼          ▼            ▼
  Cursor    Claude     ChatGPT       Grok
```

**No cloud server required for v1.** Each user's app talks directly to provider APIs using their existing logins.

---

## Building releases (maintainers only)

```bash
cd apps/desktop
npm install
npm run tauri build
```

Outputs:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/nsis/`

Tag `v0.1.0` to trigger GitHub Actions release builds.

---

## Project structure

```
quota-dock/
├── apps/
│   └── desktop/          ← THE PRODUCT (Tauri floating widget)
│       ├── src/          ← React UI
│       └── src-tauri/    ← Rust backend + provider APIs
├── apps/dock/            ← (deprecated) web prototype
└── packages/providers/   ← (deprecated) shared TS lib
```

---

## What I need from you

To ship installable builds to **your** Mac:

1. **Your OS** — Mac (Intel or Apple Silicon?) or Windows?
2. **GitHub repo** — so I can push and trigger the release build that produces the `.dmg`
3. Optional: Apple Developer ID if you want it outside "unidentified developer" warnings

Once I have the repo remote + your OS, I can produce the actual installable file you double-click.

---

## License

MIT
