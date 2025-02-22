// @ts-check

/** @type {import('next').NextConfig['experimental']} */
export const experimentalConfig = {
    optimizePackageImports: [
        '@radix-ui/react-dialog',
        '@radix-ui/react-popover',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-select',
        '@radix-ui/react-tabs',
        '@privy-io/react-auth',
        '@privy-io/wagmi',
        '@tanstack/react-query',
    ],
    serverActions: {
        bodySizeLimit: '2mb',
    },
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'INP', 'TTFB'],
    // TODO: disable as it requires deprecated package critters
    // optimizeCss: {
    //     cssModules: true,
    //     preload: 'intent',
    //     resourceBehavior: 'balanced',
    // },
}
