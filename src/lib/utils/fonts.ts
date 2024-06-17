import { Comfortaa, Inter } from 'next/font/google'

const inter = Inter({
	subsets: ['latin'],
	display: 'fallback',
	variable: '--font-body',
})
const comfortaa = Comfortaa({
	subsets: ['latin'],
	display: 'fallback',
	variable: '--font-logo',
})

export { comfortaa, inter }
