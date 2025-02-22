import type { ContractCall } from '@/app/_lib/entities/models/contract-call'
import { appActions } from '@/app/stores/app.store'
import { useWallets } from '@privy-io/react-auth'
import { ConnectorNotConnectedError, getPublicClient } from '@wagmi/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Hash, PublicClient, TransactionReceipt } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'
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

// Constant for debug logs
const DEBUG = process.env.NODE_ENV === 'development'

export default function useTransactions() {
    const transactionInProgressRef = useRef(false)
    const {
        data: id,
        writeContractsAsync,
        isPending: isPaymasterPending,
    } = useWriteContracts({
        mutation: {
            onMutate(variables) {
                if (DEBUG) {
                    console.log('Optimistic update here', variables)
                }
            },
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
    const [currentTransaction, setCurrentTransaction] = useState<TransactionConfig | null>(null)
    const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0)
    const [totalTransactions, setTotalTransactions] = useState(0)

    // Unify confirmation effects
    useEffect(() => {
        if (callsStatus?.status === 'CONFIRMED' && callsStatus.receipts?.[0]) {
            const paymasterReceipt = callsStatus.receipts[0]
            if (DEBUG) {
                console.log('✅ [useTransactions] Paymaster transaction confirmed:', {
                    hash: paymasterReceipt.transactionHash,
                    blockNumber: paymasterReceipt.blockNumber,
                    gasUsed: paymasterReceipt.gasUsed.toString(),
                })
            }
            setResult(prev => ({ ...prev, hash: paymasterReceipt.transactionHash }))
            setIsConfirmed(true)
        }
    }, [callsStatus])

    useEffect(() => {
        if (isEoaConfirmed) {
            if (DEBUG) {
                console.log('Transaction confirmed by EOA')
            }
            setIsConfirmed(true)
        }
    }, [isEoaConfirmed])

    useEffect(() => {
        if (hash) {
            if (DEBUG) {
                console.log('Hash updated from writeContract:', hash)
            }
            setResult(prev => ({ ...prev, hash }))
        }
    }, [hash])

    // Unify cleanup logic in a single effect
    useEffect(() => {
        if (DEBUG) {
            console.log('👀 [useTransactions] Transaction status changed:', {
                isConfirmed,
                transactionInProgressRef: transactionInProgressRef.current,
            })
        }

        let cleanupTimeout: NodeJS.Timeout | undefined

        const cleanup = () => {
            if (DEBUG) {
                console.log('🧹 [useTransactions] Cleanup triggered')
            }
            appActions.setTransactionInProgress(false)
            transactionInProgressRef.current = false
            setCurrentTransaction(null)
            setResult({
                hash: null,
                receipt: null,
                isLoading: false,
                isError: false,
                error: null,
            })
            setIsConfirmed(false)
            setCurrentTransactionIndex(0)
            setTotalTransactions(0)
        }

        if (isConfirmed) {
            if (DEBUG) {
                console.log('✅ [useTransactions] Transaction confirmed, scheduling cleanup')
            }
            cleanupTimeout = setTimeout(cleanup, 3000)
        }

        return () => {
            if (cleanupTimeout) {
                clearTimeout(cleanupTimeout)
            }
            cleanup()
        }
    }, [isConfirmed])

    // Memoizamos las funciones principales
    const executeCoinbaseTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            if (DEBUG) {
                console.log('🔄 [useTransactions] Executing Coinbase transaction with calls:', contractCalls)
            }

            try {
                if (!walletsReady || !wallets[0]) {
                    throw new Error('Wallet not connected')
                }

                setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

                const response = await writeContractsAsync({
                    contracts: contractCalls,
                    capabilities: {
                        paymasterService: {
                            url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                        },
                    },
                })

                setResult(prev => ({ ...prev, hash: response as `0x${string}` }))
            } catch (error) {
                if (DEBUG) {
                    console.error('❌ [useTransactions] Coinbase transaction error:', error)
                }
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))
                throw error
            } finally {
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [writeContractsAsync, walletsReady, wallets],
    )

    const executeEoaTransactions = useCallback(
        async (contractCalls: ContractCall[]) => {
            if (DEBUG) {
                console.log('🔄 [useTransactions] Executing EOA transactions:', contractCalls.length)
            }
            setTotalTransactions(contractCalls.length)
            setCurrentTransactionIndex(0)
            appActions.setTransactionInProgress(true)

            try {
                for (const [index, call] of contractCalls.entries()) {
                    setCurrentTransactionIndex(index)
                    const hash = await writeContractAsync(call)
                    setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null, hash }))

                    const receipt = await waitForTransactionReceipt(getPublicClient(getConfig()) as PublicClient, {
                        hash,
                        confirmations: 1,
                        onReplaced: replacement => {
                            setResult(prev => ({
                                ...prev,
                                hash: replacement.transaction.hash,
                            }))
                        },
                    })

                    setResult(prev => ({ ...prev, receipt }))

                    if (index === contractCalls.length - 1) {
                        setIsConfirmed(true)
                    }
                }
            } catch (error) {
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))
                throw error
            } finally {
                appActions.setTransactionInProgress(false)
                setCurrentTransactionIndex(0)
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [writeContractAsync],
    )

    const executeTransactions = useCallback(
        async (contractCalls: ContractCall[], config: TransactionConfig) => {
            if (walletsReady && !wallets[0]) {
                throw new Error('Wallet not ready or not connected')
            }

            try {
                setCurrentTransaction(config)
                transactionInProgressRef.current = true
                appActions.setTransactionInProgress(true)

                const walletType = wallets[0]?.connectorType
                await (walletType === 'coinbase_wallet'
                    ? executeCoinbaseTransactions(contractCalls)
                    : executeEoaTransactions(contractCalls))
            } catch (error) {
                if (error instanceof ConnectorNotConnectedError) {
                    toast.error('Wallet connection lost. Please refresh the page to reconnect.', {
                        action: {
                            label: 'Refresh',
                            onClick: () => window.location.reload(),
                        },
                        duration: 5000,
                    })
                }
                throw error
            }
        },
        [walletsReady, wallets, executeCoinbaseTransactions, executeEoaTransactions],
    )

    const resetConfirmation = useCallback(() => {
        setIsConfirmed(false)
    }, [])

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
