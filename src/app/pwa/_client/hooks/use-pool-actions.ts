import { currentPoolAddress, currentTokenAddress } from '@/app/pwa/_server/blockchain/server-config'
import { useAuth } from './use-auth'
import useTransactions from './use-smart-transaction'
import { poolAbi, useReadDropletBalanceOf } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { approve } from '../../_lib/blockchain/functions/token/approve'
import { deposit } from '../../_lib/blockchain/functions/pool/deposit'

export function usePoolActions(
    poolId: bigint,
    poolPrice: number,
    tokenDecimals: number,
    openOnRampDialog: () => void
) {
    const { login, authenticated } = useAuth()
    const { executeTransactions, isConfirmed, isPending, isReady, resetConfirmation } = useTransactions()
    const { wallets } = useWallets()
    const { data: userBalance, error: balanceError } = useReadDropletBalanceOf({
        args: [(wallets[0]?.address as Address) || '0x'],
        query: {
            enabled: Boolean(wallets[0]?.address),
            refetchInterval: 10_000, // 10 seconds
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
            console.log('Check funds')

            const bigIntPrice = parseUnits(poolPrice.toString(), tokenDecimals)
            console.log('Big int price:', bigIntPrice.toString())

            if (balanceError) {
                console.error('Error reading balance', balanceError)
                return
            }

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
            ])
        }
    }

    const ready = isReady

    return {
        handleEnableDeposits,
        handleStartPool,
        handleEndPool,
        handleJoinPool,
        ready,
        isPending,
        isConfirmed,
        resetConfirmation,
    }
}
