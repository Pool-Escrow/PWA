import './global.css'

import { inter } from '@/lib/utils/fonts'
import { headers } from 'next/headers'
import { Providers } from './_client/providers/index'
import MainWrapper from './_components/main-wrapper'
// import InstallPromptDrawer from '@/components/install-prompt-drawer'

export { metadata, viewport } from './_lib/utils/metadata'

type Props = React.PropsWithChildren<LayoutWithSlots<'topbar' | 'bottombar' | 'modal' | 'transactionprogressmodal'>>

export default function RootLayout({ children, bottombar, modal, transactionprogressmodal }: Props) {
    const wagmiCookie = headers().get('cookie')

    return (
        <html lang='en' className={inter.variable}>
            <head />
            <body className='flex min-h-dvh flex-col antialiased'>
                <Providers cookie={wagmiCookie}>
                    <MainWrapper>{children}</MainWrapper>
                    {modal}
                    {bottombar}
                    {transactionprogressmodal}
                    {/* <InstallPromptDrawer /> */}
                </Providers>
            </body>
        </html>
    )
}
