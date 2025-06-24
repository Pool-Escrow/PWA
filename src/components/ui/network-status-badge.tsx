'use client'

import { Button } from '@/components/ui/button'
import { useNetworkValidation } from '@/hooks/use-network-validation'
import { cn } from '@/lib/utils/tailwind'
import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { AlertTriangle, CheckCircle, HelpCircle, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSwitchChain } from 'wagmi'

interface NetworkStatusBadgeProps {
    className?: string
    showSwitchButton?: boolean
    variant?: 'compact' | 'full' | 'minimal'
    onClick?: () => void
}

const getChainDisplayName = (chainId: number): string => {
    switch (chainId) {
        case 8453:
            return 'Base Mainnet'
        case 84532:
            return 'Base Sepolia'
        default:
            return `Chain ${chainId}`
    }
}

export function NetworkStatusBadge({
    className,
    showSwitchButton = true,
    variant = 'full',
    onClick,
}: NetworkStatusBadgeProps) {
    const { currentChainId, expectedChain, networkStatus, shouldShowWarning } = useNetworkValidation()
    const { switchChain, isPending } = useSwitchChain()

    // Developer mode integration
    const isDeveloperFeaturesVisible = useDeveloperFeaturesVisible()
    const { settings, isHydrated } = useDeveloperStore()

    // Initialize expanded state based on developer settings
    const [isExpanded, setIsExpanded] = useState(false)

    // Update expanded state when developer settings change
    useEffect(() => {
        if (isHydrated && isDeveloperFeaturesVisible && settings.networkIndicatorExpanded) {
            setIsExpanded(true)
        }
    }, [isDeveloperFeaturesVisible, settings.networkIndicatorExpanded, isHydrated])

    const handleSwitchNetwork = () => {
        switchChain(
            { chainId: expectedChain.id },
            {
                onSuccess: () => {
                    console.log(`[NetworkStatusBadge] Successfully switched to ${expectedChain.name}`)
                },
                onError: error => {
                    console.error('[NetworkStatusBadge] Failed to switch network:', error)
                },
            },
        )
    }

    const getStatusConfig = () => {
        switch (networkStatus) {
            case 'correct':
                return {
                    icon: <CheckCircle className='size-4' />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 border-green-200',
                    label: 'Correct',
                }
            case 'wrong':
                return {
                    icon: <AlertTriangle className='size-4' />,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50 border-amber-200',
                    label: 'Wrong Network',
                }
            case 'unsupported':
                return {
                    icon: <WifiOff className='size-4' />,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 border-red-200',
                    label: 'Unsupported',
                }
            default:
                return {
                    icon: <HelpCircle className='size-4' />,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 border-gray-200',
                    label: 'Unknown',
                }
        }
    }

    const statusConfig = getStatusConfig()

    // Hide network indicator if developer settings disable it
    if (isDeveloperFeaturesVisible && !settings.showNetworkIndicator) {
        return null
    }

    if (!currentChainId && variant === 'minimal') return null

    // Variant: minimal - just a small icon
    if (variant === 'minimal') {
        return (
            <div className={cn('flex items-center', className)}>
                <div className={cn('rounded-full p-1', statusConfig.bgColor)}>
                    <div className={statusConfig.color}>
                        {isPending ? <Loader2 className='size-3 animate-spin' /> : <Wifi className='size-3' />}
                    </div>
                </div>
            </div>
        )
    }

    // Variant: compact - expandable
    if (variant === 'compact') {
        if (!isExpanded) {
            return (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                        'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:opacity-80',
                        statusConfig.bgColor,
                        statusConfig.color,
                        className,
                    )}>
                    {statusConfig.icon}
                </button>
            )
        }

        return (
            <div
                className={cn(
                    'flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium',
                    statusConfig.bgColor,
                    statusConfig.color,
                    className,
                )}>
                {statusConfig.icon}
                <button onClick={onClick} className='hover:opacity-70'>
                    <span>{currentChainId ? getChainDisplayName(currentChainId) : 'Offline'}</span>
                </button>
                {shouldShowWarning && showSwitchButton && (
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={handleSwitchNetwork}
                        disabled={isPending}
                        className='ml-1 h-5 px-1 text-xs'>
                        {isPending ? <Loader2 className='size-3 animate-spin' /> : 'Switch'}
                    </Button>
                )}
                <button onClick={() => setIsExpanded(false)} className='ml-1 hover:opacity-70'>
                    ×
                </button>
            </div>
        )
    }

    // Variant: full - complete
    return (
        <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', statusConfig.bgColor, className)}>
            <div className={statusConfig.color}>
                {isPending ? <Loader2 className='size-4 animate-spin' /> : statusConfig.icon}
            </div>

            <div className='min-w-0 flex-1'>
                <div className={cn('text-sm font-medium', statusConfig.color)}>
                    {currentChainId ? getChainDisplayName(currentChainId) : 'Offline'}
                </div>
                {shouldShowWarning && (
                    <div className='text-xs text-gray-600'>Required: {getChainDisplayName(expectedChain.id)}</div>
                )}
            </div>

            {shouldShowWarning && showSwitchButton && (
                <Button
                    size='sm'
                    variant='outline'
                    onClick={handleSwitchNetwork}
                    disabled={isPending}
                    className='text-xs'>
                    {isPending ? (
                        <>
                            <Loader2 className='mr-1 size-3 animate-spin' />
                            Switching...
                        </>
                    ) : (
                        'Switch Network'
                    )}
                </Button>
            )}
        </div>
    )
}
