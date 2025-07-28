// @ts-check

// import bundleAnalyzer from '@next/bundle-analyzer'
import config from './config/index.mjs'
// import { execSync } from 'node:child_process'

// const withBundleAnalyzer = bundleAnalyzer({
//     enabled: process.env.ANALYZE === 'true',
// })

/** @type {import('next').NextConfig} */
const baseConfig = {
    // compiler: config.compiler,
    // eslint: { ignoreDuringBuilds: true },
    // optimizeCss: true,
    serverExternalPackages: [
        'bigint-buffer',
        //     'keccak',
        //     'secp256k1',
        //     '@solana/buffer-layout-utils',
        //     '@coinbase/wallet-sdk',
    ],
    // headers: config.security,
    images: config.images,
    // reactStrictMode: true,
    rewrites: config.rewrites,
    // webpack: config.webpack,
    // generateBuildId: () => execSync('git rev-parse HEAD').toString().trim(),
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default baseConfig
// export default withBundleAnalyzer(config.serwist(baseConfig))
