// @ts-check

/** @type {import('next').NextConfig['webpack']} */
export const configureWebpack = (config, options) => {
    // const { dev, isServer } = options

    // if (!config.module) config.module = { rules: [] }
    // if (!config.optimization) config.optimization = {}
    // if (!config.plugins) config.plugins = []

    // if (!dev) {
    //     config.optimization = {
    //         ...config.optimization,
    //         moduleIds: 'deterministic',
    //         runtimeChunk: 'single',
    //         splitChunks: {
    //             chunks: 'all',
    //             cacheGroups: {
    //                 vendor: {
    //                     test: /[\\/]node_modules[\\/]/,
    //                     name: 'vendors',
    //                     chunks: 'all',
    //                     priority: 20,
    //                 },
    //                 common: {
    //                     name: 'common',
    //                     minChunks: 2,
    //                     chunks: 'all',
    //                     priority: 10,
    //                     reuseExistingChunk: true,
    //                     enforce: true,
    //                 },
    //             },
    //         },
    //     }
    // }

    config.module.rules.push({
        test: /\.test\.tsx?$/,
        loader: 'ignore-loader',
    })

    // if (isServer) {
    //     config.externals = [...(config.externals || []), 'react', 'react-dom']
    // }

    return config
}
