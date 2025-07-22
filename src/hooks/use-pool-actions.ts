import useTransactions from '@/hooks/use-transactions'
import { deposit } from '@/lib/blockchain/functions/pool/deposit'
import { approve } from '@/lib/blockchain/functions/token/approve'
import { currentPoolAddress, currentTokenAddress } from '@/server/blockchain/server-config'
import { poolAbi, tokenAbi } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Address, Hash } from 'viem'
import { parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAuth } from './use-auth'
import { useWalletConnectionStatus } from './use-wallet-connection-status'

type UsePoolActionsProps = {
    poolId: string
    poolPrice: number
    tokenDecimals: number
    openOnRampDialog: () => void
    onSuccessfulJoin: () => void
}

export function usePoolActions({
    poolId,
    poolPrice,
    tokenDecimals,
    openOnRampDialog,
    onSuccessfulJoin,
}: UsePoolActionsProps) {
    const { login, authenticated } = useAuth()
    const { executeTransactions, isReady, resetConfirmation, result } = useTransactions()
    const { wallets } = useWallets()
    const { isStable: isWalletStable } = useWalletConnectionStatus()

    // Get wallet address safely
    const walletAddress = wallets[0]?.address as Address

    // Only proceed with balance query if we have valid prerequisites
    const canFetchBalance = Boolean(walletAddress && walletAddress !== '0x')

    // Debug log for balance check - only when we actually make the request
    if (process.env.NODE_ENV === 'development' && canFetchBalance) {
        console.log('[DEBUG][usePoolActions] useReadContract balanceOf', {
            address: walletAddress,
            tokenAddress: currentTokenAddress,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
            timestamp: new Date().toISOString(),
        })
    }

    const { data: userBalance, error: balanceError } = useReadContract({
        address: currentTokenAddress,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [walletAddress || '0x'],
        query: {
            enabled: canFetchBalance,
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false, // ✅ DISABLED automatic polling to prevent excessive requests
            retry: (failureCount, error) => {
                // Don't retry on 403 Forbidden errors or rate limit errors
                if (
                    error?.message?.includes('403') ||
                    error?.message?.includes('Forbidden') ||
                    error?.message?.includes('429') ||
                    error?.message?.includes('rate limit')
                ) {
                    return false
                }
                return failureCount < 1
            },
        },
    })

    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })

    useEffect(() => {
        console.log('📝 [usePoolActions] Transaction receipt updated:', receipt)
    }, [receipt])

    useEffect(() => {
        console.log('🔄 [usePoolActions] Transaction status:', { isConfirming, isConfirmed })
    }, [isConfirming, isConfirmed])

    const [isCancelled, setIsCancelled] = useState(false)

    const router = useRouter()

    const handleEnableDeposits = () => {
        console.log('🔓 [usePoolActions] Enabling deposits for pool:', poolId)
        toast('Enabling deposits...')

        executeTransactions(
            [
                {
                    address: currentPoolAddress,
                    abi: poolAbi,
                    functionName: 'enableDeposit',
                    args: [BigInt(poolId)],
                },
            ],
            {
                type: 'ENABLE_DEPOSITS',
                onSuccess: () => {
                    toast.success('Deposits enabled successfully!')
                    router.refresh()
                },
            },
        )
            .then(() => {
                console.log('🔄 [usePoolActions] Deposits enabled successfully!')
            })
            .catch(error => {
                console.error('❌ [usePoolActions] Error enabling deposits:', error)
            })
    }

    const handleStartPool = () => {
        console.log('▶️ [usePoolActions] Starting pool:', poolId)
        toast('Starting pool...')

        executeTransactions(
            [
                {
                    address: currentPoolAddress,
                    abi: poolAbi,
                    functionName: 'startPool',
                    args: [poolId],
                },
            ],
            {
                type: 'START_POOL',
                onSuccess: () => {
                    toast.success('Pool started successfully!')
                    router.refresh()
                },
            },
        )
            .then(() => {
                console.log('🔄 [usePoolActions] Pool started successfully!')
            })
            .catch(error => {
                console.error('❌ [usePoolActions] Error starting pool:', error)
            })
    }

    const handleEndPool = () => {
        console.log('⏹️ [usePoolActions] Ending pool:', {
            poolId,
            isReady,
            authenticated,
            walletConnected: Boolean(wallets[0]),
        })

        if (!isReady || !authenticated || !wallets[0]) {
            console.error('❌ [usePoolActions] Wallet not ready or not authenticated')
            toast.error('Please ensure your wallet is connected')
            return
        }

        toast('Ending pool...')

        executeTransactions(
            [
                {
                    address: currentPoolAddress,
                    abi: poolAbi,
                    functionName: 'endPool',
                    args: [BigInt(poolId)],
                },
            ],
            {
                type: 'END_POOL',
                onSuccess: () => {
                    toast.success('Pool ended successfully!')
                    router.refresh()
                },
            },
        )
            .then(() => {
                console.log('🔄 [usePoolActions] Pool ended successfully!')
            })
            .catch(error => {
                console.error('❌ [usePoolActions] Error ending pool:', error)
            })
    }

    useEffect(() => {
        if (result.error) {
            console.log('❌ [usePoolActions] Transaction error:', result.error)
            if (result.error.message.includes('user rejected transaction')) {
                console.log('🚫 [usePoolActions] User rejected transaction')
                setIsCancelled(true)
            }
        } else {
            setIsCancelled(false)
        }
    }, [result.error])

    const handleJoinPool = () => {
        console.log('🎯 [usePoolActions] Join pool button clicked')

        if (!isReady) {
            console.log('⚠️ [usePoolActions] Wallet not ready')
            toast.error('Wallet not ready. Please wait a moment and try again.')
            return
        }

        if (!authenticated) {
            console.log('🔑 [usePoolActions] Not authenticated, initiating login')
            login()
            return
        }

        if (!wallets[0]?.address) {
            console.error('❌ [usePoolActions] No wallet address available')
            toast.error('Wallet not connected. Please refresh the page and try again.')
            return
        }

        if (!wallets[0]?.connectorType) {
            console.error('❌ [usePoolActions] Wallet connector not available')
            toast.error('Wallet connection issue. Please refresh the page and reconnect your wallet.')
            return
        }

        if (!isWalletStable) {
            console.warn('⚠️ [usePoolActions] Wallet connection unstable')
            toast.error(
                'Wallet connection is unstable. Please refresh the page to ensure a stable connection before proceeding.',
                {
                    action: {
                        label: 'Refresh',
                        onClick: () => window.location.reload(),
                    },
                    duration: 8000,
                },
            )
            return
        }

        console.log('💰 [usePoolActions] Checking funds...')
        const bigIntPrice = parseUnits(poolPrice.toFixed(20), tokenDecimals)
        console.log('💵 [usePoolActions] Required amount:', bigIntPrice.toString())
        console.log('💵 [usePoolActions] User balance:', userBalance?.toString())

        if (balanceError) {
            console.error('❌ [usePoolActions] Balance check error:', balanceError)
            toast.error('Unable to check balance. Please refresh the page and try again.')
            return
        }

        if (Number(userBalance || 0) < bigIntPrice) {
            console.log('⚠️ [usePoolActions] Insufficient funds')
            toast('Insufficient funds, please top up your account.')
            openOnRampDialog()
            return
        }

        try {
            console.log('🚀 [usePoolActions] Join pool')
            toast('Joining pool...')

            const transactions = [
                ...(bigIntPrice > 0
                    ? [approve({ spender: currentPoolAddress, amount: bigIntPrice.toString() })]
                    : ([] as const)),
                deposit({ poolId, amount: bigIntPrice.toString() }),
            ]
            console.log('📝 [usePoolActions] Transaction payload:', transactions)

            executeTransactions(transactions, {
                type: 'JOIN_POOL',
                onSuccess: () => {
                    console.log('✅ [usePoolActions] Join pool transaction submitted successfully')
                },
            }).catch((error: unknown) => {
                console.error('❌ [usePoolActions] Error joining pool:', error)

                const errorMessage = error instanceof Error ? error.message : String(error)
                if (errorMessage.includes('Connector not connected')) {
                    toast.error('Wallet connection lost. Please refresh the page to reconnect.', {
                        action: {
                            label: 'Refresh',
                            onClick: () => window.location.reload(),
                        },
                        duration: 8000,
                    })
                } else if (errorMessage.includes('user rejected')) {
                    toast.error('Transaction was cancelled.')
                } else {
                    toast.error('Failed to join pool. Please try again.')
                }
            })

            if (result.hash) {
                console.log('⏳ [usePoolActions] Transaction submitted, waiting for confirmation')
                toast.loading('Confirming transaction...')
            }
        } catch (error) {
            console.error('❌ [usePoolActions] Transaction failed:', error)

            if (error instanceof Error && error.message?.includes('Connector not connected')) {
                toast.error('Wallet connection lost. Please refresh the page to reconnect.', {
                    action: {
                        label: 'Refresh',
                        onClick: () => window.location.reload(),
                    },
                    duration: 8000,
                })
            } else {
                toast.error('Failed to join pool. Please try again.')
            }
        }
    }

    useEffect(() => {
        if (isConfirmed && result.transactionType) {
            console.log('✅ [usePoolActions] Transaction confirmed:', result.transactionType)

            if (result.transactionType === 'JOIN_POOL') {
                console.log('🎯 [usePoolActions] Join pool confirmed, calling onSuccessfulJoin')
                toast.success('Successfully joined pool!')
                onSuccessfulJoin()
            }

            router.refresh()
        }
    }, [isConfirmed, result.transactionType, onSuccessfulJoin, router])

    const resetJoinPoolProcess = () => {
        console.log('🔄 [usePoolActions] Resetting join pool process')
        resetConfirmation()
        setIsCancelled(false)
    }

    return {
        handleEnableDeposits,
        handleStartPool,
        handleEndPool,
        handleJoinPool,
        resetJoinPoolProcess,
        ready: isReady,
        isPending: result.isLoading,
        isConfirmed,
        resetConfirmation,
        isConfirming,
        isCancelled,
    }
}
