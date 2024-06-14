import { Comfortaa, Inter } from 'next/font/google'

const comfortaa = Comfortaa({
	subsets: ['latin'],
	variable: '--font-logo',
})

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-sans',
})

const fonts = { comfortaa, inter }

export default fonts
