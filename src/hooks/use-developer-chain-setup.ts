import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { useEffect } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'

/**
 * Hook to handle initial chain setup based on developer settings
 */
export function useDeveloperChainSetup() {
    const { settings, isHydrated } = useDeveloperStore()
    const isDeveloperFeaturesVisible = useDeveloperFeaturesVisible()
    const currentChainId = useChainId()
    const { switchChain } = useSwitchChain()

    useEffect(() => {
        // Only run once after hydration and if developer features are visible
        if (!isHydrated || !isDeveloperFeaturesVisible) {
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
                    },
                    onError: error => {
                        console.warn('[DeveloperChainSetup] Failed to switch to default chain:', error)
                    },
                },
            )
        }
    }, [isHydrated, isDeveloperFeaturesVisible, currentChainId, settings.defaultChainId, switchChain])

    return {
        isSetupReady: isHydrated && isDeveloperFeaturesVisible,
        defaultChainId: settings.defaultChainId,
        shouldSwitchToDefault: currentChainId !== settings.defaultChainId,
    }
}
