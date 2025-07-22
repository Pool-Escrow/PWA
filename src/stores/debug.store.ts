import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RequestCounter {
    component: string
    type: 'useBalance' | 'useReadContract' | 'fetch' | 'other'
    token?: string
    address?: string
    count: number
    lastRequest: string
    stack?: string
}

interface DebugState {
    // Request tracking
    requestCounters: Map<string, RequestCounter>
    totalRequests: number

    // Performance tracking
    renderCount: number
    lastRenderTime: number

    // UI state
    showDebugOverlay: boolean
    debugPosition: { x: number; y: number }

    // Actions
    trackRequest: (component: string, type: RequestCounter['type'], details?: Partial<RequestCounter>) => void
    trackRender: (component: string) => void
    resetCounters: () => void
    toggleDebugOverlay: () => void
    setDebugPosition: (position: { x: number; y: number }) => void
}

export const useDebugStore = create<DebugState>()(
    devtools(
        (set, get) => ({
            requestCounters: new Map(),
            totalRequests: 0,
            renderCount: 0,
            lastRenderTime: Date.now(),
            showDebugOverlay: false,
            debugPosition: { x: 20, y: 100 },

            trackRequest: (component, type, details = {}) => {
                const state = get()
                const key = `${component}-${type}-${details.token || ''}-${details.address || ''}`

                const existing = state.requestCounters.get(key)
                const newCounter: RequestCounter = {
                    component,
                    type,
                    token: details.token,
                    address: details.address,
                    count: (existing?.count || 0) + 1,
                    lastRequest: new Date().toISOString(),
                    stack: details.stack,
                }

                const newCounters = new Map(state.requestCounters)
                newCounters.set(key, newCounter)

                set({
                    requestCounters: newCounters,
                    totalRequests: state.totalRequests + 1,
                })

                // Log in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[DEBUG_STORE] ${component} ${type} request #${newCounter.count}`, {
                        token: details.token,
                        address: details.address?.slice(0, 8) + '...',
                        total: state.totalRequests + 1,
                    })
                }
            },

            trackRender: component => {
                const state = get()
                set({
                    renderCount: state.renderCount + 1,
                    lastRenderTime: Date.now(),
                })

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[DEBUG_STORE] ${component} render #${state.renderCount + 1}`)
                }
            },

            resetCounters: () => {
                set({
                    requestCounters: new Map(),
                    totalRequests: 0,
                    renderCount: 0,
                    lastRenderTime: Date.now(),
                })
            },

            toggleDebugOverlay: () => {
                set(state => ({ showDebugOverlay: !state.showDebugOverlay }))
            },

            setDebugPosition: position => {
                set({ debugPosition: position })
            },
        }),
        { name: 'debug-store' },
    ),
)
