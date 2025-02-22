// @ts-check

import { generateCspString } from './csp.mjs'

/** @type {import('next').NextConfig['headers']} */
export const getSecurityHeaders = () =>
    Promise.resolve([
        {
            source: '/(.*)',
            headers: [
                {
                    key: 'Content-Security-Policy',
                    value: generateCspString(),
                },
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                {
                    key: 'Permissions-Policy',
                    value: 'camera=self',
                },
                {
                    key: 'Cross-Origin-Opener-Policy',
                    value: 'unsafe-none',
                },
                {
                    key: 'Access-Control-Allow-Origin',
                    value: '*',
                },
                {
                    key: 'Access-Control-Allow-Methods',
                    value: 'GET, POST, PUT, DELETE, OPTIONS',
                },
                {
                    key: 'Access-Control-Allow-Headers',
                    value: 'X-Requested-With, Content-Type, Authorization',
                },
            ],
        },
        {
            source: '/_next/static/css/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
                {
                    key: 'Link',
                    value: '</_next/static/css/:path*>; rel=preload; as=style',
                },
            ],
        },
        {
            source: '/_next/static/media/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
                {
                    key: 'Link',
                    value: '</_next/static/media/:path*>; rel=preload; as=font; crossorigin=anonymous; type=font/woff2',
                },
            ],
        },
        {
            source: '/:all*(svg|jpg|png)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
    ])
