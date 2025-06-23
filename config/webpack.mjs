// @ts-check

/** @typedef {import('webpack').Configuration} WebpackConfig */
/** @typedef {import('next/dist/server/config-shared').WebpackConfigContext} WebpackConfigContext */

/**
 * @param {WebpackConfig} config
 * @param {WebpackConfigContext} options
 * @returns {WebpackConfig}
 */
export const configureWebpack = (config, options) => {
    const { dev, isServer } = options

    // Ensure config.module exists and has rules array
    if (!config.module) config.module = { rules: [] }
    if (!config.module.rules) config.module.rules = []

    // Add rule to ignore test files during build
    config.module.rules.push({
        test: /\.test\.tsx?$/,
        loader: 'ignore-loader',
    })

    // Exclude Coinbase packages from client-side bundling to prevent HeartbeatWorker issues
    if (!isServer) {
        const currentExternals = Array.isArray(config.externals) ? config.externals : []
        config.externals = [...currentExternals, '@coinbase/cbpay-js']
    }

    // Production optimizations with valid webpack options only
    if (!dev) {
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                maxSize: 244000,
                cacheGroups: {
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'react',
                        chunks: 'all',
                        priority: 30,
                    },
                    wagmi: {
                        test: /[\\/]node_modules[\\/](@wagmi|wagmi|viem)[\\/]/,
                        name: 'wagmi',
                        chunks: 'all',
                        priority: 25,
                    },
                    radix: {
                        test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                        name: 'radix',
                        chunks: 'all',
                        priority: 20,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 10,
                        maxSize: 244000,
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 5,
                        reuseExistingChunk: true,
                        enforce: true,
                        maxSize: 244000,
                    },
                },
            },
            concatenateModules: true,
            usedExports: true,
            sideEffects: false,
        }
    }

    // Server-side optimizations
    if (isServer) {
        const currentExternals = Array.isArray(config.externals) ? config.externals : []
        config.externals = [...currentExternals, 'sharp']
    }

    return config
}
