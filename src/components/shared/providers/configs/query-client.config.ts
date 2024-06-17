'use client'
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client'
import { noopStorage } from '@wagmi/core'
import { hashFn } from '@wagmi/core/query'
import { deserialize, serialize } from 'wagmi'

const storage =
	typeof window !== 'undefined' && window.localStorage
		? window.localStorage
		: noopStorage

let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 1_000 * 60 * 60 * 24, // 24 hours
				networkMode: 'offlineFirst',
				refetchOnWindowFocus: false,
				retry: 0,
				queryKeyHashFn: hashFn,
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000, // 1 minute
			},
			mutations: { networkMode: 'offlineFirst' },
		},
	})
}

function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
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

const persister = createSyncStoragePersister({
	key: 'pool-pwa.cache',
	serialize,
	storage,
	deserialize,
})

export default function getQueryClientConfig(): PersistQueryClientProviderProps {
	return {
		client: getQueryClient(),
		persistOptions: { persister },
	}
}
