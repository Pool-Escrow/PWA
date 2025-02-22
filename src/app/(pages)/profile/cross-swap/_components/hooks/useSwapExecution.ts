import { useWallets } from '@privy-io/react-auth'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { parseUnits, type Hash } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { useSwapContext } from '../../context/SwapContext'
import type { MMError, OKXApprovalData, OKXNetwork, OKXSwapData, OKXToken } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'
import { useApprovalStatus } from '../services/approval'
import { toHex } from '../utils/formatters'

interface SwapExecutionParams {
    fromNetwork: OKXNetwork
    fromToken: OKXToken | null
    fromAmount: string
    onSwapComplete: () => void
}

export const useSwapExecution = ({ fromNetwork, fromToken, fromAmount, onSwapComplete }: SwapExecutionParams) => {
    const { address } = useAccount()
    const { wallets } = useWallets()
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const { state, dispatch } = useSwapContext()

    const { isApproved } = useApprovalStatus({
        tokenContractAddress: fromToken?.tokenContractAddress || '',
        userAddress: address || '',
        totalAmount: fromAmount,
        chainId: Number(fromNetwork.chainId),
        decimals: Number(fromToken?.decimals),
    })

    // Update approval status whenever it changes
    useEffect(() => {
        dispatch({
            type: 'SET_APPROVAL_STATUS',
            payload: !!isApproved,
        })
    }, [isApproved, dispatch])

    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!walletClient || !address) {
                throw new Error('Please connect your wallet')
            }

            const httpClient = HttpClient.getInstance()
            const { path } = CONFIG.API.ENDPOINTS['approve']
            const approveAmount = parseUnits(fromAmount, Number(fromToken?.decimals)) * 4n

            const params = {
                chainId: fromNetwork.chainId,
                tokenContractAddress: fromToken?.tokenContractAddress,
                approveAmount: approveAmount.toString(),
            }

            // OKX API request to approve token
            const response = await httpClient.get<OKXApprovalData[]>(path, params)
            if (response.code !== '0') {
                toast.error(response.msg || 'Failed to approve token')
                toast.message('Please try again')
                throw new Error(response.msg || 'Failed to approve token')
            }

            const provider = await wallets[0].getEthereumProvider()
            // Add network validation
            const currentChainId = await walletClient.getChainId()
            if (currentChainId.toString() !== fromNetwork.chainId) {
                await walletClient.switchChain({ id: Number(fromNetwork.chainId) }).catch(err => {
                    if ((err as MMError).code === 4902) {
                        toast.error('Please switch to the correct network')
                        toast.message('Please add the network to your wallet')
                        throw new Error('Please add the network to your wallet')
                    }
                })
            }
            // Send the approval transaction
            const approvalData = response.data[0]
            const txRequest = {
                gas: toHex(BigInt(approvalData.gasLimit)),
                gasPrice: toHex(BigInt(approvalData.gasPrice)),
                from: wallets[0].address,
                to: fromToken?.tokenContractAddress,
                data: approvalData.data,
                value: '0x0',
            }
            const hash = await provider
                .request({
                    method: 'eth_sendTransaction',
                    params: [txRequest],
                })
                .then(res => {
                    return res as `0x${string}`
                })
                .catch(err => {
                    console.log('err', err)
                    throw new Error('Approval transaction failed')
                })
            // Esperar la confirmación
            console.log('hash', hash)
            const receipt = await publicClient?.waitForTransactionReceipt({ hash })
            if (receipt?.status !== 'success') {
                throw new Error('Approval transaction failed')
            }

            return hash
        },
        onSuccess: (hash: Hash) => {
            toast.success('Token approved successfully with hash: ' + hash)
        },
        onError: (error: Error) => {
            console.error('Approval error:', error)
            toast.error(error.message || 'Error approving token')
            dispatch({ type: 'SET_APPROVAL_STATUS', payload: false })
        },
    })

    const swapMutation = useMutation({
        mutationFn: async () => {
            if (!walletClient || !address) {
                throw new Error('Walzzzlet not connected')
            }

            if (!state.isApproved) {
                throw new Error('Token not approved')
            }

            // Ensure we are on the correct network
            await walletClient
                .switchChain({
                    id: Number(fromNetwork.chainId),
                })
                .catch(err => {
                    if ((err as MMError).code === 4902) {
                        toast.error('Please switch to the correct network')
                        toast.message('Please add the network to your wallet')
                        throw new Error('Please add the network to your wallet')
                    }
                })
            const provider = await wallets[0].getEthereumProvider()
            const httpClient = HttpClient.getInstance()
            const { path } = CONFIG.API.ENDPOINTS['swap']
            // Prepare the swap parameters
            const amount = parseUnits(fromAmount, Number(fromToken?.decimals))

            const params = {
                fromChainId: fromNetwork.chainId,
                toChainId: CONFIG.CHAIN.BASE.chainId, //'137', //
                fromTokenAddress: fromToken?.tokenContractAddress,
                toTokenAddress: CONFIG.CHAIN.BASE.tokens.USDC.tokenContractAddress, //'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', //
                amount: amount.toString(),
                slippage: '0.015',
                userWalletAddress: wallets[0].address,
            }
            // OKX API request to swap tokens
            const response = await httpClient.get<OKXSwapData[]>(path, params)
            console.log('response', response)
            if (response.code !== '0') {
                toast.error(response.msg || 'Failed to approve token')
                toast.message('Please try again')
                throw new Error(response.msg || 'Failed to approve token')
            }
            // Send the swap transaction
            const OKXTxData = response.data[0].tx
            const txRequest = {
                gas: toHex(BigInt(OKXTxData.gasLimit)),
                gasPrice: toHex(BigInt(OKXTxData.gasPrice)),
                from: OKXTxData.from,
                to: OKXTxData.to,
                data: OKXTxData.data,
                value: toHex(BigInt(OKXTxData.value)),
                chainId: toHex(Number(fromNetwork.chainId)),
            }
            console.log('txRequest', txRequest)
            const hash = await provider
                .request({
                    method: 'eth_sendTransaction',
                    params: [txRequest],
                })
                .then(res => {
                    console.log('res', res)
                    return res as `0x${string}`
                })
                .catch(err => {
                    console.log('err', err)
                    throw new Error('Swap transaction failed')
                })

            // Esperar la confirmación
            const receipt = await publicClient?.waitForTransactionReceipt({ hash })
            if (receipt?.status !== 'success') {
                throw new Error('Swap transaction failed')
            }

            return hash
        },
        onSuccess: (hash: Hash) => {
            toast.success('Swap executed successfully with hash: ' + hash)
            onSwapComplete()
        },
        onError: (error: Error) => {
            console.error('Swap error:', error)
            toast.error(error.message || 'Error executing swap')
        },
    })

    return {
        approve: () => approveMutation.mutate(),
        swap: () => swapMutation.mutate(),
        isApproving: approveMutation.isPending,
        isSwapping: swapMutation.isPending,
        approveError: approveMutation.error,
        swapError: swapMutation.error,
    }
}
