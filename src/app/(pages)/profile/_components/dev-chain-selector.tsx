'use client'

import { SwitchChainDrawer } from '@/components/switch-chain-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { useState } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'

export function DevChainSelector() {
    const [showChainDrawer, setShowChainDrawer] = useState(false)
    const chainId = useChainId()
    const config = useConfig()

    // Developer mode integration
    const isDeveloperFeaturesVisible = useDeveloperFeaturesVisible()
    const { settings } = useDeveloperStore()

    // Only show when developer features are visible and chain selector is enabled
    if (!isDeveloperFeaturesVisible || !settings.showChainSelector) {
        return null
    }

    const getCurrentChainName = () => {
        switch (chainId) {
            case base.id:
                return 'Base'
            case baseSepolia.id:
                return 'Base Sepolia'
            default:
                return `Chain ${chainId}`
        }
    }

    const getTargetChain = () => {
        // Switch to the opposite chain for testing
        const targetChain = chainId === base.id ? baseSepolia : base

        // Reduce log noise - only log when chain actually changes
        const chainKey = `${chainId}-${targetChain.id}`
        if (process.env.NODE_ENV === 'development' && chainKey !== globalThis.__lastChainSelectorLog) {
            console.log('[DevChainSelector] getTargetChain:', {
                currentChainId: chainId,
                currentChainName: getCurrentChainName(),
                targetChainId: targetChain.id,
                targetChainName: targetChain.name,
                baseId: base.id,
                baseSepoliaId: baseSepolia.id,
            })
            globalThis.__lastChainSelectorLog = chainKey
        }
        return targetChain
    }

    return (
        <div className='space-y-2 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-sm font-semibold text-orange-800'>🔧 Development Tools</h3>
                    <div className='text-xs text-orange-600'>
                        Current chain: <Badge variant='outline'>{getCurrentChainName()}</Badge>
                    </div>
                </div>
            </div>

            {/* Wagmi Configuration Debug Info */}
            {settings.showDebugOptions && (
                <div className='rounded border border-orange-200 bg-orange-50 p-2'>
                    <h4 className='text-xs font-medium text-orange-800'>Wagmi Config:</h4>
                    <div className='text-xs text-orange-600'>
                        <p>Configured chains: {config.chains.map(c => `${c.name} (${c.id})`).join(', ')}</p>
                        <p>Base mainnet (8453) included: {config.chains.some(c => c.id === 8453) ? '✅' : '❌'}</p>
                        <p>Base Sepolia (84532) included: {config.chains.some(c => c.id === 84532) ? '✅' : '❌'}</p>
                    </div>
                </div>
            )}

            <Button
                onClick={() => setShowChainDrawer(true)}
                variant='outline'
                size='sm'
                className='w-full border-orange-300 text-orange-700 hover:bg-orange-100'>
                Switch Chain (Test Drawer)
            </Button>

            <SwitchChainDrawer
                open={showChainDrawer}
                onOpenChange={setShowChainDrawer}
                targetChain={getTargetChain()}
                onSwitched={() => {
                    console.log('Chain switched successfully!')
                    setShowChainDrawer(false)
                }}
                title='Development Chain Switcher'
                description='Switch between Base and Base Sepolia for testing purposes.'
            />
        </div>
    )
}
