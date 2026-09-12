# Build Quota Dock for Mac (Apple Silicon)

GitHub's API blocks automated creation of `.github/workflows/` files (security). Use one of these options:

## Option A — CircleCI (recommended, one signup)

1. Go to https://circleci.com/signup/ and sign in with GitHub
2. Add project: **binaniyash1/quota-dock**
3. Click **Set Up Project** → use existing `.circleci/config.yml`
4. Run pipeline → download DMG from **Artifacts**

## Option B — Fix GitHub Actions (30 seconds in browser)

Open this link (creates file in the ONLY path GitHub accepts):

https://github.com/binaniyash1/quota-dock/new/main?filename=.github/workflows/release.yml

Paste contents from `release-workflow.yml` (delete first 2 comment lines), commit.

Then: Actions → Release → Run workflow.
