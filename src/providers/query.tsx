'use client'
// QueryClientProvider relies on useContext under the hood. It needs to be a client component.

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { hashFn } from '@wagmi/core/query'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000, // Consider data fresh for 1 minute (blockchain data changes slowly)
                gcTime: 300_000, // Keep in cache for 5 minutes
                refetchOnWindowFocus: false, // Prevent unnecessary refetches on window focus
                refetchOnMount: false, // Don't refetch if we have fresh data
                refetchInterval: false, // DISABLE automatic polling by default
                retry: (failureCount, error) => {
                    // Don't retry on 429 errors (rate limiting) to prevent escalation
                    if (
                        error?.message?.includes('429') ||
                        error?.message?.includes('Too Many Requests') ||
                        error?.message?.includes('rate limit')
                    ) {
                        console.warn('Rate limit detected, not retrying:', error?.message)
                        return false
                    }

                    // Don't retry on 4xx client errors (except 429)
                    if (error?.message?.match(/4[0-9][0-9]/)) {
                        return false
                    }

                    // Retry on network errors and 5xx server errors (max 2 retries)
                    return failureCount < 2
                },
                retryDelay: attemptIndex => {
                    // Exponential backoff with jitter to prevent thundering herd
                    const baseDelay = Math.min(1000 * 2 ** attemptIndex, 10000)
                    const jitter = Math.random() * 1000
                    return baseDelay + jitter
                },
                queryKeyHashFn: hashFn, // Use wagmi's hash function for consistency
            },
            mutations: {
                retry: (failureCount, error) => {
                    // More conservative retry for mutations
                    if (
                        error?.message?.includes('429') ||
                        error?.message?.includes('Too Many Requests') ||
                        error?.message?.includes('rate limit')
                    ) {
                        return false
                    }
                    return failureCount < 1 // Only retry once for mutations
                },
                retryDelay: 2000, // Fixed 2s delay for mutation retries
            },
        },
    });
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

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient()

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
