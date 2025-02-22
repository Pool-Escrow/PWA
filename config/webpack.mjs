// @ts-check
/* eslint-disable */

/** @type {import('next').NextConfig['webpack']} */
export const configureWebpack = (config, { isServer }) => {
    // Ignore test files
    config.module.rules.push({
        test: /\.test\.tsx?$/,
        loader: 'ignore-loader',
    })

    // Specific configuration for the server
    if (isServer) {
        // Alias to prevent server-side bundling of coinbase-wallet-sdk
        config.resolve.alias = {
            ...config.resolve.alias,
            '@coinbase/wallet-sdk': false, // Map to false (empty module)
        }
    }

    // Fallback configuration for compatibility
    config.resolve.fallback = {
        ...config.resolve?.fallback,
        'fs': false,
        'net': false,
        'tls': false,
        'encoding': false,
        'bufferutil': false,
        'utf-8-validate': false,
    }

    return config
}
