'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useReducer } from 'react'
import { initialSwapState, swapReducer } from '../reducers/swapReducer'
import type { SwapAction, SwapState } from '../types'

interface SwapContextType {
    state: SwapState
    dispatch: React.Dispatch<SwapAction>
}

const SwapContext = createContext<SwapContextType | undefined>(undefined)

export function SwapProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(swapReducer, initialSwapState)

    return <SwapContext.Provider value={{ state, dispatch }}>{children}</SwapContext.Provider>
}

export function useSwapContext() {
    const context = useContext(SwapContext)
    if (context === undefined) {
        throw new Error('useSwapContext must be used within a SwapProvider')
    }
    return context
}
