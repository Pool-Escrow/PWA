'use client'

import { Toaster } from '@/components/ui/toaster'
import { PrivyProvider } from '@privy-io/react-auth'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { WagmiProvider } from 'wagmi'
import { queryClient as getQueryClient, privy, wagmi } from './configs'

export default function Providers({ children }: React.PropsWithChildren) {
    const queryClient = getQueryClient()

    return (
        <PrivyProvider {...privy}>
            <WagmiProvider {...wagmi}>
                <PersistQueryClientProvider {...queryClient}>
                    <HydrationBoundary state={dehydrate(queryClient.client)}>{children}</HydrationBoundary>
                    <Toaster />
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </PersistQueryClientProvider>
            </WagmiProvider>
        </PrivyProvider>
    )
}
