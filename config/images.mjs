// @ts-check

/** @type {import('next').NextConfig['images']} */
export const imageConfig = {
    remotePatterns: [
        { protocol: 'https', hostname: '*.supabase.co' },
        { protocol: 'https', hostname: 'cdn.privy.io' },
        { protocol: 'https', hostname: 'static.okx.com' },
        { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
