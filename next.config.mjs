// @ts-check
import bundleAnalyzer from '@next/bundle-analyzer'
import withSerwistInit from '@serwist/next'

const inProduction = process.env.NODE_ENV === 'production'

const withSerwist = withSerwistInit({
	swSrc: 'lib/sw.ts',
	swDest: 'public/sw.js',
	disable: !inProduction,
})

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(
	withSerwist({
		eslint: { ignoreDuringBuilds: true },
		compiler: { removeConsole: inProduction },
		experimental: { typedRoutes: !inProduction },
		reactStrictMode: !inProduction,
		images: {
			remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
		},
	}),
)