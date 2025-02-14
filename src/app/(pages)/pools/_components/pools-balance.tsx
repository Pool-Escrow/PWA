'use client'

import { useBalance } from 'wagmi'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { usePrivy } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { formatBalance } from '@/app/_lib/utils/balance'
import BalanceSkeleton from '@/app/_components/balance/balance-skeleton'
import EncryptText from '@/app/_components/balance/encrypt-text'
import FormattedBalance from '@/app/_components/balance/formatted-balance'

const zeroBalance = {
    value: BigInt(0),
    decimals: 18,
    symbol: 'USDC',
    integerPart: 0,
    fractionalPart: 0,
}

export default function PoolsBalance() {
    const { user } = usePrivy()
    const address = user?.wallet?.address as Address

    const { data: balance, isLoading } = useBalance({
        token: currentTokenAddress,
        address,
        query: {
            refetchInterval: 20_000,
            select: data => ({
                ...data,
                ...formatBalance(data.value, data.decimals),
            }),
            enabled: Boolean(address),
        },
    })

    return (
        <section className='flex flex-col gap-2'>
            <h1 className='text-sm font-medium text-white/80'>Total balance</h1>
            <div className='flex items-baseline gap-2 text-[2.5rem] font-bold text-white'>
                {isLoading && <BalanceSkeleton />}
                {!isLoading && (
                    <EncryptText
                        balance={balance || zeroBalance}
                        color='white'
                        symbol={(balance || zeroBalance).symbol}>
                        <FormattedBalance
                            integerPart={(balance || zeroBalance).integerPart}
                            fractionalPart={(balance || zeroBalance).fractionalPart}
                            symbol={(balance || zeroBalance).symbol}
                        />
                    </EncryptText>
                )}
            </div>
            <div className='mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/80 px-4 py-2'>
                <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                        d='M5.735 1.10967C5.80531 1.03944 5.90062 1 6 1C6.09938 1 6.19469 1.03944 6.265 1.10967C6.4665 1.31117 7.2645 2.17317 8.0145 3.29067C8.7545 4.39217 9.5 5.81717 9.5 7.12467C9.5 8.38667 9.127 9.36417 8.478 10.0277C7.8295 10.6897 6.9445 10.9997 6 10.9997C5.055 10.9997 4.1705 10.6902 3.522 10.0277C2.873 9.36417 2.5 8.38667 2.5 7.12467C2.5 5.81717 3.246 4.39217 3.9855 3.29067C4.7355 2.17317 5.5335 1.31067 5.735 1.10967Z'
                        fill='white'
                    />
                </svg>
                <span className='text-[12px] text-white'>Drop Tokens: 1250</span>
            </div>
        </section>
    )
}
