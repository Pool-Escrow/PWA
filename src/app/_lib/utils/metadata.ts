import type { Metadata as NextMetadata, Viewport } from 'next'

export const viewport: Viewport = {
    userScalable: false,
    viewportFit: 'cover',
    initialScale: 1,
    width: 'device-width',
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#4078F4' },
        { media: '(prefers-color-scheme: light)', color: '#4078F4' },
    ],
}

const APP_NAME = 'Pool'
const APP_DEFAULT_TITLE = 'Pool App'
const APP_TITLE_TEMPLATE = '%s - Pool'
const APP_DESCRIPTION = 'Pool Party! 🏖️'

interface CustomMetadata extends NextMetadata {
    twitter: {
        card: string
        title: {
            default: string
            template: string
        }
        description: string
        site: string
        creator: string
    }
}

export const metadata: CustomMetadata = {
    ...(process.env.NODE_ENV === 'production' ? { metadataBase: new URL('https://app.poolparty.cc') } : {}),
    icons: {
        icon: '/app/assets/favicon.png',
        apple: '/app/assets/icon-maskable-512.png',
    },
    manifest: process.env.NODE_ENV === 'production' ? '/manifest.json' : undefined,
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: APP_DEFAULT_TITLE,
        startupImage: [
            {
                url: '/splash_screens/iPhone_16_Pro_Max_portrait.png',
                media: 'screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_16_Pro_portrait.png',
                media: 'screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png',
                media: 'screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png',
                media: 'screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png',
                media: 'screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png',
                media: 'screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png',
                media: 'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png',
                media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_11__iPhone_XR_portrait.png',
                media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png',
                media: 'screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png',
                media: 'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png',
                media: 'screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/13__iPad_Pro_M4_portrait.png',
                media: 'screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/12.9__iPad_Pro_portrait.png',
                media: 'screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/11__iPad_Pro_M4_portrait.png',
                media: 'screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png',
                media: 'screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/10.9__iPad_Air_portrait.png',
                media: 'screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/10.5__iPad_Air_portrait.png',
                media: 'screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/10.2__iPad_portrait.png',
                media: 'screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png',
                media: 'screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
            {
                url: '/splash_screens/8.3__iPad_Mini_portrait.png',
                media: 'screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
            },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    themeColor: '#4078F4',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        viewportFit: 'cover',
        userScalable: false,
    },
    openGraph: {
        type: 'website',
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
        images: [
            {
                url: '/app/assets/icon-maskable-512.png',
                width: 512,
                height: 512,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@poolpartycc',
        creator: '@poolpartycc',
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
}
