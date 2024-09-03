import { useWallets } from '@privy-io/react-auth'
import { useEffect, useState, useCallback } from 'react'
import type { Abi, Address, Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'

export type ContractCall = {
    address: Address
    abi: Abi
    functionName: string
    args: unknown[] // ContractFunctionArgs[]
}

interface SmartTransactionResult {
    hash: Hash | null
    receipt: TransactionReceipt | null
    isLoading: boolean
    isError: boolean
    error: Error | null
}

export default function useTransactions() {
    const {
        data: id,
        writeContractsAsync,
        isPending: isPaymasterPending,
    } = useWriteContracts({
        mutation: {
            onMutate(variables) {
                console.log('Optimistic update here', variables)
            },
            // onSuccess(data, variables, context) {},
        },
    })
    const { data: hash, writeContractAsync } = useWriteContract()

    const { wallets, ready: walletsReady } = useWallets()
    const walletType = walletsReady ? wallets[0]?.connectorType : null

    const [result, setResult] = useState<SmartTransactionResult>({
        hash: null,
        receipt: null,
        isLoading: false,
        isError: false,
        error: null,
    })

    const { data: callsStatus } = useCallsStatus({
        id: id as string,
        query: {
            enabled: Boolean(id),
            refetchInterval: data => (data.state.data?.status === 'CONFIRMED' ? false : 1000),
        },
    })

    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })

    const [isConfirmed, setIsConfirmed] = useState(false)

    useEffect(() => {
        if (callsStatus?.status === 'CONFIRMED' && callsStatus.receipts && callsStatus.receipts.length > 0) {
            const paymasterReceipt = callsStatus.receipts[0]
            console.log('Transaction confirmed. Hash:', paymasterReceipt.transactionHash)
            console.log('Full receipt:', paymasterReceipt)
            console.log('Transaction logs:', paymasterReceipt.logs)
            setResult(prev => ({ ...prev, hash: paymasterReceipt.transactionHash }))
            setIsConfirmed(true)
        }
    }, [callsStatus])

    const resetConfirmation = useCallback(() => {
        setIsConfirmed(false)
    }, [])

    useEffect(() => {
        if (hash) {
            console.log('Hash updated from writeContract:', hash)
            setResult(prev => ({ ...prev, hash }))
        }
    }, [hash])

    async function executeCoinbaseTransactions(contractCalls: ContractCall[]) {
        console.log('Executing smart transactions', contractCalls)
        await writeContractsAsync(
            {
                contracts: contractCalls,
                capabilities: {
                    paymasterService: {
                        url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                    },
                },
            },
            {
                onSettled(data, error, variables, context) {
                    console.log('Transaction settled', data, error, variables, context)
                },
            },
        )
    }

    async function executeEoaTransactions(contractCalls: ContractCall[]) {
        console.log('Executing EOA transactions', contractCalls)
        await writeContractAsync(contractCalls[0])
    }

    return {
        executeTransactions: async (contractCalls: ContractCall[]) => {
            console.log('Executing transactions', contractCalls)
            if (walletType === 'coinbase_wallet') {
                console.log('Coinbase wallet detected', wallets[0].connectorType)
                await executeCoinbaseTransactions(contractCalls)
            } else {
                console.log('Non-Coinbase wallet detected')
                await executeEoaTransactions(contractCalls)
            }
        },
        isConfirmed,
        resetConfirmation,
        isPending: isPaymasterPending,
        isReady: walletsReady,
        result: {
            ...result,
            receipt,
            isConfirming,
            callsStatus,
        },
    }
}
