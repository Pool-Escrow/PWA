import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

import './src/lib/env/client'
import './src/lib/env/server'

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },

  async headers() {
    return [
      {
        source: '/icons/sprite.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
