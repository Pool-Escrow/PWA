import useTransactions from '@/hooks/use-transactions'
import type { ContractCall } from '@/lib/entities/models/contract-call'
import { useWallets } from '@privy-io/react-auth'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CONFIG } from '../_components/config'
import type { BridgeInfo, Network, Token } from '../types'

export function useCrossChainSwap() {
    const { wallets } = useWallets()
    const { executeTransactions, isConfirmed, result } = useTransactions()

    // Initial states using configuration
    const [fromNetwork, setFromNetwork] = useState<Network>({
        chainId: CONFIG.CHAIN.BASE.chainId,
        chainName: CONFIG.CHAIN.BASE.chainName,
        platformId: CONFIG.CHAIN.BASE.platformId,
        nativeCurrency: CONFIG.CHAIN.BASE.nativeCurrency,
        rpcUrls: [...CONFIG.CHAIN.BASE.rpcUrls],
        blockExplorerUrls: [...CONFIG.CHAIN.BASE.blockExplorerUrls],
    })
    const [fromToken, setFromToken] = useState<Token>(CONFIG.CHAIN.BASE.tokens.USDC)
    const [fromAmount, setFromAmount] = useState('0.0')
    const [receivedAmount, setReceivedAmount] = useState('0.0')
    const [isApproved, setIsApproved] = useState(false)
    const [routerInfo, setRouterInfo] = useState<BridgeInfo | null>(null)

    // Handlers
    const handleApproveBridge = useCallback(async () => {
        if (!wallets?.[0]?.address) {
            toast.error('Please connect your wallet first')
            return
        }

        try {
            const approveCall: ContractCall = {
                address: fromToken.tokenContractAddress as `0x${string}`,
                abi: [], // TODO: Add ERC20 ABI
                functionName: 'approve',
                args: [CONFIG.CHAIN.BASE.routerAddress, fromAmount],
            }

            await executeTransactions([approveCall], {
                type: 'TRANSFER_TOKEN',
                onSuccess: () => setIsApproved(true),
            })
        } catch (error) {
            console.error('Error approving bridge:', error)
            toast.error('Failed to approve bridge')
            setIsApproved(false)
        }
    }, [wallets, fromToken, fromAmount, executeTransactions])

    const handleSwap = useCallback(async () => {
        if (!isApproved) {
            toast.error('Please approve the bridge first')
            return
        }

        if (!wallets?.[0]?.address) {
            toast.error('Please connect your wallet first')
            return
        }

        try {
            const swapCall: ContractCall = {
                address: CONFIG.CHAIN.BASE.routerAddress,
                abi: [], // TODO: Add Router ABI
                functionName: 'swap',
                args: [fromToken.tokenContractAddress, fromAmount],
            }

            await executeTransactions([swapCall], {
                type: 'TRANSFER_TOKEN',
                onSuccess: () => {
                    if (routerInfo) {
                        setReceivedAmount(routerInfo.rate.to.amount)
                    }
                },
            })
        } catch (error) {
            console.error('Error executing swap:', error)
            toast.error('Failed to execute swap')
        }
    }, [isApproved, wallets, fromToken, fromAmount, routerInfo, executeTransactions])

    const handleAmountChange = useCallback((amount: string) => {
        setFromAmount(amount)
        // TODO: Implement quote fetching logic here
        // This should update receivedAmount and routerInfo based on the new amount
    }, [])

    const handleNetworkChange = useCallback((network: Network) => {
        setFromNetwork(network)
        // Reset related states
        setFromAmount('0.0')
        setReceivedAmount('0.0')
        setIsApproved(false)
        setRouterInfo(null)
    }, [])

    const handleTokenChange = useCallback((token: Token) => {
        setFromToken(token)
        // Reset related states
        setFromAmount('0.0')
        setReceivedAmount('0.0')
        setIsApproved(false)
        setRouterInfo(null)
    }, [])

    return {
        // States
        fromNetwork,
        fromToken,
        fromAmount,
        receivedAmount,
        isApproved,
        routerInfo,
        isConfirmed,
        transactionResult: result,

        // Handlers
        handleNetworkChange,
        handleTokenChange,
        handleAmountChange,
        handleApproveBridge,
        handleSwap,
    }
}
