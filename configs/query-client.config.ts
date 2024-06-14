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

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1_000 * 60 * 60 * 24, // 24 hours
			networkMode: 'offlineFirst',
			refetchOnWindowFocus: false,
			retry: 0,
			queryKeyHashFn: hashFn,
		},
		mutations: { networkMode: 'offlineFirst' },
	},
})

const persister = createSyncStoragePersister({
	key: 'pool-pwa.cache',
	serialize,
	storage,
	deserialize,
})

export default {
	client: queryClient,
	persistOptions: { persister },
} satisfies PersistQueryClientProviderProps
