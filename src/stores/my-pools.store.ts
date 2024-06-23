// src/stores/my-pools.store.ts
import type { MyPoolsTab } from '@/components/my-pools/my-pools.tabs.config'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

type MyPoolsTabState = {
    currentTab: MyPoolsTab['id']
}

type MyPoolsTabActions = {
    setCurrentTab: (tab: MyPoolsTab['id']) => void
}

type MyPoolsTabStore = MyPoolsTabState & MyPoolsTabActions

const defaultInitState: MyPoolsTabState = {
    currentTab: 'upcoming', // default tab
}

const createMyPoolsTabStore = (initState: MyPoolsTabState = defaultInitState) => {
    return createStore<MyPoolsTabStore>()(
        persist(
            set => ({
                ...initState,
                setCurrentTab: tab => set({ currentTab: tab }),
            }),
            {
                name: 'my-pools-tab-storage',
                storage: createJSONStorage(() => localStorage),
            },
        ),
    )
}

export { createMyPoolsTabStore, defaultInitState }
export type { MyPoolsTabActions, MyPoolsTabState, MyPoolsTabStore }
