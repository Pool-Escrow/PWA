'use client'

import { formatBalance } from '@/app/pwa/_lib/utils/balance'
import { useState } from 'react'
import EncryptText from './encrypt-text'
import FormattedBalance from './formatted-balance'
import { useAccount, useBalance } from 'wagmi'
import { currentTokenAddress } from '../../_server/blockchain/server-config'
import BalanceSkeleton from './balance-skeleton'
import { usePrivy } from '@privy-io/react-auth'

interface BalanceProps {
    color?: string
}

export default function Balance({ color }: BalanceProps) {
    const { authenticated } = usePrivy()

    const { address } = useAccount()
    const { data: balance } = useBalance({
        token: currentTokenAddress,
        address,
        query: {
            enabled: Boolean(address),
            refetchInterval: 10_000, // 10 seconds
        },
    })

    const [isEncoded, setIsEncoded] = useState(false)

    const formattedBalance = formatBalance(balance?.value, balance?.decimals)

    if (!authenticated) {
        return null
    }

    return (
        <section className='detail_card mt-2 flex w-full flex-col gap-[0.69rem] rounded-3xl p-6'>
            <h1 className='text-[0.6875rem] font-semibold'>Total balance</h1>
            <div className='inline-flex items-baseline gap-2 text-4xl font-bold'>
                {!balance ? (
                    <BalanceSkeleton />
                ) : (
                    <EncryptText
                        isEncoded={isEncoded}
                        setIsEncoded={setIsEncoded}
                        balance={formattedBalance}
                        color={color}
                        symbol={balance?.symbol || ''}>
                        <FormattedBalance {...formattedBalance} symbol={balance?.symbol || ''} />
                    </EncryptText>
                )}
            </div>
        </section>
    )
}
