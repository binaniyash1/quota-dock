# Quota Dock — Mac Apple Silicon install

Your Mac: **Apple Silicon (M1/M2/M3/M4)**

## Fastest path: CircleCI (recommended — no manual file creation)

The macOS build is already configured in `.circleci/config.yml` on `main`.

1. Open **https://circleci.com/signup/** → sign up with **GitHub**
2. **Projects** → find **quota-dock** → **Set Up Project** → start build
3. Wait ~10 minutes
4. Open the pipeline → **Artifacts** → download the `.dmg`
5. Open DMG → drag **Quota Dock** to Applications → launch → **Auto-detect logins**

---

## Alternative: GitHub Actions

Needs `.github/workflows/release.yml` at repo root. GitHub blocks automated agents from creating this file unless the token has `workflow` scope — so it must be created in the browser:

1. https://github.com/binaniyash1/quota-dock/new/main?filename=.github/workflows/release.yml
2. Copy from `release-workflow.yml` (delete the first 2 comment lines)
3. Commit → **Actions** → **Release** → **Run workflow**
4. Download artifact `quota-dock-macos-arm64`

---

## Controls

- **Move**: drag the top bar
- **Hide**: click `–` (menu bar tray icon brings it back)
- **Pin on top**: click 📌
