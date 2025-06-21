import { useWallets } from '@privy-io/react-auth'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { Hash, PublicClient, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'
import type { ContractCall } from '@/app/_lib/entities/models/contract-call'
import { useAppStore } from '../providers/app-store.provider'
import { waitForTransactionReceipt } from 'viem/actions'
import { getPublicClient } from '@wagmi/core'
import { getConfig } from '../providers/configs/wagmi.config'
import { ConnectorNotConnectedError } from '@wagmi/core'
import { toast } from 'sonner'

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

    useEffect(() => {
        if (callsStatus?.status === 'CONFIRMED' && callsStatus.receipts && callsStatus.receipts.length > 0) {
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
                            url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                        },
                    },
                })
                console.log('✅ [useTransactions] Coinbase transaction response:', response)
                setResult(prev => ({ ...prev, hash: response as `0x${string}` }))
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

    const executeEoaTransactions = async (contractCalls: ContractCall[]) => {
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
    }

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
        [walletsReady, wallets, executeCoinbaseTransactions, executeEoaTransactions],
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
            // Dar tiempo para que los toasts de éxito se muestren
            setTimeout(cleanup, 3000)
        }

        return cleanup
    }, [isConfirmed, setTransactionInProgress])

    useEffect(() => {
        console.log('👀 [useTransactions] Effect: Transaction status changed', {
            isConfirmed,
            transactionInProgressRef: transactionInProgressRef.current,
        })

        const cleanup = () => {
            console.log('🧹 [useTransactions] Cleanup triggered')
            setTransactionInProgress(false)
            transactionInProgressRef.current = false
            setCurrentTransaction(null)
        }

        if (isConfirmed) {
            console.log('✅ [useTransactions] Transaction confirmed, scheduling cleanup')
            setTimeout(cleanup, 3000)
        }

        return cleanup
    }, [isConfirmed])

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
