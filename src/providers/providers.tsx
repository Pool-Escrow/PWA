/**
 * @file src/providers/providers.tsx
 * @description the main providers for the application
 */
'use client'

import { Toaster } from '@/components/ui/toaster'
import { PrivyProvider } from '@privy-io/react-auth'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { WagmiProvider } from '@privy-io/wagmi'
import { queryClient as getQueryClient, privy, wagmi } from './configs'
import { BottomBarStoreProvider } from './bottom-bar.provider'
import { PoolStoreProvider } from './pool-store.provider'
import { MyPoolsTabStoreProvider } from './my-pools.provider'

export default function Providers({ children }: React.PropsWithChildren) {
    const queryClient = getQueryClient()

    return (
        <PrivyProvider {...privy}>
            <PersistQueryClientProvider {...queryClient}>
                <WagmiProvider {...wagmi}>
                    <HydrationBoundary state={dehydrate(queryClient.client)}>
                        <PoolStoreProvider>
                            <BottomBarStoreProvider>
                                <MyPoolsTabStoreProvider>{children}</MyPoolsTabStoreProvider>
                            </BottomBarStoreProvider>
                        </PoolStoreProvider>
                    </HydrationBoundary>
                    <Toaster position='top-center' />
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </WagmiProvider>
            </PersistQueryClientProvider>
        </PrivyProvider>
    )
}
