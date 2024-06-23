/**
 * @file src/providers/bottom-bar.provider.tsx
 * @description bottom bar store provider
 */
'use client'

import type { BottomBarStore } from '@/stores/bottom-bar.store'
import { createBottomBarStore, initBottomBarStore } from '@/stores/bottom-bar.store'
import { createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'

export type BottomBarStoreApi = ReturnType<typeof createBottomBarStore>

export const BottomBarStoreContext = createContext<BottomBarStoreApi | undefined>(undefined)

export interface BottomBarStoreProviderProps {
    children: React.ReactNode
}

export const BottomBarStoreProvider = ({ children }: BottomBarStoreProviderProps) => {
    const storeRef = useRef<BottomBarStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createBottomBarStore(initBottomBarStore())
    }

    return <BottomBarStoreContext.Provider value={storeRef.current}>{children}</BottomBarStoreContext.Provider>
}

export const useBottomBarStore = <T,>(selector: (store: BottomBarStore) => T): T => {
    const bottomBarStoreContext = useContext(BottomBarStoreContext)

    if (!bottomBarStoreContext) {
        throw new Error(`useBottomBarStore must be used within BottomBarStoreProvider`)
    }

    return useStore(bottomBarStoreContext, selector)
}
