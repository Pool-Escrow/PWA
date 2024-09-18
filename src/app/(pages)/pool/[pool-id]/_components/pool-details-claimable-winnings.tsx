'use client'

import useSmartTransaction from '@/app/_client/hooks/use-smart-transaction'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { Button } from '@/app/_components/ui/button'
import { poolAbi, poolAddress } from '@/types/contracts'
import { CheckCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Address, getAbiItem } from 'viem'
import { useAccount } from 'wagmi'
import { useConfetti } from '@/hooks/use-confetti'

interface PoolDetailsClaimableWinningsProps {
    claimableAmount: number
    title?: string
    description?: string
    tokenSymbol: string
    poolId: bigint
}
export default function PoolDetailsClaimableWinnings({
    claimableAmount,
    tokenSymbol,
    title = 'Winner',
    description = 'First Place!',
    poolId,
}: PoolDetailsClaimableWinningsProps) {
    const { address } = useAccount() as { address: Address }
    const { executeTransactions } = useSmartTransaction()
    const { startConfetti, ConfettiComponent } = useConfetti()

    const handleClaimWinnings = async () => {
        toast('Claiming winnings...')
        const ClaimWinningFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinning',
        })

        const args = [
            {
                address: poolAddress[getConfig().state.chainId as ChainId],
                abi: [ClaimWinningFunction],
                functionName: 'claimWinning',
                args: [poolId, address],
            },
        ]

        try {
            await executeTransactions(args)
            toast.success('Successfully claimed winnings')
            startConfetti()
        } catch (error) {
            console.log('claimWinning Error', error)
            toast.error('Failed to claim winnings')
        }
    }

    if (claimableAmount <= 0) return null

    return (
        <>
            <ConfettiComponent />
            <div className='mb-[1.12rem] flex flex-col gap-[0.38rem]'>
                <div className='inline-flex w-full justify-between'>
                    <div className='inline-flex items-center gap-1'>
                        <CheckCircleIcon className='size-3 scale-95' />
                        <span className='text-xs font-semibold'>{title}</span>
                    </div>
                    <div className='text-xs'>{`${description} $${claimableAmount} ${tokenSymbol}`}</div>
                </div>
                <Button
                    onClick={() => void handleClaimWinnings()}
                    className='detail_card_claim_button h-9 w-full text-[0.625rem] text-white'>
                    Claim winnings
                </Button>
            </div>
        </>
    )
}
