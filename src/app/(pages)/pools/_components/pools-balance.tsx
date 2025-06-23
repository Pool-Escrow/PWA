'use client'

import BalanceSkeleton from '@/components/balance/balance-skeleton'
import EncryptText from '@/components/balance/encrypt-text'
import FormattedBalance from '@/components/balance/formatted-balance'
import NumberTicker from '@/components/ui/number-ticker'
import { useNetworkValidation } from '@/hooks/use-network-validation'
import { formatBalance } from '@/lib/utils/balance'
import { dropTokenAddress, tokenAddress } from '@/types/contracts'
import { usePrivy } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { useBalance, useSwitchChain } from 'wagmi'

// Default/fallback balances for each token
const zeroUsdcbalance = {
    value: BigInt(0),
    decimals: 18,
    symbol: 'USDC',
    integerPart: 0,
    fractionalPart: 0,
}

const zeroDropBalance = {
    value: BigInt(0),
    decimals: 18,
    symbol: 'DROP',
    integerPart: 0,
    fractionalPart: 0,
}

export default function PoolsBalance() {
    const { user } = usePrivy()
    const address = user?.wallet?.address as Address
    const { currentChainId, isCorrectNetwork, expectedChain, shouldShowWarning } = useNetworkValidation()
    const { switchChain } = useSwitchChain()

    // Get chain-specific token addresses
    const currentTokenAddress = currentChainId
        ? (tokenAddress[currentChainId as keyof typeof tokenAddress] as Address)
        : undefined
    const currentDropTokenAddress = currentChainId
        ? (dropTokenAddress[currentChainId as keyof typeof dropTokenAddress] as Address)
        : undefined

    // Handle chain switching
    const handleSwitchToTestnet = () => {
        switchChain(
            { chainId: expectedChain.id },
            {
                onSuccess: () => {
                    console.log(`[PoolsBalance] Successfully switched to ${expectedChain.name}`)
                },
                onError: error => {
                    console.error(`[PoolsBalance] Failed to switch to ${expectedChain.name}:`, error)
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
            refetchInterval: false, // DISABLE automatic polling
            // Only fetch balance if user is on the correct network
            enabled: Boolean(address && currentTokenAddress && isCorrectNetwork),
        },
    })

    const { data: dropBalanceData } = useBalance({
        token: currentDropTokenAddress,
        address,
        query: {
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false, // DISABLE automatic polling
            // Only fetch balance if user is on the correct network
            enabled: Boolean(address && currentDropTokenAddress && isCorrectNetwork),
        },
    })

    // Format balances
    const balance = balanceData
        ? {
              ...balanceData,
              symbol: 'USDC',
              ...formatBalance(balanceData.value, balanceData.decimals),
          }
        : zeroUsdcbalance

    const dropBalance = dropBalanceData
        ? {
              ...dropBalanceData,
              symbol: 'DROP',
              ...formatBalance(dropBalanceData.value, dropBalanceData.decimals),
          }
        : zeroDropBalance

    // Auto-switch to correct network if user is on Base mainnet
    if (shouldShowWarning && currentChainId === 8453) {
        // Base mainnet - silently auto-switch
        handleSwitchToTestnet()
    }

    return (
        <section className='flex flex-col gap-2'>
            <h1 className='text-sm font-medium text-white/80'>Total balance</h1>
            <div className='flex items-baseline gap-2 text-[2.5rem] font-bold text-white'>
                {isLoading && <BalanceSkeleton />}
                {!isLoading && (
                    <EncryptText balance={balance} color='white' symbol={balance.symbol}>
                        <FormattedBalance
                            integerPart={balance.integerPart}
                            fractionalPart={balance.fractionalPart}
                            symbol={balance.symbol}
                        />
                    </EncryptText>
                )}
            </div>
            <div className='mt-5 inline-flex w-fit items-center gap-2 rounded-full pb-1'>
                <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                        d='M5.735 1.10967C5.80531 1.03944 5.90062 1 6 1C6.09938 1 6.19469 1.03944 6.265 1.10967C6.4665 1.31117 7.2645 2.17317 8.0145 3.29067C8.7545 4.39217 9.5 5.81717 9.5 7.12467C9.5 8.38667 9.127 9.36417 8.478 10.0277C7.8295 10.6897 6.9445 10.9997 6 10.9997C5.055 10.9997 4.1705 10.6902 3.522 10.0277C2.873 9.36417 2.5 8.38667 2.5 7.12467C2.5 5.81717 3.246 4.39217 3.9855 3.29067C4.7355 2.17317 5.5335 1.31067 5.735 1.10967Z'
                        fill='white'
                    />
                </svg>
                <span className='text-[12px] text-white'>
                    <span className='text-[12px] text-white'>
                        <NumberTicker value={dropBalance.integerPart} className='text-[12px] text-white' />
                        <span>.</span>
                        <NumberTicker
                            value={dropBalance.fractionalPart}
                            className='text-[12px] text-white'
                            padding={2}
                        />
                    </span>
                    <span className='ml-2 text-sm'>{dropBalance.symbol}</span>
                </span>
            </div>
        </section>
    )
}
