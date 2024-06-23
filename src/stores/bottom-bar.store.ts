// src/stores/bottom-bar.store.ts
import { createStore } from 'zustand/vanilla'

type BottomBarState = {
    isVisible: boolean
    content: React.ReactNode | null
}

type BottomBarActions = {
    showBar: () => void
    hideBar: () => void
    setContent: (content: React.ReactNode) => void
}

type BottomBarStore = BottomBarState & BottomBarActions

const defaultInitState: BottomBarState = {
    isVisible: false,
    content: null,
}

export const initBottomBarStore = (): BottomBarState => defaultInitState

const createBottomBarStore = (initState: BottomBarState = defaultInitState) => {
    return createStore<BottomBarStore>()(set => ({
        ...initState,
        showBar: () => {
            set({ isVisible: true })
        },
        hideBar: () => {
            set({ isVisible: false })
        },
        setContent: content => {
            set({ content })
        },
    }))
}

export { createBottomBarStore, defaultInitState }
export type { BottomBarActions, BottomBarState, BottomBarStore }
