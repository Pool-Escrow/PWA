import useTransactions from '@/app/_client/hooks/use-transactions'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Hash } from 'viem'
import { getAbiItem } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

export function useSetWinners(poolId: string) {
    const { executeTransactions, result } = useTransactions()
    const clearPoolPayouts = usePayoutStore(state => state.clearPoolPayouts)
    const queryClient = useQueryClient()
    const [lastConfirmedHash, setLastConfirmedHash] = useState<Hash | null>(null)

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError: isConfirmationError,
    } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })

    const setWinners = useCallback(
        async (addresses: string[], amounts: string[]) => {
            const SetWinnersFunction = getAbiItem({
                abi: poolAbi,
                name: 'setWinners',
            })

            try {
                await executeTransactions(
                    [
                        {
                            address: currentPoolAddress,
                            abi: [SetWinnersFunction],
                            functionName: SetWinnersFunction.name,
                            args: [poolId, addresses, amounts],
                        },
                    ],
                    {
                        type: 'SET_WINNERS',
                        onSuccess: () => {
                            toast.success('Successfully set payouts')
                        },
                    },
                )
            } catch (error) {
                console.error('Set Winner Error', error)
                toast.error('Failed to set payouts')
            }
        },
        [poolId, executeTransactions],
    )

    useEffect(() => {
        if (isConfirmed && result.hash && result.hash !== lastConfirmedHash) {
            toast.success('Successfully set payouts')
            clearPoolPayouts(poolId)
            queryClient.invalidateQueries({ queryKey: ['participants', poolId] }).catch(error => {
                console.error('Error invalidating participants', error)
            })
            queryClient
                .invalidateQueries({ queryKey: ['poolDetails', poolId, getConfig().state.chainId] })
                .catch(error => {
                    console.error('Error invalidating pool details', error)
                })
            setLastConfirmedHash(result.hash)
        }

        if (isConfirmationError) {
            toast.error('Failed to confirm payout transaction')
        }
    }, [isConfirmed, isConfirmationError, result.hash, lastConfirmedHash, clearPoolPayouts, poolId, queryClient])

    return {
        setWinners,
        isPending: result.isLoading,
        isConfirming,
        isError: result.isError || isConfirmationError,
    }
}
