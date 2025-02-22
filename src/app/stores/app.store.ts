// src/app/pwa/_client/stores/app.store.ts

import type { MyPoolsTab } from '@/app/(pages)/my-pools/_components/my-pools.tabs.config'
import { observable } from '@legendapp/state'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'
import { configureSynced, syncObservable } from '@legendapp/state/sync'
import type { ReactNode } from 'react'

// Definir la estructura del store
export interface AppState {
    settings: {
        bottomBarContent: ReactNode | null
        myPoolsTab: MyPoolsTab['id']
        transactionInProgress: boolean
        isRouting: boolean
    }
}

// Valores iniciales
const initialState: AppState = {
    settings: {
        bottomBarContent: null,
        myPoolsTab: 'active',
        transactionInProgress: false,
        isRouting: false,
    },
}

// Crear el store observable
export const appStore$ = observable(initialState)

// Configurar persistencia local
const syncPlugin = configureSynced({
    persist: {
        plugin: ObservablePersistLocalStorage,
    },
})

// Aplicar persistencia solo para myPoolsTab
syncObservable(
    appStore$.settings.myPoolsTab,
    syncPlugin({
        persist: {
            name: 'app-store-myPoolsTab',
        },
    }),
)

// Acciones del store
export const appActions = {
    setBottomBarContent: (content: ReactNode | null) => {
        appStore$.settings.bottomBarContent.set(content)
    },
    setMyPoolsTab: (tab: MyPoolsTab['id']) => {
        appStore$.settings.myPoolsTab.set(tab)
    },
    setTransactionInProgress: (inProgress: boolean) => {
        appStore$.settings.transactionInProgress.set(inProgress)
    },
    setIsRouting: (isRouting: boolean) => {
        appStore$.settings.isRouting.set(isRouting)
    },
}
