// @ts-check

import bundleAnalyzer from '@next/bundle-analyzer'
import { execSync } from 'node:child_process'
import config from './config/index.mjs'

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const baseConfig = {
    compiler: config.compiler,
    eslint: { ignoreDuringBuilds: true },
    experimental: {
        ...config.experimental,
        optimizeCss: true,
    },
    headers: config.security,
    images: config.images,
    reactStrictMode: true,
    rewrites: config.rewrites,
    webpack: config.webpack,
    generateBuildId: () => execSync('git rev-parse HEAD').toString().trim(),
}

export default withBundleAnalyzer(config.serwist(baseConfig))
