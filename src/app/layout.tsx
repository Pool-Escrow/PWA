import '@/styles/globals.css'

import Providers from '@/components/shared/providers'
import { comfortaa, inter } from '@/lib/utils/fonts'

export { metadata, viewport } from '@/lib/utils/metadata'

export default function RootLayout({ top, content, bottom }: LayoutWithSlots<'top' | 'content' | 'bottom'>) {
    return (
        <html lang='en'>
            <head />
            <body className={`${(inter.variable, comfortaa.variable)}`}>
                <Providers>
                    {top}
                    <main>{content}</main>
                    {bottom}
                </Providers>
            </body>
        </html>
    )
}
