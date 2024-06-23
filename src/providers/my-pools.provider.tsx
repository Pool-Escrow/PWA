// src/providers/my-pools-tab.provider.tsx

'use client'

import type { MyPoolsTabStore } from '@/stores/my-pools.store'
import { createMyPoolsTabStore } from '@/stores/my-pools.store'
import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'

export type MyPoolsTabStoreApi = ReturnType<typeof createMyPoolsTabStore>

export const MyPoolsTabStoreContext = createContext<MyPoolsTabStoreApi | undefined>(undefined)

export interface MyPoolsTabStoreProviderProps {
    children: React.ReactNode
}

export const MyPoolsTabStoreProvider = ({ children }: MyPoolsTabStoreProviderProps) => {
    const storeRef = useRef<MyPoolsTabStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createMyPoolsTabStore()
    }

    return <MyPoolsTabStoreContext.Provider value={storeRef.current}>{children}</MyPoolsTabStoreContext.Provider>
}

export const useMyPoolsTabStore = <T,>(selector: (store: MyPoolsTabStore) => T): T => {
    const myPoolsTabStoreContext = useContext(MyPoolsTabStoreContext)

    if (!myPoolsTabStoreContext) {
        throw new Error(`useMyPoolsTabStore must be used within MyPoolsTabStoreProvider`)
    }

    return useStore(myPoolsTabStoreContext, selector)
}
