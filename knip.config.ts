import type { KnipConfig } from 'knip'

export default {
  entry: [
    // Next.js entry points
    'src/app/**/*.{ts,tsx}',
  ],
  project: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/*.spec.{ts,tsx}'],
  ignore: [
    // Type definitions
    'src/**/*.d.ts',
    // Legacy old folder
    'old/**/*',
    // Contracts folder
    'contracts/**/*',
    // Public assets
    'public/**/*',
    // Other config files (not eslint/tailwind)
    '*.config.{js,mjs}',
    'knip.config.ts',
    // Environment files
    '.env*',
  ],
  // Next.js plugin configuration
  next: {
    entry: [
      'src/app/**/page.{ts,tsx}',
      'src/app/**/layout.{ts,tsx}',
      'src/app/**/loading.{ts,tsx}',
      'src/app/**/error.{ts,tsx}',
      'src/app/**/not-found.{ts,tsx}',
      'src/app/**/global-error.{ts,tsx}',
      'src/app/api/**/*.{ts,tsx}',
      'src/middleware.ts',
    ],
  },
  rules: {
    binaries: 'error',
    classMembers: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    duplicates: 'error',
    enumMembers: 'error',
    exports: 'error',
    files: 'error',
    nsExports: 'error',
    nsTypes: 'error',
    types: 'error',
    unlisted: 'error',
    unresolved: 'error',
  },
  // Ignore dependencies that are used implicitly
  ignoreDependencies: [
    // ESLint configs - used in eslint.config.ts but not imported directly
    '@tanstack/eslint-plugin-query',
    '@antfu/eslint-config',
    '@next/eslint-plugin-next',
    'eslint-plugin-react-hooks',
    'eslint-plugin-react-refresh',
    // CSS imports - used in globals.css
    'tw-animate-css',
    // Build tools and plugins - used implicitly
    'tailwindcss-safe-area',
  ],
} satisfies KnipConfig
