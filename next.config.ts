import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

import './src/lib/env/client'
import './src/lib/env/server'

// Helper function to clean CSP string
const cleanCSP = (csp: string) => csp.replace(/\s+/g, ' ').trim()

// Environment-specific CSPs: dev is looser for Next.js tooling; prod is stricter
const cspDev = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://auth.privy.io https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://explorer-api.walletconnect.com;
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
  frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
  connect-src 'self' https://auth.privy.io ws: wss: https://*.rpc.privy.systems https://explorer-api.walletconnect.com https://api.web3modal.org https://pulse.walletconnect.org;
  worker-src 'self';
  manifest-src 'self'
`

const cspProd = `
  default-src 'self';
  script-src 'self' https://auth.privy.io https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://explorer-api.walletconnect.com;
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
  frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
  connect-src 'self' https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com https://api.web3modal.org https://pulse.walletconnect.org;
  worker-src 'self';
  manifest-src 'self'
`

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
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cleanCSP(process.env.NODE_ENV === 'development' ? cspDev : cspProd),
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
