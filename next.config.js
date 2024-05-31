/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
	disable: process.env.NODE_ENV === 'development',
	dest: 'public',
	register: true,
	skipWaiting: true,
})

module.exports = withPWA({
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.supabase.co',
			},
		],
	},
})
