'use client'

import { useAccount } from 'wagmi'
import { useClaimablePools } from '../../claim-winning/_components/use-claimable-pools'
import PoolCardRow from '../../claim-winning/_components/pool-card-row'
import { Button } from '@/app/_components/ui/button'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { toast } from 'sonner'
import { getAbiItem } from 'viem'
import { useConfetti } from '@/hooks/use-confetti'
import { poolAbi } from '@/types/contracts'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'

export default function ClaimablePrizes() {
    const { address } = useAccount()
    const { claimablePools, isLoading } = useClaimablePools(address as string)
    const { executeTransactions } = useTransactions()
    const { startConfetti, ConfettiComponent } = useConfetti()

    const handleClaimAll = async () => {
        if (!claimablePools || claimablePools[0].length === 0) return

        const poolIds = claimablePools[0]
        const walletAddresses = Array(poolIds.length).fill(address)

        const ClaimWinningsFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinnings',
        })

        try {
            await executeTransactions([
                {
                    address: currentPoolAddress,
                    abi: [ClaimWinningsFunction],
                    functionName: ClaimWinningsFunction.name,
                    args: [poolIds, walletAddresses],
                },
            ])
            toast.success('Successfully claimed all winnings')
            startConfetti()
        } catch (error) {
            console.error('Error claiming winnings:', error)
            toast.error('Failed to claim winnings')
        }
    }

    if (isLoading) {
        return <div className='text-xs'>Loading claimable prizes...</div>
    }

    if (!claimablePools || claimablePools[0].length === 0) {
        return null
    }

    return (
        <>
            <ConfettiComponent />
            <section className='detail_card flex w-full flex-col gap-[0.69rem] rounded-3xl p-6'>
                <h1 className='w-full border-b pb-2 text-[0.6875rem] font-semibold'>Claimable Winnings</h1>
                <div className='flex flex-col gap-4'>
                    {claimablePools[0].map((poolId, index) => (
                        <PoolCardRow key={poolId.toString()} poolId={poolId.toString()} />
                    ))}
                </div>
                <Button onClick={handleClaimAll} className='mt-4 w-full'>
                    Claim All
                </Button>
            </section>
        </>
    )
}
