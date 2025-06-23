// @ts-check

// Check if Turbopack is enabled via environment variable
const isTurbopack = process.env.TURBOPACK === 'true'

/** @type {import('next').NextConfig['compiler']} */
export const compilerConfig = {
    // Disable removeConsole when using Turbopack as it's not supported
    removeConsole:
        process.env.NODE_ENV === 'production' && !isTurbopack
            ? {
                  exclude: ['error', 'warn'],
              }
            : false,
}
