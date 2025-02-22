# Pool

## Steps to run this project

Make sure LTS node version is installed on your machine.

1. Run `corepack enable`
2. Run `pnpm install`
3. Run `pnpm run dev`

## Development Notes

### PNPM Configuration

This project uses PNPM as package manager with the following considerations:

- **Build Scripts**: Some dependencies require native build scripts (sharp, fsevents, etc.). These are automatically handled through `.npmrc` configuration and explicitly allowed in `package.json`.
- **Deprecated Dependencies**: Managed through hoisting patterns to avoid duplicates and conflicts.
- **Installation**: No need to run `pnpm approve-builds` as required scripts are pre-approved in the configuration.

## Troubleshooting

### Native Dependencies

The project uses a pure JavaScript implementation for bigint operations. You might see a warning about "Failed to load bindings", but this can be safely ignored as it doesn't affect functionality.

The warning is suppressed by default using `NODE_NO_WARNINGS=1` in the development scripts.

For optimal performance, you can optionally rebuild the native dependencies:

```bash
pnpm rebuild
```

This is only needed if you want to use native implementations instead of the JS fallback.
