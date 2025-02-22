'use client'

import { WagmiProvider } from '@privy-io/wagmi'
import dynamic from 'next/dynamic'
import { Toaster } from 'sonner'
import { cookieToInitialState } from 'wagmi'
import { AppStoreProvider } from './app-store.provider'
import privy from './configs/privy.config'
import { getConfig } from './configs/wagmi.config'

// Lazy load heavy providers
const PrivyProvider = dynamic(() => import('@privy-io/react-auth').then(mod => mod.PrivyProvider), {
    ssr: false, // Privy doesn't need SSR
})

const ReactQueryDevtools = dynamic(
    () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
    { ssr: false }, //DevTools don't need SSR
)

const ConfiguredQueryProvider = dynamic(() => import('./query'))

type Props = {
    children: React.ReactNode
    cookie: string | null
}

// Separate the providers that don't need initial state
const BaseProviders = ({ children }: { children: React.ReactNode }) => (
    <ConfiguredQueryProvider>
        {children}
        <Toaster position='top-center' visibleToasts={1} />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </ConfiguredQueryProvider>
)

// Providers that need initial state
export default function Providers({ children, cookie }: Props) {
    const config = getConfig()
    const initialState = cookieToInitialState(config, cookie)

    return (
        <PrivyProvider {...privy}>
            <BaseProviders>
                <WagmiProvider config={config} initialState={initialState}>
                    <AppStoreProvider>{children}</AppStoreProvider>
                </WagmiProvider>
            </BaseProviders>
        </PrivyProvider>
    )
}
