import { inter } from '@/lib/utils/fonts'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import './global.css'
// import InstallPromptDrawer from '@/components/install-prompt-drawer'

export { metadata, viewport } from './_lib/utils/metadata'

export const revalidate = 3600
export const fetchCache = 'force-cache'

type Props = React.PropsWithChildren<LayoutWithSlots<'topbar' | 'bottombar' | 'modal' | 'transactionprogressmodal'>>

const Providers = dynamic(() => import('./_client/providers/providers'), {
    ssr: true,
    loading: () => <div>Loading providers...</div>,
})

const MainWrapper = dynamic(() => import('./_components/main-wrapper'))
const LayoutGroup = dynamic(() => import('motion/react').then(mod => mod.LayoutGroup))

export default async function RootLayout({ children, bottombar, modal, transactionprogressmodal }: Props) {
    const headersList = await headers()
    const wagmiCookie = headersList.get('cookie')

    return (
        <html lang='en' className={inter.variable}>
            <body className='flex min-h-dvh flex-col antialiased'>
                <Suspense fallback={<div>Loading app...</div>}>
                    <Providers cookie={wagmiCookie}>
                        <LayoutGroup>
                            <MainWrapper>{children}</MainWrapper>
                        </LayoutGroup>
                        {/* <InstallPromptDrawer /> */}
                        {transactionprogressmodal}
                        {modal}
                        {bottombar}
                    </Providers>
                </Suspense>
            </body>
        </html>
    )
}
