'use client'

import { useNetworkValidation } from '@/hooks/use-network-validation'
import { formatBalance } from '@/lib/utils/balance'
import { cn } from '@/lib/utils/tailwind'
import { tokenAddress } from '@/types/contracts'
import { usePrivy } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { useBalance, useSwitchChain } from 'wagmi'
import BalanceSkeleton from './balance-skeleton'
import EncryptText from './encrypt-text'
import FormattedBalance from './formatted-balance'

// Add this after the imports
const zeroBalance = {
    value: BigInt(0),
    decimals: 18,
    symbol: 'USDC',
    integerPart: 0,
    fractionalPart: 0,
}

type Props = {
    color?: string
}

export default function Balance({ color }: Props) {
    const { user } = usePrivy()
    const address = user?.wallet?.address as Address
    const { currentChainId, isCorrectNetwork, expectedChain, shouldShowWarning } = useNetworkValidation()
    const { switchChain } = useSwitchChain()

    // Reduce log noise - only log when validation state actually changes
    const validationKey = `${currentChainId}-${isCorrectNetwork}-${expectedChain.name}-${shouldShowWarning}`
    if (process.env.NODE_ENV === 'development' && validationKey !== globalThis.__lastBalanceValidation) {
        console.log('[Balance] Network validation:', {
            currentChainId,
            isCorrectNetwork,
            expectedChain: expectedChain.name,
            shouldShowWarning,
        })
        globalThis.__lastBalanceValidation = validationKey
    }

    // Get chain-specific token address
    const currentTokenAddress = currentChainId
        ? (tokenAddress[currentChainId as keyof typeof tokenAddress] as Address)
        : undefined

    // Handle chain switching
    const handleSwitchToTestnet = () => {
        switchChain(
            { chainId: expectedChain.id },
            {
                onSuccess: () => {
                    console.log(`[Balance] Successfully switched to ${expectedChain.name}`)
                },
                onError: error => {
                    console.error(`[Balance] Failed to switch to ${expectedChain.name}:`, error)
                },
            },
        )
    }

    const { data: balanceData, isLoading } = useBalance({
        token: currentTokenAddress,
        address,
        query: {
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: 30_000, // DISABLE automatic polling
            // Only fetch balance if user is on the correct network
            enabled: Boolean(address && currentTokenAddress && isCorrectNetwork),
        },
    })

    // Format balance
    const balance = balanceData
        ? {
              ...balanceData,
              symbol: 'USDC',
              ...formatBalance(balanceData.value, balanceData.decimals),
          }
        : zeroBalance

    // Auto-switch to correct network if user is on Base mainnet
    if (shouldShowWarning && currentChainId === 8453) {
        // Base mainnet
        console.log('[Balance] Auto-switching from Base mainnet to correct network...')
        handleSwitchToTestnet()
    }

    return (
        <div
            className={cn('flex items-baseline gap-2 text-[2.5rem] font-bold', color ? `text-${color}` : 'text-white')}>
            {isLoading && <BalanceSkeleton />}
            {!isLoading && (
                <EncryptText balance={balance} color={color} symbol={balance.symbol}>
                    <FormattedBalance
                        integerPart={balance.integerPart}
                        fractionalPart={balance.fractionalPart}
                        symbol={balance.symbol}
                    />
                </EncryptText>
            )}
        </div>
    )
}
