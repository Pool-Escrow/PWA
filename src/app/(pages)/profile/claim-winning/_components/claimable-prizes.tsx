'use client'

import { Button } from '@/app/_components/ui/button'
import { useEffect } from 'react'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import { useAccount } from 'wagmi'
import Container from './container'
import PoolCardRow from './pool-card-row'
import SectionContent from './section-content'
import SectionTitle from './section-title'
import { useClaimablePools } from './use-claimable-pools'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'

export default function ClaimablePrizesList() {
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const { address } = useAccount()
    const { claimablePools, isLoading } = useClaimablePools(address as Address)
    const { executeTransactions } = useTransactions()

    const poolIdsToClaimFrom = claimablePools?.[0] || []

    const onClaimFromPoolsButtonClicked = () => {
        if (!claimablePools || poolIdsToClaimFrom.length === 0) return

        const walletAddresses = Array(poolIdsToClaimFrom.length).fill(address as Address)

        const ClaimWinningsFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinnings',
        })

        executeTransactions([
            {
                address: currentPoolAddress,
                abi: [ClaimWinningsFunction],
                functionName: ClaimWinningsFunction.name,
                args: [poolIdsToClaimFrom, walletAddresses],
            },
        ])
    }

    useEffect(() => {
        if (!claimablePools || poolIdsToClaimFrom?.length === 0) {
            setBottomBarContent(undefined)
        } else {
            setBottomBarContent(
                <Button
                    onClick={() => void onClaimFromPoolsButtonClicked()}
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <span>Claim</span>
                </Button>,
            )
        }
        return () => {
            setBottomBarContent(undefined)
        }
    }, [claimablePools])

    if (isLoading) {
        return <div className='flex-center p-6'>Loading...</div>
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
