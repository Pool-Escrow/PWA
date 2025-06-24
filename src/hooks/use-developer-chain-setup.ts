import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { useEffect, useState } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'

/**
 * Hook to handle initial chain setup based on developer settings
 */
export function useDeveloperChainSetup() {
    const { settings, isHydrated } = useDeveloperStore()
    const isDeveloperFeaturesVisible = useDeveloperFeaturesVisible()
    const currentChainId = useChainId()
    const { switchChain } = useSwitchChain()
    const [hasSwitched, setHasSwitched] = useState(false)

    useEffect(() => {
        // Only run once after hydration, if developer features are visible, and if we haven't switched yet
        if (!isHydrated || !isDeveloperFeaturesVisible || hasSwitched) {
            return
        }

        // If current chain doesn't match the developer default, switch to it
        if (currentChainId !== settings.defaultChainId) {
            console.log('[DeveloperChainSetup] Switching to default developer chain:', {
                currentChainId,
                defaultChainId: settings.defaultChainId,
            })

            switchChain(
                { chainId: settings.defaultChainId },
                {
                    onSuccess: () => {
                        console.log(`[DeveloperChainSetup] Successfully switched to chain ${settings.defaultChainId}`)
                        setHasSwitched(true) // Mark that we've switched
                    },
                    onError: error => {
                        console.warn('[DeveloperChainSetup] Failed to switch to default chain:', error)
                        setHasSwitched(true) // Also mark on error to avoid loops
                    },
                },
            )
        } else {
            // Already on the correct chain, so we mark it as "switched" to prevent future runs
            setHasSwitched(true)
        }
    }, [isHydrated, isDeveloperFeaturesVisible, currentChainId, settings.defaultChainId, switchChain, hasSwitched])

    return {
        isSetupReady: isHydrated && isDeveloperFeaturesVisible,
        defaultChainId: settings.defaultChainId,
        shouldSwitchToDefault: currentChainId !== settings.defaultChainId,
    }
}
