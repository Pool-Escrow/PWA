import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

import './src/lib/env/client'
import './src/lib/env/server'

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
  // currently only development
  turbopack: {
    resolveAlias: {
      '@/lib/icons/bundle.json': './src/lib/icons/bundle.json',
    },
  },
  // for production builds
  webpack: (config: { resolve: { alias: Record<string, string> } }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/icons/bundle.json': './src/lib/icons/bundle.json',
    }
    return config
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
