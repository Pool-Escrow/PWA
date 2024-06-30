// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer'
// import withSerwistInit from '@serwist/next'
import { inProduction } from './src/lib/utils/environment.mjs'

const turboEnabled = process.env.TURBO === 'true'

// const withSerwist = withSerwistInit({
//     swSrc: 'src/lib/utils/sw.ts',
//     swDest: 'public/sw.js',
//     // disable: !inProduction,
//     disable: true,
//     scope: '/pwa',
// })

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(
    // withSerwist(
    {
        eslint: { ignoreDuringBuilds: true },
        ...(turboEnabled ? {} : { compiler: { removeConsole: inProduction } }),
        experimental: {
            typedRoutes: !inProduction && !turboEnabled,
            ...(turboEnabled ? { turbo: { useSwcCss: true } } : {}),
            serverActions: {
                allowedOrigins: ['app.localhost:3000'],
            },
        },
        reactStrictMode: !inProduction,
        images: {
            remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
        },
        // async rewrites() {
        //     return [
        //         {
        //             source: '/:path*',
        //             destination: '/pwa/:path*',
        //             has: [
        //                 {
        //                     type: 'host',
        //                     value: 'app.localhost:3000',
        //                 },
        //             ],
        //         },
        //         {
        //             source: '/:path*',
        //             destination: '/pwa/:path*',
        //             has: [
        //                 {
        //                     type: 'host',
        //                     value: 'app.poolparty.cc',
        //                 },
        //             ],
        //         },
        //         {
        //             source: '/:path*',
        //             destination: '/landing/:path*',
        //             has: [
        //                 {
        //                     type: 'host',
        //                     value: 'localhost:3000',
        //                 },
        //             ],
        //         },
        //         {
        //             source: '/:path*',
        //             destination: '/landing/:path*',
        //             has: [
        //                 {
        //                     type: 'host',
        //                     value: 'poolparty.cc',
        //                 },
        //             ],
        //         },
        //         {
        //             source: '/:path*',
        //             destination: '/landing/:path*',
        //             has: [
        //                 {
        //                     type: 'host',
        //                     value: 'www.poolparty.cc',
        //                 },
        //             ],
        //         },
        //     ]
        // },
        webpack: (config, { dev, isServer }) => {
            // if (dev) {
            //     config.devtool = 'source-map'
            // }
            // Exclude *.test.ts(x) files from being compiled by Next.js
            config.module.rules.push({
                test: /\.test\.tsx?$/,
                use: 'ignore-loader',
            })
            return config
        },
    },
    // ),
)
