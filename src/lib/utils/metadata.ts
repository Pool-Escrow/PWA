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

const APP_NAME = 'Pool'
const APP_DEFAULT_TITLE = 'Pool App'
const APP_TITLE_TEMPLATE = '%s - Pool'
const APP_DESCRIPTION = 'Pool Party! 🏖️'

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NODE_ENV == 'development' ? 'http://192.168.31.59:3000' : 'https://poolparty.cc'),
    icons: {
        icon: '/images/favicon.png',
        apple: '/images/icon-maskable-512.png',
    },
    manifest: '/manifest.json',
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
