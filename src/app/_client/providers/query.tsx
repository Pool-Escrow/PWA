'use client'
// QueryClientProvider relies on useContext under the hood. It needs to be a client component.

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
    return new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }) // 1 minute
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    // Server: always make a new query client
    if (isServer) {
        return makeQueryClient()
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

export default function ConfiguredQueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
