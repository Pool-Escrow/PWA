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
