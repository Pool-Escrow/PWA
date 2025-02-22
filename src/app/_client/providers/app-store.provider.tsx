'use client'

import { observer } from '@legendapp/state/react'
import type { ReactNode } from 'react'

export interface AppStoreProviderProps {
    children: ReactNode
}

// Now we use observer to make the component reactive
export const AppStoreProvider = observer(({ children }: AppStoreProviderProps) => {
    return children
})
