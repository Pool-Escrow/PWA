/**
 * @file src/stores/pool.store.ts
 * @description pool store provider
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface PoolStoreState {
    pools: Pool[]
    isLoading: boolean
    error: Error | null
}

type PoolStoreActions = {
    setPools: (pools: Pool[]) => void
    setError: (error: Error | null) => void
}

export const usePoolStore = create<PoolStoreState & PoolStoreActions>()(
    // devtools is used in conjuntion with redux devtools chrome extension
    devtools(
        persist(
            set => ({
                pools: [],
                isLoading: true,
                error: null,
                setPools: (pools: Pool[]) => set({ pools, isLoading: false }),
                setError: (error: Error | null) => set({ error, isLoading: false }),
            }),
            {
                name: 'pool-storage',
                // (optional) by default, 'localStorage' is used
                // storage: createJSONStorage(() => sessionStorage),
            },
        ),
    ),
)
