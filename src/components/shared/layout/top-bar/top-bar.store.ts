import { create } from 'zustand'

export type TopBarState = {
	[K in 'left' | 'center' | 'right']?: React.ReactNode | null
}

export type TopBarActions = {
	updateElements: (elements: TopBarState) => void
}

export type TopBarStore = TopBarState & TopBarActions

export const defaultTopBarState: TopBarState = {
	left: null,
	center: null,
	right: null,
}

const useTopBarStore = create<TopBarStore>((set) => ({
	...defaultTopBarState,
	updateElements: (elements) => set({ ...elements }),
}))

export default useTopBarStore
