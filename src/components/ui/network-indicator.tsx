'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { baseSepolia } from 'viem/chains'
import { useChainId, useSwitchChain } from 'wagmi'

interface NetworkIndicatorProps {
    className?: string
    showSwitchButton?: boolean
}

export function NetworkIndicator({ className, showSwitchButton = true }: NetworkIndicatorProps) {
    const chainId = useChainId()
    const { switchChain, isPending } = useSwitchChain()

    const isCorrectNetwork = chainId === 84532 // Base Sepolia
    const isMainnet = chainId === 8453 // Base mainnet

    const handleSwitchToTestnet = () => {
        switchChain(
            { chainId: baseSepolia.id },
            {
                onSuccess: () => {
                    console.log('[NetworkIndicator] Successfully switched to Base Sepolia')
                },
                onError: error => {
                    console.error('[NetworkIndicator] Failed to switch to Base Sepolia:', error)
                },
            },
        )
    }

    const getNetworkName = () => {
        switch (chainId) {
            case 8453:
                return 'Base Mainnet'
            case 84532:
                return 'Base Sepolia'
            default:
                return `Chain ${chainId || 'Unknown'}`
        }
    }

    const getStatusColor = () => {
        if (isCorrectNetwork) return 'text-green-600'
        if (isMainnet) return 'text-amber-600'
        return 'text-red-600'
    }

    const getStatusIcon = () => {
        if (isCorrectNetwork) return <CheckCircle className='size-4' />
        return <AlertTriangle className='size-4' />
    }

    if (!chainId) return null

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className={cn('flex items-center gap-1 text-sm', getStatusColor())}>
                {getStatusIcon()}
                <span>{getNetworkName()}</span>
            </div>

            {!isCorrectNetwork && showSwitchButton && (
                <Button
                    size='sm'
                    variant='outline'
                    onClick={handleSwitchToTestnet}
                    disabled={isPending}
                    className='h-7 px-2 text-xs'>
                    {isPending ? (
                        <>
                            <Loader2 className='mr-1 size-3 animate-spin' />
                            Switching...
                        </>
                    ) : (
                        'Switch to Testnet'
                    )}
                </Button>
            )}
        </div>
    )
}
