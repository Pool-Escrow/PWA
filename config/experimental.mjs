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
    // optimizeCss: true,
    // optimizeServerReact: true,
    // turbotrace: {
    //     logLevel: 'error',
    //     logDetail: true,
    //     contextDirectory: process.cwd(),
    //     memoryLimit: 4096,
    // },
    //
    // optimizePackageImports: [
    //     'lodash',
    //     'date-fns',
    //     'lucide-react', // Added to optimize icons
    //     '@serwist/next', // Added to optimize PWA
    // ],
}
