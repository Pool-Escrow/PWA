import '@/styles/globals.css'

import Providers from '@/components/shared/providers'
import { comfortaa, inter } from '@/lib/utils/fonts'
import { cn } from '@/lib/utils/tailwind'

export { metadata, viewport } from '@/lib/utils/metadata'

export default function RootLayout({
	top,
	content,
	bottom,
}: LayoutWithSlots<'top' | 'content' | 'bottom'>) {
	return (
		<html lang='en'>
			<head />
			<body
				className={cn(
					'mt-safe-or-5',
					`${(inter.variable, comfortaa.variable)}`,
				)}
			>
				<Providers>
					{top}
					{/* <main className=' pt-top-bar-h pb-bottom-bar-h px-safe sm:pb-0 h-screen'> */}
					<main>{content}</main>
					{bottom}
				</Providers>
			</body>
		</html>
	)
}
