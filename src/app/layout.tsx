import './_styles/app-styles.css'

import { Providers } from './_client/providers'
import MainWrapper from './_components/main-wrapper'
import { inter } from '@/lib/utils/fonts'
import { headers } from 'next/headers'
// import InstallPromptDrawer from '@/components/install-prompt-drawer'

export { metadata, viewport } from './_lib/utils/metadata'

type Props = React.PropsWithChildren<LayoutWithSlots<'topbar' | 'bottombar' | 'modal' | 'transactionprogressmodal'>>

export default function RootLayout({ children, bottombar, topbar, modal, transactionprogressmodal }: Props) {
    const wagmiCookie = headers().get('cookie')

    return (
        <html lang='en'>
            <head />
            <body className={`${inter.variable} flex min-h-dvh flex-col`}>
                <Providers cookie={wagmiCookie}>
                    {topbar}
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
