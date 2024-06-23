// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer'
import withSerwistInit from '@serwist/next'
import { inProduction } from './src/lib/utils/environment.mjs'

const turboEnabled = process.env.TURBO === 'true'

const withSerwist = withSerwistInit({
    swSrc: 'src/lib/utils/sw.ts',
    swDest: 'public/sw.js',
    disable: !inProduction,
})

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(
    withSerwist({
        eslint: { ignoreDuringBuilds: true },
        ...(turboEnabled ? {} : { compiler: { removeConsole: inProduction } }),
        experimental: {
            typedRoutes: !inProduction && !turboEnabled,
            ...(turboEnabled ? { turbo: { useSwcCss: true } } : {}),
        },
        reactStrictMode: !inProduction,
        images: {
            remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
        },
        redirects: async () => Promise.resolve([{ source: '/', destination: '/pools', permanent: true }]),
        webpack: (config, { dev, isServer }) => {
            // Exclude *.test.ts(x) files from being compiled by Next.js
            config.module.rules.push({
                test: /\.test\.tsx?$/,
                use: 'ignore-loader',
            })
            return config
        },
    }),
)
