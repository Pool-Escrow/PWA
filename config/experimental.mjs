// @ts-check

// Check if Turbopack is enabled via environment variable
const isTurbopack = process.env.TURBOPACK === 'true'

/** @type {import('next').NextConfig['experimental']} */
export const experimentalConfig = {
    // Disable typedRoutes when using Turbopack as it's not supported
    typedRoutes: process.env.NODE_ENV !== 'production' && !isTurbopack,
    // ...(turboEnabled ? { turbo: { useSwcCss: true } } : {}),
    serverActions: {
        allowedOrigins: ['app.poolparty.cc'],
    },

    // Enable performance optimizations
    optimizeCss: true,
    optimizeServerReact: true,

    // Enable package import optimizations to reduce bundle size
    optimizePackageImports: [
        'lodash',
        'lodash-es',
        'date-fns',
        'lucide-react',
        '@radix-ui/react-icons',
        '@serwist/next',
        'framer-motion',
        'react-icons',
        'clsx',
        'tailwind-merge',
    ],

    // Improve webpack caching and reduce memory usage
    turbotrace: {
        logLevel: 'error',
        logDetail: false,
        contextDirectory: process.cwd(),
        memoryLimit: 2048, // Reduced memory limit to prevent large string issues
    },
}
