import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import Head from 'next/head'

import Providers from '@/components/providers'

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, user-scalable=0, viewport-fit=cover'
				/>
			</Head>

			<Providers>
				<Component {...pageProps} />
			</Providers>
		</>
	)
}
