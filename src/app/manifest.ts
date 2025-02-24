import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Pool App',
        short_name: 'Pool',
        description: 'Pool Party! 🏖️',
        categories: ['events', 'fun', 'games', 'lifestyle', 'social'],
        lang: 'en',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        display_override: ['standalone'],
        background_color: '#12C4E7',
        theme_color: '#4078F4',
        orientation: 'portrait',
        screenshots: [
            {
                src: '/app/images/screenshot-wide.png',
                type: 'image/png',
                sizes: '1024x768',
            },
            {
                src: '/app/images/screenshot-portrait.png',
                type: 'image/png',
                sizes: '768x1024',
            },
        ],
        protocol_handlers: [
            {
                protocol: 'web+pool',
                url: '/?poolId=%s',
            },
        ],
        serviceworker: {
            src: '/sw.js',
            scope: '/',
        },
        icons: [
            {
                src: '/app/assets/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/app/assets/icon-384.png',
                sizes: '384x384',
                type: 'image/png',
            },
            {
                src: '/app/assets/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/app/assets/icon-maskable-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/app/assets/icon-maskable-384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/app/assets/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            // {
            //     name: 'Create New Pool',
            //     short_name: 'New Pool',
            //     description: 'Start a new pool party',
            //     url: '/pool/new',
            //     icons: [{ src: '/app/assets/icon-new-pool.png', sizes: '192x192' }],
            // },
        ],
        prefer_related_applications: false,
    }
}
