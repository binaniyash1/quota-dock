# Quota Dock — Mac Apple Silicon install

Your Mac: **Apple Silicon (M1/M2/M3/M4)**

## Get the app (2 minutes)

### Step 1 — Enable the build (one time, in browser)

1. Open https://github.com/binaniyash1/quota-dock
2. Click **Add file** → **Create new file**
3. Name the file: `.github/workflows/release.yml`
4. Copy everything from `release-workflow.yml` in the repo into that file
5. Click **Commit changes**

### Step 2 — Run the build

1. Go to **Actions** tab
2. Click **Release** → **Run workflow** → **Run workflow**
3. Wait ~10 minutes
4. Click the finished run → **Artifacts** → download `quota-dock-macos-arm64`

### Step 3 — Install

1. Open the downloaded `.dmg`
2. Drag **Quota Dock** to Applications
3. Open it (Right-click → Open if Mac warns about unidentified developer)
4. Click **Auto-detect logins**

Done. Drag the widget anywhere on your screen.

---

## Controls

- **Move**: drag the top bar
- **Hide**: click `–` (menu bar tray icon brings it back)
- **Pin on top**: click 📌
