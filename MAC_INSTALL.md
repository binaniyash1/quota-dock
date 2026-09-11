# Quota Dock — Mac Apple Silicon install

Your Mac: **Apple Silicon (M1/M2/M3/M4)**

## Why you don't see "Release" in Actions yet

GitHub only shows a workflow **after** the file exists at this exact path on the repo **root**:

```
.github/workflows/release.yml
```

Not inside `agent/`. Not `release-workflow.yml` in the root. Until that file exists, the Actions tab will be empty or show setup prompts — **no "Release" to click**.

---

## Step 1 — Create the workflow file (required first)

**Use this direct link** (creates the file in the right place):

https://github.com/binaniyash1/quota-dock/new/main?filename=.github/workflows/release.yml

1. Open that link
2. Open `release-workflow.yml` in the repo: https://github.com/binaniyash1/quota-dock/blob/main/release-workflow.yml
3. Click **Raw**, select all, copy
4. Paste into the new file you're creating
5. **Delete the first 2 comment lines** at the top (lines starting with `# COPY` and `# Then go`)
6. Click **Commit changes** (green button)

---

## Step 2 — Run the build

1. Go to https://github.com/binaniyash1/quota-dock/actions
2. In the **left sidebar**, you should now see **Release**
3. Click **Release**
4. Click **Run workflow** (right side) → **Run workflow** again
5. Wait ~10 minutes
6. Click the finished run → scroll to **Artifacts** → download `quota-dock-macos-arm64`

### Still don't see Release?

- Confirm the file exists at: https://github.com/binaniyash1/quota-dock/blob/main/.github/workflows/release.yml
- If Actions asks to enable workflows, click **I understand my workflows, go ahead and enable them**
- Refresh the page after committing

---

## Step 3 — Install

1. Open the downloaded `.dmg`
2. Drag **Quota Dock** to Applications
3. Open it (Right-click → Open if Mac warns about unidentified developer)
4. Click **Auto-detect logins**

Done. Drag the widget anywhere on your screen.
