// src/app/pwa/_client/stores/settings.slice.ts

import { MyPoolsTab } from '@/app/(pages)/my-pools/_components/my-pools.tabs.config'
import { StateCreator } from 'zustand'

export interface SettingsState {
    bottomBarContent: React.ReactNode | null
    myPoolsTab: MyPoolsTab['id']
    transactionInProgress: boolean
    isRouting: boolean
}

export interface SettingsActions {
    setBottomBarContent: (content: React.ReactNode | null) => void
    setMyPoolsTab: (tab: MyPoolsTab['id']) => void
    setTransactionInProgress: (open: boolean) => void
    setIsRouting: (isRouting: boolean) => void
}

export type SettingsSlice = SettingsState & SettingsActions

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = set => ({
    bottomBarContent: null,
    myPoolsTab: 'upcoming',
    transactionInProgress: false,
    isRouting: false,
    setBottomBarContent: (content: React.ReactNode | null) => set({ bottomBarContent: content }),
    setMyPoolsTab: (tab: MyPoolsTab['id']) => set({ myPoolsTab: tab }),
    setTransactionInProgress: (open: boolean) => set({ transactionInProgress: open }),
    setIsRouting: (isPageRouting: boolean) => set({ isRouting: isPageRouting }),
})
