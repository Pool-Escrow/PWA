# Release Process & Changelog Generation

This document outlines the correct process for creating a version release from the `dev` branch, merging it into `staging`, and finally deploying to `main` for production. It also includes instructions on generating a proper changelog following GitHub best practices.

## 1. Verify and Prepare `dev`

Before proceeding with a release, ensure that:

- All pull requests have been reviewed and merged into `dev`.
- Tests have been run and passed.
- Code quality checks and linting are verified.

### Steps:

```sh
# Pull the latest changes
git checkout dev
git pull origin dev

# Run tests
pnpm test

# Check for linting errors
pnpm lint

# Run prettier
pnpm prettify
```

## 2. Merge `dev` into `staging`

The `staging` branch serves as the preview environment for the upcoming release.

```sh
git checkout staging
git pull origin staging
git merge dev
# Resolve conflicts if needed
git push origin staging
```

Once merged, deploy `staging` and conduct QA testing.

## 3. Generate Changelog

For the first release or when there are no previous tags:

```sh
# Get all commits
git log --oneline

# Or get commits from last X months
git log --since="2 months ago" --oneline
```

For subsequent releases (once you have tags):

```sh
git log $(git describe --tags --abbrev=0 main)..HEAD --oneline
```

Organize the changes following these categories:

- 🚀 Added: for new features
- 🔄 Changed: for changes in existing functionality
- 🐛 Fixed: for bug fixes
- 🗑️ Removed: for removed features
- ⚠️ Deprecated: for soon-to-be removed features
- 🔒 Security: for security fixes

Example changelog structure:

```markdown
## [1.0.0] - YYYY-MM-DD

### 🚀 Added

- Initial release
- Feature A implementation
- Feature B implementation

### 🐛 Fixed

- Issue with component X
- Performance problem in Y

### 🔄 Changed

- Updated dependency versions
- Improved error handling
```

## 4. Merge `staging` into `main`

Once `staging` has been validated, proceed with the final merge to `main`.

```sh
git checkout main
git pull origin main
git merge staging
git push origin main
```

## 5. Tagging & Releasing

After merging into `main`, create a version tag and publish the release.

```sh
git tag v1.2.0
git push origin v1.2.0
```

Then, create a GitHub Release:

1. Go to **GitHub Repository** > **Releases** > **New Release**.
2. Select the tag (e.g., `v1.2.0`).
3. Copy-paste the changelog.
4. Click **Publish Release**.

## 6. Post-Release Actions

- Announce the release in Slack/Telegram/Discord.
- Monitor production for any issues.
- Begin planning the next development cycle.

---

This ensures a smooth and structured release process, improving collaboration and traceability for the team.
