// @ts-check

import bundleAnalyzer from '@next/bundle-analyzer'
import config from './config/index.mjs'
// import { execSync } from 'node:child_process'

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const baseConfig = {
    // compiler: config.compiler,
    // eslint: { ignoreDuringBuilds: true },
    // optimizeCss: true,
    experimental: {
        // ...config.experimental,
        // Exclude native modules from bundling to prevent "Failed to load bindings" warnings
        // See: https://bgenc.net/2023.08.13.nextjs-bindings-cannot-read-property-indexof-undefined-getfilename/
        serverComponentsExternalPackages: [
            'bigint-buffer',
            //     'keccak',
            //     'secp256k1',
            //     '@solana/buffer-layout-utils',
            //     '@coinbase/wallet-sdk',
        ],
    },
    // headers: config.security,
    images: config.images,
    // reactStrictMode: true,
    rewrites: config.rewrites,
    // webpack: config.webpack,
    // generateBuildId: () => execSync('git rev-parse HEAD').toString().trim(),
}

export default baseConfig
// export default withBundleAnalyzer(config.serwist(baseConfig))
