'use client'

import { Button } from '@/components/ui/button'
import { useChainAwareContracts } from '@/hooks/use-chain-aware-contracts'
import { useConfetti } from '@/hooks/use-confetti'
import useTransactions from '@/hooks/use-transactions'
import { useUserInfo } from '@/hooks/use-user-info'
import { useAppStore } from '@/providers/app-store.provider'
import { poolAbi } from '@/types/contracts'
import { Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { getAbiItem } from 'viem'
import Container from './container'
import PoolCardRow from './pool-card-row'
import SectionContent from './section-content'
import SectionTitle from './section-title'
import { useClaimablePools } from './use-claimable-pools'

export default function ClaimablePrizesList() {
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const isRouting = useAppStore(state => state.isRouting)

    const { claimablePools, isPending } = useClaimablePools()
    const { poolAddress } = useChainAwareContracts()

    // TODO: Apparently this is generating POST requests hitting limits on the RPC endpoint.
    const { executeTransactions } = useTransactions()
    const { data: user } = useUserInfo()
    const { startConfetti } = useConfetti()

    const poolIdsToClaimFrom = useMemo(() => claimablePools?.[0] || [], [claimablePools])

    const onClaimFromPoolsButtonClicked = useCallback(() => {
        if (!claimablePools || poolIdsToClaimFrom.length === 0) return

        const userAddress = user?.address
        if (!userAddress) return

        const walletAddresses = poolIdsToClaimFrom.map(() => userAddress)

        const ClaimWinningsFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinnings',
        })

        void executeTransactions(
            [
                {
                    address: poolAddress,
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
    }, [claimablePools, poolIdsToClaimFrom, user?.address, executeTransactions, startConfetti, poolAddress])

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
    }, [claimablePools, isRouting, onClaimFromPoolsButtonClicked, poolIdsToClaimFrom?.length, setBottomBarContent])

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
