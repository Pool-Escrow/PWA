import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle Privy's cross-origin policy checks
  if (request.nextUrl.pathname.includes('checkCrossOriginOpenerPolicy')) {
    return new NextResponse('// Cross-origin policy check handled', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
    })
  }

  // Handle SVG sprite with cache-busting headers
  if (request.nextUrl.pathname === '/icons/sprite.svg') {
    const response = NextResponse.next()

    // Force cache invalidation for SVG sprites
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    // Add ETag based on file modification time for better cache control
    const etag = `"sprite-${Date.now()}"`
    response.headers.set('ETag', etag)

    return response
  }

  // Skip CSP for proxy routes
  if (request.nextUrl.pathname.startsWith('/api/proxy/')) {
    return NextResponse.next()
  }

  const isDev = process.env.NODE_ENV === 'development'
  const isTest = process.env.NEXT_DISABLE_CSP === 'true'

  // Define external domains
  const privyDomains = 'https://auth.privy.io'
  const walletConnectDomains
        = 'https://pulse.walletconnect.org https://rpc.walletconnect.org https://relay.walletconnect.org https://registry.walletconnect.org https://explorer.walletconnect.org https://explorer-api.walletconnect.com'
  const web3ModalDomains = 'https://api.web3modal.org https://cloud.web3modal.org'
  const googleFonts = 'https://fonts.googleapis.com https://fonts.gstatic.com'
  const goldSkyDomains = 'https://api.goldsky.com'

  // Common CSS hashes for Next.js inline styles
  // const commonStyleHashes = Object.values(COMMON_NEXTJS_STYLE_HASHES).join(' ')

  // Very permissive CSP for tests, more permissive for development, strict for production
  const cspHeader = isTest
    ? `
    default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;
    style-src 'self' 'unsafe-inline' 'unsafe-hashes' data: blob: *;
    img-src 'self' 'unsafe-inline' data: blob: *;
    font-src 'self' 'unsafe-inline' data: blob: *;
    connect-src 'self' 'unsafe-inline' data: blob: *;
    frame-src 'self' 'unsafe-inline' data: blob: *;
    worker-src 'self' 'unsafe-inline' data: blob: *;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`
    : isDev
      ? `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' ${privyDomains} ${walletConnectDomains} ${web3ModalDomains};
    style-src 'self' 'unsafe-inline' ${privyDomains} data: 'unsafe-hashes' ${googleFonts};
    img-src 'self' blob: data: https: http: ${privyDomains};
    font-src 'self' data: ${privyDomains} ${googleFonts};
    connect-src 'self' ${privyDomains} ${walletConnectDomains} ${web3ModalDomains} ${goldSkyDomains} wss: ws: localhost:* 127.0.0.1:*;
    frame-src 'self' ${privyDomains};
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`
      : `
    default-src 'self';
    script-src 'self' 'strict-dynamic' ${privyDomains};
    style-src 'self' ${privyDomains} 'unsafe-hashes' ${googleFonts};
    img-src 'self' blob: data: ${privyDomains};
    font-src 'self' ${privyDomains} ${googleFonts};
    connect-src 'self' ${privyDomains} ${walletConnectDomains} ${web3ModalDomains} ${goldSkyDomains};
    frame-src 'self' ${privyDomains};
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')

  return response
}

export const config = {
  matcher: [
    /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }],
    },
  ],
}
