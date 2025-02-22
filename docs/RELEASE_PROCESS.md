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

## 5. Tagging & Deployment

After merging into `main`, create a version tag to mark the release point:

```sh
git tag v1.2.0
git push origin v1.2.0
```

The deployment will be handled automatically by our CI/CD pipeline when changes are pushed to `main`. Monitor the deployment status in GitHub's "Deployments" section.

### Post-Deployment Verification:

1. Monitor the deployment progress in GitHub's "Deployments" tab
2. Verify the application is working correctly in production
3. Check key functionality and features
4. Monitor error reporting systems

## 6. Post-Release Actions

- Document the deployment in the team's communication channels (Slack/Telegram/Discord)
- Monitor production metrics and error rates
- Begin planning the next development cycle

### Synchronize Branches

After a successful release, update the other branches to prevent divergence:

```sh
# Update staging branch
git checkout staging
git pull origin main
git push origin staging

# Update dev branch
git checkout dev
git pull origin main
git push origin dev
```

This ensures all branches are aligned with the latest release and prevents potential conflicts in future development cycles.

---

This ensures a smooth and structured release process, improving collaboration and traceability for the team.
