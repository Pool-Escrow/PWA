'use client'

import useTransactions from '@/app/_client/hooks/use-transactions'
import { Button } from '@/app/_components/ui/button'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { useConfetti } from '@/hooks/use-confetti'
import { useUserInfo } from '@/hooks/use-user-info'
import { poolAbi } from '@/types/contracts'
import { CheckCircleIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

interface PoolDetailsClaimableWinningsProps {
    claimableAmount: number
    title?: string
    description?: string
    tokenSymbol: string
    poolId: string
}

export default function PoolDetailsClaimableWinnings({
    claimableAmount,
    tokenSymbol,
    title = 'Winner',
    description = 'First Place!',
    poolId,
}: PoolDetailsClaimableWinningsProps) {
    const { data: user } = useUserInfo()
    const address = user?.address as Address
    const { executeTransactions } = useTransactions()
    const { startConfetti, ConfettiComponent } = useConfetti()
    const [isLoading, setIsLoading] = useState(false)

    const handleClaimWinnings = useCallback(async () => {
        if (!address) {
            toast.error('Please connect your wallet')
            return
        }

        if (isLoading) return

        setIsLoading(true)
        toast('Claiming winnings...')

        const ClaimWinningFunction = getAbiItem({
            abi: poolAbi,
            name: 'claimWinning',
        })

        const args = [
            {
                address: currentPoolAddress,
                abi: [ClaimWinningFunction],
                functionName: ClaimWinningFunction.name,
                args: [poolId, address],
            },
        ]

        try {
            await executeTransactions(args, {
                type: 'CLAIM_WINNING',
                onSuccess: () => {
                    toast.success('Successfully claimed winnings')
                    startConfetti()
                },
            })
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('claimWinning Error:', error)
            }
            toast.error('Failed to claim winnings')
        } finally {
            setIsLoading(false)
        }
    }, [address, poolId, executeTransactions, startConfetti, isLoading])

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
                    disabled={isLoading}
                    className='detail_card_claim_button h-9 w-full text-[0.625rem] text-white'>
                    {isLoading ? 'Claiming...' : 'Claim winnings'}
                </Button>
            </div>
        </>
    )
}
