import type { ContractCall } from '@/lib/entities/models/contract-call'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Hash, TransactionReceipt } from 'viem'
import { encodeFunctionData } from 'viem'
import { useAppStore } from '../providers/app-store.provider'

interface SmartTransactionResult {
    hash: Hash | null
    receipt: TransactionReceipt | null
    isLoading: boolean
    isError: boolean
    error: Error | null
    isConfirmed: boolean
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
    onError?: (error: Error) => void
    uiOptions?: {
        title?: string
        description?: string
        buttonText?: string
        showWalletUIs?: boolean
    }
}

export default function useSmartTransactions() {
    const { authenticated, ready: privyReady } = usePrivy()
    const { wallets, ready: walletsReady } = useWallets()
    const { client: smartWalletClient } = useSmartWallets()
    const setTransactionInProgress = useAppStore(s => s.setTransactionInProgress)

    const [result, setResult] = useState<SmartTransactionResult>({
        hash: null,
        receipt: null,
        isLoading: false,
        isError: false,
        error: null,
        isConfirmed: false,
    })

    const [currentTransaction, setCurrentTransaction] = useState<TransactionConfig | null>(null)

    // Smart wallet detection
    const hasSmartWallet =
        authenticated &&
        wallets.some(wallet => wallet.walletClientType === 'privy' && wallet.connectorType === 'embedded')

    const executeSmartWalletTransactions = useCallback(
        async (contractCalls: ContractCall[], config: TransactionConfig) => {
            if (!smartWalletClient) {
                throw new Error('Smart wallet client not available')
            }

            console.log('🔄 [useSmartTransactions] Executing smart wallet transaction with calls:', contractCalls)

            try {
                setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

                // For single transaction
                if (contractCalls.length === 1) {
                    const call = contractCalls[0]

                    // Encode function data if not already provided
                    const data =
                        call.data ||
                        encodeFunctionData({
                            abi: call.abi,
                            functionName: call.functionName,
                            args: call.args,
                        })

                    const hash = await smartWalletClient.sendTransaction(
                        {
                            to: call.address,
                            data,
                            value: call.value || 0n,
                        },
                        {
                            uiOptions: config.uiOptions || {
                                title: `${config.type.replace(/_/g, ' ')}`,
                                description: 'Please confirm this transaction in your wallet',
                                buttonText: 'Confirm Transaction',
                            },
                        },
                    )

                    console.log('✅ [useSmartTransactions] Smart wallet transaction submitted:', hash)
                    setResult(prev => ({ ...prev, hash, isConfirmed: true }))

                    if (config.onSuccess) {
                        config.onSuccess()
                    }

                    return hash
                } else {
                    // For batched transactions - this is the power of smart wallets!
                    const calls = contractCalls.map(call => {
                        const data =
                            call.data ||
                            encodeFunctionData({
                                abi: call.abi,
                                functionName: call.functionName,
                                args: call.args,
                            })

                        return {
                            to: call.address,
                            data,
                            value: call.value || 0n,
                        }
                    })

                    const hash = await smartWalletClient.sendTransaction(
                        {
                            calls,
                        },
                        {
                            uiOptions: config.uiOptions || {
                                title: `Batch ${config.type.replace(/_/g, ' ')}`,
                                description: `Executing ${calls.length} transactions in a single batch`,
                                buttonText: 'Confirm Batch Transaction',
                            },
                        },
                    )

                    console.log('✅ [useSmartTransactions] Smart wallet batch transaction submitted:', hash)
                    setResult(prev => ({ ...prev, hash, isConfirmed: true }))

                    if (config.onSuccess) {
                        config.onSuccess()
                    }

                    return hash
                }
            } catch (error) {
                console.error('❌ [useSmartTransactions] Smart wallet transaction error:', error)
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))

                if (config.onError) {
                    config.onError(error as Error)
                }

                throw error
            } finally {
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [smartWalletClient],
    )

    const executeLegacyTransactions = useCallback(
        (contractCalls: ContractCall[], config: TransactionConfig) => {
            console.log('🔄 [useSmartTransactions] Falling back to legacy transaction execution')

            // Fallback to the old transaction method if smart wallets are not available
            const wallet = wallets[0]
            if (!wallet) {
                throw new Error('No wallet available')
            }

            try {
                setResult(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

                // For legacy wallets, we recommend creating smart wallets instead
                toast.error('Smart wallet recommended', {
                    description: 'For better transaction experience, please create a smart wallet.',
                    action: {
                        label: 'Learn More',
                        onClick: () => {
                            window.open('https://docs.privy.io/guide/react/wallets/smart-wallets', '_blank')
                        },
                    },
                })

                throw new Error('Smart wallets provide better UX. Please create a smart wallet for this operation.')
            } catch (error) {
                console.error('❌ [useSmartTransactions] Legacy transaction error:', error)
                setResult(prev => ({
                    ...prev,
                    isError: true,
                    error: error as Error,
                }))

                if (config.onError) {
                    config.onError(error as Error)
                }

                throw error
            } finally {
                setResult(prev => ({ ...prev, isLoading: false }))
            }
        },
        [wallets],
    )

    const executeTransactions = useCallback(
        async (contractCalls: ContractCall[], config: TransactionConfig) => {
            if (!authenticated || !privyReady) {
                throw new Error('User not authenticated')
            }

            if (!walletsReady) {
                throw new Error('Wallets not ready')
            }

            try {
                setCurrentTransaction(config)
                setTransactionInProgress(true)

                if (hasSmartWallet && smartWalletClient) {
                    console.log('🚀 [useSmartTransactions] Using smart wallet for transaction')
                    await executeSmartWalletTransactions(contractCalls, config)
                } else {
                    console.log('⚠️ [useSmartTransactions] Smart wallet not available, using legacy method')
                    executeLegacyTransactions(contractCalls, config)
                }
            } catch (error) {
                console.error('❌ [useSmartTransactions] Transaction execution failed:', error)

                toast.error('Transaction failed. Please try again.', {
                    description: (error as Error).message,
                })

                throw error
            } finally {
                setTimeout(() => {
                    setTransactionInProgress(false)
                    setCurrentTransaction(null)
                }, 500)
            }
        },
        [
            authenticated,
            privyReady,
            walletsReady,
            hasSmartWallet,
            smartWalletClient,
            executeSmartWalletTransactions,
            executeLegacyTransactions,
            setTransactionInProgress,
        ],
    )

    const reset = useCallback(() => {
        setResult({
            hash: null,
            receipt: null,
            isLoading: false,
            isError: false,
            error: null,
            isConfirmed: false,
        })
        setCurrentTransaction(null)
        setTransactionInProgress(false)
    }, [setTransactionInProgress])

    // Cleanup effect
    useEffect(() => {
        return () => {
            reset()
        }
    }, [reset])

    return {
        executeTransactions,
        result,
        reset,
        isReady: privyReady && walletsReady,
        hasSmartWallet,
        currentTransaction,
        canBatch: hasSmartWallet, // Smart wallets support transaction batching
    }
}
