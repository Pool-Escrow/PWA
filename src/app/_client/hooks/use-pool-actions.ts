import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { useAuth } from './use-auth'
import useTransactions from './use-smart-transaction'
import { poolAbi, tokenAbi } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { approve } from '@/app/_lib/blockchain/functions/token/approve'
import { deposit } from '@/app/_lib/blockchain/functions/pool/deposit'
import { useReadContract } from 'wagmi'

export function usePoolActions(
    poolId: bigint,
    poolPrice: number,
    tokenDecimals: number,
    openOnRampDialog: () => void,
    onSuccessfulJoin: () => void,
) {
    const { login, authenticated } = useAuth()
    const { executeTransactions, isConfirmed, isPending, isReady, resetConfirmation, result } = useTransactions()
    const { wallets } = useWallets()
    const { data: userBalance, error: balanceError } = useReadContract({
        address: currentTokenAddress,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [(wallets[0]?.address as Address) || '0x'],
        query: {
            enabled: Boolean(wallets[0]?.address),
            refetchInterval: 20_000, // 10 seconds
        },
    })

    const handleEnableDeposits = () => {
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

    const handleJoinPool = () => {
        console.log('Join pool button clicked')

        if (!isReady) {
            console.log('[use-pool-actions] Wallet not ready')
            return
        }

        if (isReady && !authenticated) {
            console.log('Login first')
            login()
        }

        if (isReady && authenticated) {
            console.log('Checking funds...')

            const bigIntPrice = parseUnits(poolPrice.toString(), tokenDecimals)
            console.log('Big int price:', bigIntPrice.toString())

            if (balanceError) {
                console.error('Error reading balance', balanceError)
                return
            }

            console.log('User balance number:', Number(userBalance || 0))
            console.log('Big int price:', bigIntPrice.toString())
            console.log('Is onramp needed?', Number(userBalance || 0) < bigIntPrice)

            if (Number(userBalance || 0) < bigIntPrice) {
                console.log('Onramp funds if needed')
                toast('Insufficient funds, please top up your account.')
                openOnRampDialog() // Call the openOnRampDialog function
                return
            }

            console.log('Join pool')
            toast('Joining pool...')

            void executeTransactions([
                ...(bigIntPrice > 0 ? [approve({ spender: currentPoolAddress, amount: bigIntPrice })] : []),
                deposit({ poolId, amount: bigIntPrice }),
            ]).then(() => {
                onSuccessfulJoin()
            })
        }
    }

    const resetJoinPoolProcess = () => {
        resetConfirmation()
    }

    const ready = isReady

    return {
        handleEnableDeposits,
        handleStartPool,
        handleEndPool,
        handleJoinPool,
        resetJoinPoolProcess,
        ready,
        isPending: result.isLoading,
        isConfirmed,
        resetConfirmation,
    }
}
