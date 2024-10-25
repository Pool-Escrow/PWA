import { useWallets } from '@privy-io/react-auth'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Hash, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'
import { ContractCall } from '@/app/_lib/entities/models/contract-call'
import { base } from 'viem/chains'

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

    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isEoaConfirmed,
    } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })

    const [isConfirmed, setIsConfirmed] = useState(false)

    const transactionInProgressRef = useRef(false)

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

    useEffect(() => {
        if (isEoaConfirmed) {
            console.log('Transaction confirmed by EOA')
            setIsConfirmed(true)
        }
    }, [isEoaConfirmed])

    const resetConfirmation = useCallback(() => {
        setIsConfirmed(false)
    }, [])

    useEffect(() => {
        if (hash) {
            console.log('Hash updated from writeContract:', hash)
            setResult(prev => ({ ...prev, hash }))
        }
    }, [hash])

    const executeCoinbaseTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            if (transactionInProgressRef.current) return
            transactionInProgressRef.current = true

            console.log('Executing smart transactions', contractCalls)
            try {
                await writeContractsAsync(
                    {
                        contracts: contractCalls,
                        capabilities: {
                            paymasterService: {
                                url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                            },
                        },
                        chainId: base.id,
                    },
                    {
                        onSettled(data, error, variables, context) {
                            console.log('Transaction settled', data, error, variables, context)
                            transactionInProgressRef.current = false
                        },
                    },
                )
            } catch (error) {
                console.error('Error executing Coinbase transaction:', error)
                transactionInProgressRef.current = false
            }
        },
        [writeContractsAsync],
    )

    const executeEoaTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            if (transactionInProgressRef.current) return
            transactionInProgressRef.current = true

            console.log('Executing EOA transactions', contractCalls)
            try {
                await writeContractAsync(contractCalls[0])
            } catch (error) {
                console.error('Error executing EOA transaction:', error)
            } finally {
                transactionInProgressRef.current = false
            }
        },
        [writeContractAsync],
    )

    const executeTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            console.log('Executing transactions', contractCalls)
            if (walletType === 'coinbase_wallet') {
                console.log('Coinbase wallet detected', wallets[0].connectorType)
                await executeCoinbaseTransactions(contractCalls)
            } else {
                console.log('Non-Coinbase wallet detected')
                await executeEoaTransactions(contractCalls)
            }
        },
        [walletType, wallets, executeCoinbaseTransactions, executeEoaTransactions],
    )

    return {
        executeTransactions,
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
