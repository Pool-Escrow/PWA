'use client'

import { formatBalance } from '@/app/_lib/utils/balance'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { cn } from '@/lib/utils/tailwind'
import { usePrivy } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { useBalance } from 'wagmi'
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

    const { data: balance, isLoading } = useBalance({
        token: currentTokenAddress,
        address,
        query: {
            refetchInterval: 20_000, // 20 seconds
            select: data => ({
                ...data,
                ...formatBalance(data.value, data.decimals),
            }),
            enabled: Boolean(address), // Only run the query when we have an address
        },
    })

    return (
        <section
            className={cn(
                'detail_card mt-2 flex w-full flex-col gap-[0.69rem] rounded-3xl p-6 transition-all duration-300',
                'translate-y-0 opacity-100', // Always visible
            )}>
            <h1 className='text-[0.6875rem] font-semibold'>Total balance</h1>
            <div className='inline-flex items-baseline gap-2 text-4xl font-bold'>
                {isLoading && <BalanceSkeleton />}
                {!isLoading && (
                    <EncryptText
                        balance={balance || zeroBalance}
                        color={color}
                        symbol={(balance || zeroBalance).symbol}>
                        <FormattedBalance
                            integerPart={(balance || zeroBalance).integerPart}
                            fractionalPart={(balance || zeroBalance).fractionalPart}
                            symbol={(balance || zeroBalance).symbol}
                        />
                    </EncryptText>
                )}
            </div>
        </section>
    )
}
