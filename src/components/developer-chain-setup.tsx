'use client'

import { useDeveloperChainSetup } from '@/hooks/use-developer-chain-setup'

/**
 * Component that handles developer chain setup initialization.
 * This should be placed high in the component tree to ensure
 * it runs early in the app lifecycle.
 */
export function DeveloperChainSetup() {
    useDeveloperChainSetup()

    // This component renders nothing but handles the side effects
    return null
}
