/**
 * @file src/stores/pool.store.ts
 * @description pool store provider
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { poolsMock } from './data/pools.mock'

export type Pool = {
    id: bigint
    name: string
    status: 'upcoming' | 'live' | 'past'
    startTime: Date
    endTime: Date
}

type PoolStoreState = {
    pools: Pool[]
    isLoading: boolean
    error: { message: string } | null
}

type PoolStoreActions = {
    fetchPools: () => void
}

export const usePoolStore = create<PoolStoreState & PoolStoreActions>()(
    devtools(set => ({
        pools: [],
        isLoading: true,
        error: null,
        fetchPools: () => {
            set({ isLoading: true })
            setTimeout(() => {
                const pools = poolsMock()

                set({ pools, isLoading: false, error: null })
            }, 600)
        },
    })),
)
