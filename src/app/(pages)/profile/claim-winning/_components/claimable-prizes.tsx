'use client'

import { Button } from '@/app/_components/ui/button'
import { useEffect } from 'react'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import Container from './container'
import PoolCardRow from './pool-card-row'
import SectionContent from './section-content'
import SectionTitle from './section-title'
import { useClaimablePools } from './use-claimable-pools'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { useUserInfo } from '@/hooks/use-user-info'
import { Loader2Icon } from 'lucide-react'
import { useConfetti } from '@/hooks/use-confetti'

export default function ClaimablePrizesList() {
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const isRouting = useAppStore(state => state.isRouting)

    const { claimablePools, isPending } = useClaimablePools()
    const { executeTransactions } = useTransactions()
    const { data: user } = useUserInfo()
    const { startConfetti } = useConfetti()

    const poolIdsToClaimFrom = claimablePools?.[0] || []

    const onClaimFromPoolsButtonClicked = () => {
        if (!claimablePools || poolIdsToClaimFrom.length === 0) return

        const userAddress = user?.address as Address | undefined
        if (!userAddress) return

        const walletAddresses = poolIdsToClaimFrom.map(() => userAddress)

        const ClaimWinningsFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinnings',
        })

        executeTransactions(
            [
                {
                    address: currentPoolAddress,
                    abi: [ClaimWinningsFunction],
                    functionName: ClaimWinningsFunction.name,
                    args: [poolIdsToClaimFrom, walletAddresses],
                },
            ],
            {
                type: 'CLAIM_WINNINGS',
                onSuccess: () => {
                    console.log('Successfully claimed all winnings')
                    startConfetti()
                },
            },
        )
    }

    useEffect(() => {
        if (!claimablePools || poolIdsToClaimFrom?.length === 0) {
            setBottomBarContent(undefined)
        } else {
            if (!isRouting) {
                setBottomBarContent(
                    <Button
                        onClick={() => void onClaimFromPoolsButtonClicked()}
                        className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        <span>Claim</span>
                    </Button>,
                )
            }
        }
        return () => {
            setBottomBarContent(undefined)
        }
    }, [claimablePools])

    if (isPending) {
        return (
            <div className='flex-center p-6'>
                <Loader2Icon className='mr-2 size-4 animate-spin' />
            </div>
        )
    }

    if (!claimablePools || poolIdsToClaimFrom.length === 0) {
        return null
    }

    return (
        <Container>
            <SectionTitle />
            <SectionContent>
                {poolIdsToClaimFrom.map((pool, index) => (
                    <PoolCardRow key={index} poolId={pool.toString()} />
                ))}
            </SectionContent>
        </Container>
    )
}
