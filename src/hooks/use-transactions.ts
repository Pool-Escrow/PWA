import type { ContractCall } from '@/lib/entities/models/contract-call'
import { useWallets } from '@privy-io/react-auth'
import { ConnectorNotConnectedError, getPublicClient } from '@wagmi/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Hash, PublicClient, TransactionReceipt } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'
import { useAppStore } from '../providers/app-store.provider'
import { getConfig } from '../providers/configs/wagmi.config'

interface SmartTransactionResult {
    hash: Hash | null
    receipt: TransactionReceipt | null
    isLoading: boolean
    isError: boolean
    error: Error | null
}

interface TransactionConfig {
    type:
        | 'CLAIM_WINNING'
        | 'CLAIM_WINNINGS'
        | 'CREATE_POOL'
        | 'ENABLE_DEPOSITS'
        | 'END_POOL'
        | 'JOIN_POOL'
        | 'SET_WINNER'
        | 'SET_WINNERS'
        | 'START_POOL'
        | 'TRANSFER_TOKEN'
        | 'UNREGISTER_POOL'
    onSuccess?: () => void
}

export default function useTransactions() {
    const transactionInProgressRef = useRef(false)

    const {
        data: paymasterRequest,
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

    const [result, setResult] = useState<SmartTransactionResult>({
        hash: null,
        receipt: null,
        isLoading: false,
        isError: false,
        error: null,
    })

    const paymasterRequestId = paymasterRequest?.id

    // Debug log for calls status polling - only when we actually make the request
    if (process.env.NODE_ENV === 'development' && paymasterRequestId) {
        console.log('[DEBUG][useTransactions] useCallsStatus polling', {
            paymasterRequestId,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
            timestamp: new Date().toISOString(),
        })
    }

    const { data: callsStatus } = useCallsStatus({
        id: paymasterRequestId ?? '',
        query: {
            enabled: Boolean(paymasterRequestId),
            // Optimized polling: start with 2s intervals, stop when confirmed
            refetchInterval: data => {
                const status = data?.state.data?.status as string
                if (status === 'CONFIRMED' || status === 'FAILED') {
                    return false // Stop polling when transaction is final
                }
                return 2000 // Poll every 2 seconds instead of 1 second to reduce load
            },
            // Add retry logic for better reliability
            retry: (failureCount, error) => {
                if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
                    return false
                }
                return failureCount < 2
            },
            staleTime: 0, // Always get fresh data for transaction status
            gcTime: 60_000, // Keep in cache for 1 minute only
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

    useEffect(() => {
        if (
            callsStatus &&
            (callsStatus.status as string) === 'CONFIRMED' &&
            callsStatus.receipts &&
            callsStatus.receipts.length > 0
        ) {
            const paymasterReceipt = callsStatus.receipts[0]
            console.log('✅ [useTransactions] Paymaster transaction confirmed:', {
                hash: paymasterReceipt.transactionHash,
                blockNumber: paymasterReceipt.blockNumber,
                gasUsed: paymasterReceipt.gasUsed.toString(),
            })
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
            console.log('🔄 [useTransactions] Executing Coinbase transaction with calls:', contractCalls)

            try {
                console.log('🔍 [useTransactions] Checking wallet state:', {
                    walletsReady,
                    hasWallet: Boolean(wallets[0]),
                    walletAddress: wallets[0]?.address,
                })

                setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

                if (!walletsReady || !wallets[0]) {
                    console.error('❌ [useTransactions] Wallet not connected')
                    throw new Error('Wallet not connected')
                }

                console.log('📝 [useTransactions] Submitting transaction to Coinbase with payload:', {
                    contracts: contractCalls,
                    paymasterUrl: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                })

                const response = await writeContractsAsync({
                    contracts: contractCalls,
                    capabilities: {
                        paymasterService: {
                            url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL as string,
                        },
                    },
                })
                console.log('✅ [useTransactions] Coinbase transaction response:', response)

                const txHash = (
                    typeof response === 'string'
                        ? response
                        : ((response as { hash?: string; id?: string }).hash ??
                          (response as { hash?: string; id?: string }).id ??
                          '')
                ) as `0x${string}`

                setResult(prev => ({ ...prev, hash: txHash }))
            } catch (error) {
                console.error('❌ [useTransactions] Coinbase transaction error:', error)
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))
                throw error
            } finally {
                console.log('🔄 [useTransactions] Cleaning up Coinbase transaction state')
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [writeContractsAsync, walletsReady, wallets],
    )

    const setTransactionInProgress = useAppStore(s => s.setTransactionInProgress)
    const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0)
    const [totalTransactions, setTotalTransactions] = useState(0)

    const publicClient = getPublicClient(getConfig())

    const executeEoaTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            console.log('🔄 [useTransactions] Executing EOA transactions:', contractCalls.length)
            setTotalTransactions(contractCalls.length)
            setCurrentTransactionIndex(0)
            setTransactionInProgress(true)

            try {
                for (const [index, call] of contractCalls.entries()) {
                    setCurrentTransactionIndex(index)

                    console.log(`📝 [useTransactions] Submitting EOA transaction ${index + 1}/${contractCalls.length}`)

                    const hash = await writeContractAsync(call)

                    // Update result with current transaction hash
                    setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null, hash }))

                    // Wait for transaction confirmation before proceeding
                    console.log(`⏳ [useTransactions] Waiting for confirmation of tx ${index + 1}`)
                    const receipt = await waitForTransactionReceipt(publicClient as PublicClient, {
                        hash,
                        confirmations: 1,
                        onReplaced: replacement => {
                            console.log('🔄 [useTransactions] Transaction replaced:', {
                                reason: replacement.reason,
                                oldHash: hash,
                                newHash: replacement.transaction.hash,
                            })
                            // Update hash if transaction was replaced
                            setResult(prev => ({
                                ...prev,
                                hash: replacement.transaction.hash,
                            }))
                        },
                    })

                    console.log(`✅ [useTransactions] EOA transaction ${index + 1} confirmed:`, {
                        hash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber,
                        gasUsed: receipt.gasUsed.toString(),
                    })

                    // Update result with confirmed receipt
                    setResult(prev => ({ ...prev, receipt }))

                    // If this was the last transaction, mark as confirmed
                    if (index === contractCalls.length - 1) {
                        setIsConfirmed(true)
                    }
                }
            } catch (error) {
                console.error('❌ [useTransactions] EOA transaction error:', error)
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))
                throw error
            } finally {
                setTransactionInProgress(false)
                setCurrentTransactionIndex(0)
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [writeContractAsync, publicClient, setTransactionInProgress, setCurrentTransactionIndex, setResult],
    )

    const [currentTransaction, setCurrentTransaction] = useState<TransactionConfig | null>(null)

    const executeTransactions = useCallback(
        async (contractCalls: ContractCall[], config: TransactionConfig) => {
            if (walletsReady && !Boolean(wallets[0])) {
                console.error('❌ [useTransactions] Wallet not ready or not connected')
                throw new Error('Wallet not ready or not connected')
            }
            try {
                setCurrentTransaction(config)
                transactionInProgressRef.current = true
                setTransactionInProgress(true)

                const walletType = wallets[0]?.connectorType
                console.log('🔍 [useTransactions] Using wallet type:', walletType)

                if (walletType === 'coinbase_wallet') {
                    await executeCoinbaseTransactions(contractCalls)
                } else {
                    await executeEoaTransactions(contractCalls)
                }
            } catch (error) {
                console.error('❌ [useTransactions] Transaction execution failed:', error)

                if (error instanceof ConnectorNotConnectedError) {
                    console.log('🔌 [useTransactions] Connector not connected, suggesting refresh')
                    toast.error('Wallet connection lost. Please refresh the page to reconnect.', {
                        action: {
                            label: 'Refresh',
                            onClick: () => window.location.reload(),
                        },
                        duration: 5000,
                    })
                }

                throw error
            } finally {
                setTimeout(() => {
                    transactionInProgressRef.current = false
                    setTransactionInProgress(false)
                    setCurrentTransaction(null)
                }, 500)
            }
        },
        [walletsReady, wallets, setTransactionInProgress, executeCoinbaseTransactions, executeEoaTransactions],
    )

    // Add reset function
    const reset = useCallback(() => {
        setResult({
            hash: null,
            receipt: null,
            isLoading: false,
            isError: false,
            error: null,
        })
        setIsConfirmed(false)
        setCurrentTransaction(null)
        transactionInProgressRef.current = false
        setTransactionInProgress(false)
    }, [setTransactionInProgress])

    // Add cleanup effect
    useEffect(() => {
        return () => {
            reset()
        }
    }, [reset])

    // Add this effect to handle cleanup on unmount or when transaction completes
    useEffect(() => {
        const cleanup = () => {
            setTransactionInProgress(false)
            transactionInProgressRef.current = false
            setCurrentTransaction(null)
        }

        if (isConfirmed) {
            setTimeout(cleanup, 3000)
        }

        return cleanup
    }, [isConfirmed, setTransactionInProgress])

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
            transactionType: currentTransaction?.type,
        },
        currentTransactionIndex,
        totalTransactions,
    }
}
