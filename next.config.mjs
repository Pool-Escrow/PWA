// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer'
import withSerwistInit from '@serwist/next'
import { inProduction } from './src/lib/utils/environment.mjs'

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
        compiler: { removeConsole: inProduction },
        experimental: {
            typedRoutes: !inProduction,
            // turbo: {
            // useSwcCss: true,
            // },
        },
        reactStrictMode: !inProduction,
        images: {
            remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
        },
        redirects: async () => Promise.resolve([{ source: '/', destination: '/pools', permanent: true }]),
    }),
)
