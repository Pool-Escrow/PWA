import { Head, Html, Main, NextScript } from 'next/document'

import fonts from '@/utils/fonts'

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<meta charSet='utf-8' />
				<link rel='icon' type='image/png' href='/images/favicon.png' />
				<meta
					name='theme-color'
					content='#18181b'
					media='(prefers-color-scheme: light)'
				/>
				<meta name='theme-color' content='#f4f4f5' />
				<link rel='apple-touch-icon' href='/images/icon-maskable-512.png' />
				<link rel='manifest' href='/manifest.json' />
			</Head>
			<body className={fonts.inter.className}>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
