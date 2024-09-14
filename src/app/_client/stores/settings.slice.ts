// src/app/pwa/_client/stores/settings.slice.ts

import { MyPoolsTab } from '@/app/(pages)/my-pools/_components/my-pools.tabs.config'
import { StateCreator } from 'zustand'

export interface SettingsState {
    topBarTitle: string | null
    bottomBarContent: React.ReactNode | null
    myPoolsTab: MyPoolsTab['id']
}

export interface SettingsActions {
    setTopBarTitle: (title: string | null) => void
    setBottomBarContent: (content: React.ReactNode | null) => void
    setMyPoolsTab: (tab: MyPoolsTab['id']) => void
}

export type SettingsSlice = SettingsState & SettingsActions

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = set => ({
    topBarTitle: null,
    bottomBarContent: null,
    myPoolsTab: 'upcoming',
    setTopBarTitle: (title: string | null) => set({ topBarTitle: title }),
    setBottomBarContent: (content: React.ReactNode | null) => set({ bottomBarContent: content }),
    setMyPoolsTab: (tab: MyPoolsTab['id']) => set({ myPoolsTab: tab }),
})
