// src/app/pwa/_client/stores/app.store.ts

import { createStore } from 'zustand/vanilla'
import { createSettingsSlice, SettingsSlice, SettingsState } from './settings.slice'

export type AppState = SettingsState

export type AppActions = Omit<SettingsSlice, keyof SettingsState>

export type AppStore = AppState & AppActions

export const initAppStore = (): AppState => ({
    // Settings state
    bottomBarContent: null,
    myPoolsTab: 'upcoming',
    transactionInProgress: false,
    isPageTransitioning: false,
})

export const defaultInitState: AppState = initAppStore()

export const createAppStore = (initState: AppState = defaultInitState) => {
    return createStore<AppStore>()((set, get, store) => ({
        ...initState,
        ...createSettingsSlice(set, get, store),
    }))
}
