import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { useAuth } from './use-auth'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { poolAbi, tokenAbi } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import type { Address, Hash } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { approve } from '@/app/_lib/blockchain/functions/token/approve'
import { deposit } from '@/app/_lib/blockchain/functions/pool/deposit'
import { useReadContract } from 'wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'

export function usePoolActions(
    poolId: string,
    poolPrice: number,
    tokenDecimals: number,
    openOnRampDialog: () => void,
    onSuccessfulJoin: () => void,
) {
    console.log('🔄 [usePoolActions] Initializing with poolId:', poolId)

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

    const handleEnableDeposits = () => {
        console.log('🔓 [usePoolActions] Enabling deposits for pool:', poolId)
        toast('Enabling deposits...')

        void executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'enableDeposit',
                args: [poolId],
            },
        ])
    }

    const handleStartPool = () => {
        console.log('▶️ [usePoolActions] Starting pool:', poolId)
        toast('Starting pool...')

        void executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'startPool',
                args: [poolId],
            },
        ])
    }

    const handleEndPool = () => {
        console.log('⏹️ [usePoolActions] Ending pool:', poolId)
        toast('Ending pool...')

        void executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'endPool',
                args: [poolId],
            },
        ])
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
        const bigIntPrice = parseUnits(poolPrice.toString(), tokenDecimals)
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

            await executeTransactions(transactions)

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
        if (isConfirmed) {
            console.log('✅ [usePoolActions] Transaction confirmed, calling onSuccessfulJoin')
            toast.success('Successfully joined pool!')
            onSuccessfulJoin()
        }
    }, [isConfirmed, onSuccessfulJoin])

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
