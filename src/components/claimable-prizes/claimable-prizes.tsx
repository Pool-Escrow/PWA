'use client'
import frog from '@/../public/images/frog.png'
import { useClaimablePools } from '@/lib/hooks/use-claimable-pools'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { Address, getAbiItem } from 'viem'
import { useWriteContract } from 'wagmi'
import { useSponsoredTxn } from '@/hooks/use-sponsored-txn'
import { Button } from '../ui/button'
import Container from './container'
import PoolCardRow from './pool-card-row'
import SectionContent from './section-content'
import SectionTitle from './section-title'

const mockClaimablePrizes = [
    { name: 'Pool Poker Party', prize: '250 USD', result: 'winner', image: frog.src },
    { name: 'EthCC Founders Basket', prize: '75 USD', result: 'winner', image: frog.src },
    { name: 'Aleo learn2earn Brussels 2024', prize: '60 USD', result: 'winner', image: frog.src },
]

export default function ClaimablePrizesList() {
    const { showBar, hideBar, setContent } = useBottomBarStore(state => state)
    const { wallets } = useWallets()
    const { writeContract } = useWriteContract()
    const walletAddress = wallets?.[0]?.address
    const { claimablePools, isLoading, error } = useClaimablePools(walletAddress)
    const { sponsoredTxn } = useSponsoredTxn()

    const poolIdIndices = claimablePools?.[1].reduce((indices: any, element: any, index: any) => {
        if (element === false) {
            indices.push(index)
        }
        return indices
    }, [])

    const poolIdsToClaimFrom: string[] = poolIdIndices?.map((index: any) => claimablePools?.[0]?.[index])

    const onClaimFromPoolsButtonClicked = async (
        claimablePools: readonly [readonly bigint[], readonly boolean[]] | undefined,
    ) => {
        if (!claimablePools) return
        if (claimablePools[0].length === 0) return

        console.log('claimablePools', claimablePools)
        try {
            const poolIdIndices = claimablePools?.[1].reduce((indices: any, element: any, index: any) => {
                if (element === false) {
                    indices.push(index)
                }
                return indices
            }, [])

            const poolIdsToClaimFrom = poolIdIndices?.map((index: any) => claimablePools?.[0]?.[index])
            console.log('poolIdsToClaimFrom', poolIdsToClaimFrom)

            const walletAddresses = poolIdsToClaimFrom.map(() => walletAddress as Address)

            const ClaimWinningsFunction = getAbiItem({
                abi: poolAbi,
                name: 'claimWinnings',
            })

            if (wallets[0].walletClientType === 'coinbase_smart_wallet' || wallets[0].walletClientType === 'coinbase_wallet') {
                sponsoredTxn({
                    targetAddress: poolAddress[wagmi.config.state.chainId as ChainId],
                    abi: [ClaimWinningsFunction],
                    functionName: 'claimWinnings',
                    args: [poolIdsToClaimFrom, walletAddresses],
                })
            } else {
                writeContract({
                    address: poolAddress[wagmi.config.state.chainId as ChainId],
                    abi: [ClaimWinningsFunction],
                    functionName: 'claimWinnings',
                    args: [poolIdsToClaimFrom, walletAddresses],
                })
            }
        } catch (error) {
            console.log('claimWinnings Error', error)
        }
    }
    useEffect(() => {
        if (claimablePools?.[0].length === 0) {
            hideBar()
        } else {
            setContent(
                <Button
                    onClick={() => onClaimFromPoolsButtonClicked(claimablePools)}
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <span>Claim</span>
                </Button>,
            )
            showBar()
        }
    }, [claimablePools, wallets])
    return (
        <Container>
            <SectionTitle />
            <SectionContent>
                {poolIdsToClaimFrom?.map((pool, index) => <PoolCardRow key={index} poolId={pool} />)}
            </SectionContent>
        </Container>
    )
}
