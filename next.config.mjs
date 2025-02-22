// @ts-check

import bundleAnalyzer from '@next/bundle-analyzer'
import { execSync } from 'node:child_process'
import { compilerConfig } from './config/compiler.mjs'
import { experimentalConfig } from './config/experimental.mjs'
import { imageConfig } from './config/images.mjs'
import { getRewriteRules } from './config/rewrites.mjs'
import { getSecurityHeaders } from './config/security.mjs'
import { withSerwist } from './config/serwist.mjs'
import { configureWebpack } from './config/webpack.mjs'

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const baseConfig = {
    compiler: compilerConfig,
    eslint: { ignoreDuringBuilds: true },
    experimental: experimentalConfig,
    headers: getSecurityHeaders,
    images: imageConfig,
    reactStrictMode: true,
    rewrites: getRewriteRules,
    webpack: configureWebpack,

    // Base configuration
    poweredByHeader: false,
    compress: true,

    // Critical server-side configuration
    serverExternalPackages: [
        '@privy-io/server-auth',
        'crypto',
        'stream',
        'querystring',
        'path',
        '@coinbase/wallet-sdk',
    ],

    // Build optimizations
    generateBuildId: () => execSync('git rev-parse HEAD').toString().trim(),
    productionBrowserSourceMaps: false,

    // Chunks optimizations
    onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000,
        pagesBufferLength: 2,
    },
}

export default withBundleAnalyzer(withSerwist(baseConfig))
