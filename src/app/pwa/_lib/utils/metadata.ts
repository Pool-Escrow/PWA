import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
    maximumScale: 1,
    minimumScale: 1,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#fff' },
        { media: '(prefers-color-scheme: light)', color: '#18181b' },
    ],
}

const APP_NAME = 'Pool'
const APP_DEFAULT_TITLE = 'Pool App'
const APP_TITLE_TEMPLATE = '%s - Pool'
const APP_DESCRIPTION = 'Pool Party! 🏖️'

export const metadata: Metadata = {
    ...(process.env.NODE_ENV === 'production' ? { metadataBase: new URL('https://poolparty.cc') } : {}),
    icons: {
        icon: '/app/assets/favicon.png',
        apple: '/app/assets/icon-maskable-512.png',
    },
    // TODO: correct this
    // manifest: '/pwa/manifest.json',
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: 'summary',
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
}
