import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type PoolFilterMode = 'intersection' | 'contract' | 'database'

export interface DeveloperSettings {
    // Core developer mode toggle
    isEnabled: boolean

    // Chain settings
    defaultChainId: number

    // Network indicator settings
    networkIndicatorExpanded: boolean

    // Debug features visibility
    showDebugOptions: boolean
    showChainSelector: boolean
    showNetworkIndicator: boolean

    // Pool visibility filters
    poolFilterMode: PoolFilterMode
    showContractPoolsOnly: boolean
    showDatabasePoolsOnly: boolean
}

interface DeveloperSettingsState {
    settings: DeveloperSettings
    isHydrated: boolean
}

interface DeveloperSettingsActions {
    toggleDeveloperMode: () => void
    setDefaultChainId: (chainId: number) => void
    setNetworkIndicatorExpanded: (expanded: boolean) => void
    setPoolFilterMode: (mode: PoolFilterMode) => void
    setSetting: <K extends keyof DeveloperSettings>(key: K, value: DeveloperSettings[K]) => void
    resetSettings: () => void
    setHydrated: (hydrated: boolean) => void
}

type DeveloperStore = DeveloperSettingsState & DeveloperSettingsActions

const defaultSettings: DeveloperSettings = {
    isEnabled: false,
    defaultChainId: 84532, // Base Sepolia by default
    networkIndicatorExpanded: true, // Expanded by default as requested
    showDebugOptions: true,
    showChainSelector: true,
    showNetworkIndicator: true,
    poolFilterMode: 'intersection',
    showContractPoolsOnly: false,
    showDatabasePoolsOnly: false,
}

export const useDeveloperStore = create<DeveloperStore>()(
    devtools(
        persist(
            (set): DeveloperStore => ({
                settings: defaultSettings,
                isHydrated: false,

                toggleDeveloperMode: () =>
                    set(state => ({
                        settings: {
                            ...state.settings,
                            isEnabled: !state.settings.isEnabled,
                        },
                    })),

                setDefaultChainId: (chainId: number) =>
                    set(state => ({
                        settings: {
                            ...state.settings,
                            defaultChainId: chainId,
                        },
                    })),

                setNetworkIndicatorExpanded: (expanded: boolean) =>
                    set(state => ({
                        settings: {
                            ...state.settings,
                            networkIndicatorExpanded: expanded,
                        },
                    })),

                setPoolFilterMode: (mode: PoolFilterMode) =>
                    set(state => ({
                        settings: {
                            ...state.settings,
                            poolFilterMode: mode,
                        },
                    })),

                setSetting: (key, value) =>
                    set(state => ({
                        settings: {
                            ...state.settings,
                            [key]: value,
                        },
                    })),

                resetSettings: () =>
                    set({
                        settings: defaultSettings,
                    }),

                setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
            }),
            {
                name: 'developer-settings',
                onRehydrateStorage: () => state => {
                    state?.setHydrated(true)
                },
            },
        ),
        {
            name: 'developer-store',
        },
    ),
)

// Helper hook to check if developer mode is available (only in development)
export const useDeveloperModeAvailable = () => {
    return process.env.NODE_ENV === 'development'
}

// Helper hook to check if developer features should be visible
export const useDeveloperFeaturesVisible = () => {
    const { settings } = useDeveloperStore()
    const isAvailable = useDeveloperModeAvailable()

    return isAvailable && settings.isEnabled
}
