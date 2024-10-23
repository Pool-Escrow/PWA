// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer'
import withSerwistInit from '@serwist/next'
import { inProduction } from './src/app/_lib/utils/environment.mjs'
import { execSync } from 'node:child_process'

const turboEnabled = process.env.TURBO === 'true'

const withSerwist = withSerwistInit({
    swSrc: 'src/app/_lib/utils/sw.ts',
    swDest: 'public/sw.js',
    disable: !inProduction,
    scope: '/',
    cacheOnNavigation: true,
})

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.privy.io https://js.stripe.com https://*.stripe.com blob:;
    worker-src 'self' blob:;
    style-src 'self' 'unsafe-inline' https://cdn.privy.io;
    img-src 'self' blob: data: https://*.supabase.co https://explorer-api.walletconnect.com https://*.poolparty.cc;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://app.privy.io https://auth.privy.io https://js.stripe.com;
    connect-src 'self' https://api.privy.io https://auth.privy.io wss://auth.privy.io https://mainnet.base.org https://explorer-api.walletconnect.com https://*.supabase.co https://*.stripe.com https://*.coinbase.com https://sepolia.base.org https://pulse.walletconnect.org https://chain-proxy.wallet.coinbase.com;
    upgrade-insecure-requests;
`

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(
    withSerwist({
        eslint: { ignoreDuringBuilds: true },
        ...(turboEnabled ? {} : { compiler: { removeConsole: inProduction } }),
        experimental: {
            typedRoutes: !inProduction && !turboEnabled,
            ...(turboEnabled ? { turbo: { useSwcCss: true } } : {}),
            serverActions: {
                allowedOrigins: ['app.poolparty.cc'],
            },
        },
        reactStrictMode: !inProduction,
        images: {
            remotePatterns: [
                { protocol: 'https', hostname: '*.supabase.co' },
                { protocol: 'https', hostname: 'cdn.privy.io' },
            ],
        },
        generateBuildId: () => {
            const hash = execSync('git rev-parse HEAD').toString().trim()
            return hash
        },
        webpack: (config, options) => {
            // Exclude *.test.ts(x) files from being compiled by Next.js
            config.module.rules.push({
                test: /\.test\.tsx?$/,
                use: 'ignore-loader',
            })
            config.plugins.push(
                new options.webpack.DefinePlugin({
                    'process.env.CONFIG_BUILD_ID': JSON.stringify(options.buildId),
                }),
            )
            return config
        },
        async rewrites() {
            return [
                { source: '/profile/new', destination: '/profile/edit?new' },
                { source: '/', destination: '/pools' },
            ]
        },
        async headers() {
            return [
                {
                    source: '/(.*)',
                    headers: [
                        {
                            key: 'Content-Security-Policy',
                            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
                        },
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY',
                        },
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff',
                        },
                        {
                            key: 'Referrer-Policy',
                            value: 'strict-origin-when-cross-origin',
                        },
                        {
                            key: 'Permissions-Policy',
                            value: 'camera=self',
                        },
                    ],
                },
            ]
        },
    }),
)
