/**
 * @file src/stores/pool.store.ts
 * @description pool store provider
 */

import { combinePoolData } from '@/components/pools/combine-pool-data'
import { fetchPools, fetchUserPools } from '@/lib/hooks/use-pools'
import { Address } from 'viem'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface PoolDraft {
    image: string
    name: string
    hostName: string
    coHosts: string[]
    dateRange: { start: string; end: string }
    description: string
    price: string
    softCap: string
    rulesUrl: string
}

interface PoolStoreState {
    pools: PoolFrontend[]
    draftPool: PoolDraft | null
    isLoading: boolean
    error: Error | null
    userAddress: Address | null
}

type PoolStoreActions = {
    setPools: (pools: PoolFrontend[]) => void
    setDraftPool: (draft: PoolDraft | null) => void
    setError: (error: Error | null) => void
    setUserAddress: (address: Address | null) => void
    loadPools: () => Promise<void>
    loadUserPools: (address: Address) => Promise<void>
    updatePoolsWithContractData: (contractPools: PoolFromContract[]) => void
}

export const usePoolStore = create<PoolStoreState & PoolStoreActions>()(
    // devtools is used in conjuntion with redux devtools chrome extension
    devtools(
        persist(
            (set, get) => ({
                pools: [],
                draftPool: null,
                isLoading: false,
                error: null,
                userAddress: null,
                setPools: (pools: PoolFrontend[]) => set({ pools, isLoading: false }),
                setDraftPool: (draft: PoolDraft | null) => set({ draftPool: draft }),
                setError: (error: Error | null) => set({ error, isLoading: false }),
                setUserAddress: (address: Address | null) => set({ userAddress: address }),
                loadPools: async () => {
                    set({ isLoading: true })
                    try {
                        const pools = await fetchPools()
                        set({ pools, isLoading: false })
                    } catch (error) {
                        set({ error: error as Error, isLoading: false })
                    }
                },
                loadUserPools: async (address: Address) => {
                    set({ isLoading: true })
                    try {
                        const userPools = await fetchUserPools(address)
                        set(state => ({
                            pools: state.pools.map(pool => ({
                                ...pool,
                                isUserPool: userPools.some(userPool => userPool.id === pool.id),
                            })),
                            isLoading: false,
                        }))
                    } catch (error) {
                        set({ error: error as Error, isLoading: false })
                    }
                },
                updatePoolsWithContractData: (contractPools: PoolFromContract[]) => {
                    const { pools } = get()
                    const updatedPools = combinePoolData(contractPools, pools)
                    set({ pools: updatedPools })
                },
            }),
            {
                name: 'pool-storage',
                // (optional) by default, 'localStorage' is used
                // storage: createJSONStorage(() => sessionStorage),
            },
        ),
    ),
)
