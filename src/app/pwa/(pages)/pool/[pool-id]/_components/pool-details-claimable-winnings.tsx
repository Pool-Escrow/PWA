'use client'

import useSmartTransaction from '@/app/pwa/_client/hooks/use-smart-transaction'
import { wagmi } from '@/app/pwa/_client/providers/configs'
import { Button } from '@/app/pwa/_components/ui/button'
import { serverConfig } from '@/app/pwa/_server/blockchain/server-config'
import { poolAbi, poolAddress, useWritePoolClaimWinning } from '@/types/contracts'
import { CheckCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Address, getAbiItem } from 'viem'
import { useAccount } from 'wagmi'

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

    const handleClaimWinnings = async () => {
        toast('Claiming winnings...')
        const ClaimWinningFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinning',
        })

        const args = [
            {
                address: poolAddress[wagmi.config.state.chainId as ChainId],
                abi: [ClaimWinningFunction],
                functionName: 'claimWinning',
                args: [poolId, address],
            },
        ]

        try {
            executeTransactions(args)
        } catch (error) {
            console.log('claimWinning Error', error)
        }
    }

    if (claimableAmount <= 0) return null

    return (
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
    )
}
