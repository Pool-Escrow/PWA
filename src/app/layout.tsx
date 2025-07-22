import './global.css'

import MainWrapper from '@/components/main-wrapper'
import { inter } from '@/lib/utils/fonts'
import { Providers } from '@/providers'
import { headers } from 'next/headers'
// import InstallPromptDrawer from '@/components/install-prompt-drawer'

export { metadata, viewport } from '@/lib/utils/metadata'

type Props = React.PropsWithChildren<LayoutWithSlots<'topbar' | 'bottombar' | 'modal' | 'transactionprogressmodal'>>

export default function RootLayout({ children, bottombar, modal, transactionprogressmodal }: Props) {
    const wagmiCookie = headers().get('cookie')

    return (
        <html lang='en' className={inter.variable}>
            <body className='flex min-h-dvh flex-col antialiased'>
                <Providers cookie={wagmiCookie}>
                    <MainWrapper>{children}</MainWrapper>
                    {/* {modal} */}
                    {/* {bottombar} */}
                    {/* {transactionprogressmodal} */}
                    {/* <InstallPromptDrawer /> */}
                    {/* <DebugOverlay /> */}
                </Providers>
            </body>
        </html>
    )
}
