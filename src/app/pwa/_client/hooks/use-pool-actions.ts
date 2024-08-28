import { currentPoolAddress } from '@/app/pwa/_server/blockchain/server-config'
import { useAuth } from './use-auth'
import useTransactions from './use-smart-transaction'
import { poolAbi, useReadDropletBalanceOf } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import { Address, parseUnits } from 'viem'
import { toast } from 'sonner'

export function usePoolActions(poolId: bigint, poolPrice: number, tokenDecimals: number) {
    const { login, authenticated } = useAuth()
    const { executeTransactions, isConfirmed, isPending, isReady } = useTransactions()
    const { wallets } = useWallets()
    const { data: userBalance, error: balanceError } = useReadDropletBalanceOf({
        args: [(wallets[0]?.address as Address) || '0x'],
    })

    const handleEnableDeposits = async () => {
        toast('Enabling deposits...')

        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'enableDeposit',
                args: [poolId],
            },
        ])
    }

    const handleStartPool = async () => {
        toast('Starting pool...')

        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'startPool',
                args: [poolId],
            },
        ])
    }

    const handleEndPool = async () => {
        toast('Ending pool...')

        executeTransactions([
            {
                address: currentPoolAddress,
                abi: poolAbi,
                functionName: 'endPool',
                args: [poolId],
            },
        ])
    }

    const handleJoinPool = async () => {
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
                toast('Insufficient funds, please top up your account.')
                return
            }

            console.log('Onramp funds if needed')

            console.log('Join pool')
            toast('Joining pool...')

            executeTransactions([
                {
                    address: currentPoolAddress,
                    abi: poolAbi,
                    functionName: 'deposit',
                    args: [poolId, bigIntPrice],
                },
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
    }
}
