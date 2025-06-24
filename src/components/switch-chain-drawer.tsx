import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Chain } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { useConfig, useSwitchChain } from 'wagmi'

interface SwitchChainDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    targetChain?: Chain
    onSwitched?: () => void
    title?: string
    description?: string
}

const SUPPORTED_CHAINS = [base, baseSepolia] as const

const getChainIcon = (chainId: number): string => {
    switch (chainId) {
        case base.id:
            return '/chain-icons/base.webp'
        case baseSepolia.id:
            return '/chain-icons/base.webp' // Using same icon for Base Sepolia
        default:
            return '/chain-icons/base.webp'
    }
}

const getChainName = (chain: Chain): string => {
    switch (chain.id) {
        case base.id:
            return 'Base'
        case baseSepolia.id:
            return 'Base Sepolia'
        default:
            return chain.name
    }
}

export function SwitchChainDrawer({
    open,
    onOpenChange,
    targetChain = base,
    onSwitched,
    title = 'Switch Network',
    description = 'Please switch to the required network to continue.',
}: SwitchChainDrawerProps) {
    const { switchChain, isPending } = useSwitchChain()
    const config = useConfig()
    const [isLoading, setIsLoading] = useState(false)

    // Debug: Log the actual configured chains on mount (development only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[SwitchChainDrawer] Component mounted with config:', {
                chains: config.chains.map(c => ({ id: c.id, name: c.name })),
                targetChainId: targetChain.id,
                isTargetInConfig: config.chains.some(c => c.id === targetChain.id),
            })
        }
    }, [config, targetChain.id])

    const handleSwitchChain = () => {
        if (!targetChain) return

        // Check if config is loaded
        if (!config || !config.chains || config.chains.length === 0) {
            console.error('[SwitchChainDrawer] Wagmi config not loaded yet')
            return
        }

        // Pre-check: Ensure the target chain is available in the config
        const isChainAvailable = config.chains.some(c => c.id === targetChain.id)

        console.log(`[SwitchChainDrawer] Attempting to switch to chain:`, {
            chainId: targetChain.id,
            chainName: getChainName(targetChain),
            targetChain,
            availableChainsInConfig: config.chains.map(c => ({ id: c.id, name: c.name })),
            isChainAvailable,
            configLoaded: !!config,
            chainsLength: config.chains.length,
        })

        if (!isChainAvailable) {
            console.error(
                `[SwitchChainDrawer] Chain ${targetChain.id} is not available in wagmi config. Available chains:`,
                config.chains.map(c => ({ id: c.id, name: c.name })),
            )
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        switchChain(
            { chainId: targetChain.id },
            {
                onSuccess: () => {
                    console.log(
                        `[SwitchChainDrawer] Successfully switched to chain ${targetChain.name} ${targetChain.id}`,
                    )
                    onSwitched?.()
                    onOpenChange(false)
                    setIsLoading(false)
                },
                onError: error => {
                    console.error('[SwitchChainDrawer] Failed to switch chain:', error)
                    console.error('[SwitchChainDrawer] Error details:', {
                        message: error.message,
                        cause: error.cause,
                        targetChainId: targetChain.id,
                        supportedChainsStatic: SUPPORTED_CHAINS.map(chain => ({ id: chain.id, name: chain.name })),
                        availableChainsInConfig: config.chains.map(c => ({ id: c.id, name: c.name })),
                        errorName: error.name,
                        errorStack: error.stack,
                    })

                    // Check if it's a specific chain configuration error
                    if (error.message.includes('Chain not configured')) {
                        console.error('[SwitchChainDrawer] Chain configuration error - checking wagmi config state')
                        console.error('[SwitchChainDrawer] Config object:', config)
                    }

                    setIsLoading(false)
                },
            },
        )
    }

    const isTargetChainSupported = SUPPORTED_CHAINS.some(chain => chain.id === targetChain.id)

    if (!isTargetChainSupported) {
        console.warn(
            `[SwitchChainDrawer] Chain ${targetChain.id} is not supported. Supported chains:`,
            SUPPORTED_CHAINS.map(chain => ({ id: chain.id, name: chain.name })),
        )
        return null
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className='text-center'>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className='px-4 pb-4'>
                    <div className='flex items-center justify-center space-x-4 rounded-lg border p-4'>
                        <Image
                            src={getChainIcon(targetChain.id)}
                            alt={getChainName(targetChain)}
                            width={32}
                            height={32}
                            className='rounded-full'
                        />
                        <div className='flex-1'>
                            <h3 className='font-semibold'>{getChainName(targetChain)}</h3>
                            <p className='text-sm text-muted-foreground'>Chain ID: {targetChain.id}</p>
                        </div>
                    </div>
                </div>

                <DrawerFooter>
                    <Button onClick={handleSwitchChain} disabled={isLoading || isPending} className='w-full'>
                        {isLoading || isPending ? 'Switching...' : `Switch to ${getChainName(targetChain)}`}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant='outline' className='w-full'>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
