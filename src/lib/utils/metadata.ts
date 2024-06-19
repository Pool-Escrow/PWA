import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
    maximumScale: 5,
    minimumScale: 1,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#fff' },
        { media: '(prefers-color-scheme: light)', color: '#18181b' },
    ],
}

export const metadata: Metadata = {
    icons: {
        icon: '/images/favicon.png',
        apple: '/images/icon-maskable-512.png',
    },
    manifest: '/manifest.json',
}
