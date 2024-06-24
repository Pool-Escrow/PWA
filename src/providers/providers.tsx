/**
 * @file src/providers/providers.tsx
 * @description the main providers for the application
 */
'use client'

import { Toaster } from '@/components/ui/toaster'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { BottomBarStoreProvider } from './bottom-bar.provider'
import { queryClient as getQueryClient, privy, wagmi } from './configs'
import { MyPoolsTabStoreProvider } from './my-pools.provider'

export default function Providers({ children }: React.PropsWithChildren) {
    const queryClient = getQueryClient()

    return (
        <PrivyProvider {...privy}>
            <PersistQueryClientProvider {...queryClient}>
                <WagmiProvider {...wagmi}>
                    <BottomBarStoreProvider>
                        <MyPoolsTabStoreProvider>{children}</MyPoolsTabStoreProvider>
                    </BottomBarStoreProvider>
                    <Toaster position='top-center' />
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </WagmiProvider>
            </PersistQueryClientProvider>
        </PrivyProvider>
    )
}
