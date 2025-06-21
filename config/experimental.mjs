// @ts-check

import { inProduction } from '../src/app/_lib/utils/environment.mjs'

const turboEnabled = process.env.TURBO === 'true'

/** @type {import('next').NextConfig['experimental']} */
export const experimentalConfig = {
    typedRoutes: !inProduction && !turboEnabled,
    // ...(turboEnabled ? { turbo: { useSwcCss: true } } : {}),
    serverActions: {
        allowedOrigins: ['app.poolparty.cc'],
    },

    // Enable performance optimizations
    optimizeCss: true,
}
