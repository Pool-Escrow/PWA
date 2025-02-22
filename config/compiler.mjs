// @ts-check

import { inProduction } from '../src/app/_lib/utils/environment.mjs'

/** @type {import('next').NextConfig['compiler']} */
export const compilerConfig = {
    // Console logging
    removeConsole: inProduction
        ? {
              exclude: ['error', 'warn'],
          }
        : false,

    // Module optimizations
    styledComponents: true,

    // Relay configuration
    relay: {
        src: './src',
        artifactDirectory: './__generated__',
    },
}
