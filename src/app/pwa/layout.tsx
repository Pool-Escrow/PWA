// src/app/layout.tsx

import '@/styles/globals.css'

import { comfortaa, inter } from '@/lib/utils/fonts'
import { Providers } from '@/providers'
import Script from 'next/script'

export { metadata, viewport } from '@/lib/utils/metadata'

export default function RootLayout({ top, content, bottom }: LayoutWithSlots<'top' | 'content' | 'bottom'>) {
    return (
        <html lang='en'>
            <head />
            <Script src="https://js.stripe.com/v3/"></Script>
            <Script src="https://crypto-js.stripe.com/crypto-onramp-outer.js"></Script>
            <body className={`${(inter.variable, comfortaa.variable)}`}>
                <Providers>
                    {top}
                    {/* <PageTransitionEffect> */}
                    {/* <Template> */}
                    <main className='mx-auto flex size-full w-dvw max-w-screen-md flex-1 flex-col pt-safe-offset-24 mb-safe-or-24 px-safe-or-6'>
                        {content}
                    </main>
                    {/* </Template> */}
                    {/* </PageTransitionEffect> */}
                    {bottom}
                </Providers>
            </body>
        </html>
    )
}
