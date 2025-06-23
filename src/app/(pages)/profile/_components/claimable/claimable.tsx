'use client'

import { Button } from '@/components/ui/button'
import { useConfetti } from '@/hooks/use-confetti'
import useTransactions from '@/hooks/use-transactions'
import { useUserInfo } from '@/hooks/use-user-info'
import { currentPoolAddress } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { toast } from 'sonner'
import { getAbiItem } from 'viem'
import PoolCardRow from '../../claim-winning/_components/pool-card-row'
import { useClaimablePools } from '../../claim-winning/_components/use-claimable-pools'

export default function ClaimablePrizes() {
    const { data: user } = useUserInfo()
    const address = user?.address
    const { claimablePools, isPending } = useClaimablePools()
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
            await executeTransactions(
                [
                    {
                        address: currentPoolAddress,
                        abi: [ClaimWinningsFunction],
                        functionName: ClaimWinningsFunction.name,
                        args: [poolIds, walletAddresses],
                    },
                ],
                {
                    type: 'CLAIM_WINNINGS',
                    onSuccess: () => {
                        console.log('Successfully claimed all winnings')
                        toast.success('Successfully claimed all winnings')
                        startConfetti()
                    },
                },
            )
            toast.success('Successfully claimed all winnings')
            startConfetti()
        } catch (error) {
            console.error('Error claiming winnings:', error)
            toast.error('Failed to claim winnings')
        }
    }

    if (isPending) {
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
                    {claimablePools[0].map((poolId, _index) => (
                        <PoolCardRow key={poolId.toString()} poolId={poolId.toString()} />
                    ))}
                </div>
                <Button onClick={() => void handleClaimAll()} className='mt-4 w-full'>
                    Claim All
                </Button>
            </section>
        </>
    )
}
