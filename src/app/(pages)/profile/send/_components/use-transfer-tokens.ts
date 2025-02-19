import useTransactions from '@/app/_client/hooks/use-transactions'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { tokenAbi } from '@/types/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Address, getAbiItem, Hash } from 'viem'
import { useBalance, useWaitForTransactionReceipt } from 'wagmi'

export function useTransferToken(tokenAddress?: Address) {
    const { executeTransactions, result } = useTransactions()
    const { refetch: refetchBalance } = useBalance({
        address: tokenAddress ?? currentTokenAddress,
    })
    const clearPoolPayouts = usePayoutStore(state => state.clearPoolPayouts)
    const queryClient = useQueryClient()
    const [lastConfirmedHash, setLastConfirmedHash] = useState<Hash | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError: isConfirmationError,
    } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })

    const transferToken = useCallback(
        async (withdrawToAddress: Address, amount: bigint) => {
            const TransferFunction = getAbiItem({
                abi: tokenAbi,
                name: 'transfer',
            })

            try {
                await executeTransactions(
                    [
                        {
                            address: tokenAddress ?? currentTokenAddress,
                            abi: [TransferFunction],
                            functionName: TransferFunction.name,
                            args: [withdrawToAddress, amount],
                        },
                    ],
                    {
                        type: 'TRANSFER_TOKEN',
                        onSuccess: () => {
                            console.log('Successfully transferred token')
                        },
                    },
                )
            } catch (error) {
                console.error('Transfer Token Error', error)
                toast.error('Failed to transfer token')
            }
        },
        [executeTransactions, tokenAddress],
    )

    useEffect(() => {
        if (isConfirmed && result.hash && result.hash !== lastConfirmedHash) {
            toast.success('Successfully sent tokens')
            queryClient.invalidateQueries({ queryKey: ['balance'] })
            refetchBalance()
            setLastConfirmedHash(result.hash)
            setIsSuccess(true)
        }

        if (isConfirmationError) {
            toast.error('Failed to confirm payout transaction')
        }
    }, [
        isConfirmed,
        isConfirmationError,
        result.hash,
        lastConfirmedHash,
        clearPoolPayouts,
        queryClient,
        refetchBalance,
    ])

    return {
        transferToken,
        isPending: result.isLoading,
        isConfirming,
        isError: result.isError || isConfirmationError,
        isSuccess,
        setIsSuccess,
    }
}
