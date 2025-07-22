'use client'

import BalanceSkeleton from '@/components/balance/balance-skeleton'
import EncryptText from '@/components/balance/encrypt-text'
import FormattedBalance from '@/components/balance/formatted-balance'
import { useSharedBalance } from '@/hooks/use-shared-balance'
import { formatBalance } from '@/lib/utils/balance'

// Default/fallback balances for each token
const zeroUsdcbalance = {
    value: BigInt(0),
    decimals: 6,
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

const DropIcon = () => (
    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M5.735 1.10967C5.80531 1.03944 5.90062 1 6 1C6.09938 1 6.19469 1.03944 6.265 1.10967C6.4665 1.31117 7.2645 2.17317 8.0145 3.29067C8.7545 4.39217 9.5 5.81717 9.5 7.12467C9.5 8.38667 9.127 9.36417 8.478 10.0277C7.8295 10.6897 6.9445 10.9997 6 10.9997C5.055 10.9997 4.1705 10.6902 3.522 10.0277C2.873 9.36417 2.5 8.38667 2.5 7.12467C2.5 5.81717 3.246 4.39217 3.9855 3.29067C4.7355 2.17317 5.5335 1.31067 5.735 1.10967Z'
            fill='white'
        />
    </svg>
)

export default function PoolsBalance() {
    // Use shared balance hook to prevent duplicate requests
    const { usdc, drop, isAnyLoading } = useSharedBalance('PoolsBalance')

    // Format balances using the existing formatBalance utility
    const balance =
        usdc.value > 0
            ? {
                  ...usdc,
                  symbol: 'USDC',
                  ...formatBalance(usdc.value, usdc.decimals),
              }
            : zeroUsdcbalance

    const dropBalance =
        drop.value > 0
            ? {
                  ...drop,
                  symbol: 'DROP',
                  ...formatBalance(drop.value, drop.decimals),
              }
            : zeroDropBalance

    return (
        <section className='flex flex-col gap-2'>
            <h1 className='text-sm font-medium text-white/80'>Total balance</h1>
            <div className='flex gap-2 text-[2.5rem] font-bold text-white'>
                {/* Show loading skeleton if balances are not ready */}
                {isAnyLoading ? (
                    <BalanceSkeleton />
                ) : (
                    <>
                        <EncryptText balance={balance} color='white' symbol={balance.symbol}>
                            <FormattedBalance
                                integerPart={balance.integerPart}
                                fractionalPart={balance.fractionalPart}
                                symbol={balance.symbol}
                            />
                        </EncryptText>
                        <div className='text-xs text-white/60'>+</div>
                        <div className='flex items-center gap-1'>
                            <EncryptText balance={dropBalance} color='white' symbol={dropBalance.symbol}>
                                <FormattedBalance
                                    integerPart={dropBalance.integerPart}
                                    fractionalPart={dropBalance.fractionalPart}
                                    symbol={dropBalance.symbol}
                                />
                            </EncryptText>
                            <DropIcon />
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
