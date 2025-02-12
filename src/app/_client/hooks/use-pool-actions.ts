import useTransactions from '@/app/_client/hooks/use-transactions'
import { deposit } from '@/app/_lib/blockchain/functions/pool/deposit'
import { approve } from '@/app/_lib/blockchain/functions/token/approve'
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi, tokenAbi } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Address, Hash } from 'viem'
import { parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAuth } from './use-auth'

export function usePoolActions(
    poolId: string,
    poolPrice: number,
    tokenDecimals: number,
    openOnRampDialog: () => void,
    onSuccessfulJoin: () => void,
) {
    // console.log('🔄 [usePoolActions] Initializing with poolId:', poolId)

    const { login, authenticated } = useAuth()
    const { executeTransactions, isReady, resetConfirmation, result } = useTransactions()
    const { wallets } = useWallets()
    const { data: userBalance, error: balanceError } = useReadContract({
        address: currentTokenAddress,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [(wallets[0]?.address as Address) || '0x'],
        query: {
            enabled: Boolean(wallets[0]?.address),
            refetchInterval: 5_000,
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

    const handleJoinPool = async () => {
        console.log('🎯 [usePoolActions] Join pool button clicked')

        if (!isReady) {
            console.log('⚠️ [usePoolActions] Wallet not ready')
            return
        }

        if (isReady && !authenticated) {
            console.log('🔑 [usePoolActions] Not authenticated, initiating login')
            login()
            return
        }

        if (!wallets[0]?.address) {
            console.error('❌ [usePoolActions] No wallet address available')
            return
        }
        console.log('💰 [usePoolActions] Checking funds...')
        const bigIntPrice = parseUnits(poolPrice.toFixed(20), tokenDecimals)
        console.log('💵 [usePoolActions] Required amount:', bigIntPrice.toString())
        console.log('💵 [usePoolActions] User balance:', userBalance?.toString())

        if (balanceError) {
            console.error('❌ [usePoolActions] Balance check error:', balanceError)
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
                ...(bigIntPrice > 0 ? [approve({ spender: currentPoolAddress, amount: bigIntPrice.toString() })] : []),
                deposit({ poolId, amount: bigIntPrice.toString() }),
            ]
            console.log('📝 [usePoolActions] Transaction payload:', transactions)

            await executeTransactions(transactions, {
                type: 'JOIN_POOL',
                onSuccess: onSuccessfulJoin,
            })

            if (result.hash) {
                console.log('⏳ [usePoolActions] Transaction submitted, waiting for confirmation')
                toast.loading('Confirming transaction...')
            }
        } catch (error) {
            console.error('❌ [usePoolActions] Transaction failed:', error)
            toast.error('Failed to join pool. Please try again.')
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

            // Handle other transaction types if needed
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
