/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [tsconfigPaths(), react()],
        test: {
            environment: 'jsdom',
            server: {
                deps: {
                    inline: ['@privy-io/js-sdk-core'],
                },
            },
            globals: true,
            setupFiles: './tests/setup.ts',
            include: ['**/*.test.{ts,tsx}'],
            env,
        },
    }
})
