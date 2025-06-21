'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { cookieToInitialState } from 'wagmi'
import { AppStoreProvider } from './app-store.provider'
import privy from './configs/privy.config'
import { getConfig } from './configs/wagmi.config'
import ConfiguredQueryProvider from './query'
import privy from './configs/privy.config'

type Props = {
    children: React.ReactNode
    cookie: string | null
}

export default function Providers({ children, cookie }: Props) {
    const config = getConfig()
    const initialState = cookieToInitialState(config, cookie)

    return (
        <PrivyProvider {...privy}>
            <ConfiguredQueryProvider>
                <WagmiProvider config={config} initialState={initialState}>
                    <AppStoreProvider>{children}</AppStoreProvider>
                    <Toaster position='top-center' visibleToasts={1} />
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </WagmiProvider>
            </ConfiguredQueryProvider>
        </PrivyProvider>
    )
}
