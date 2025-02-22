import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { OKXRoute, RouteCalculationProps } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'
import { useApprovalStatus } from '../services/approval'
import { handleAPIError } from '../utils/errors'
import { formatTime, toDecimals, toWholeNumber } from '../utils/formatters'

export function useRouteCalculation({
    fromNetwork,
    fromToken,
    fromAmount,
    walletAddress,
    dispatch,
}: RouteCalculationProps) {
    const { isApproved } = useApprovalStatus({
        tokenContractAddress: fromToken?.tokenContractAddress || '',
        userAddress: walletAddress || '',
        totalAmount: fromAmount,
        chainId: Number(fromNetwork.chainId),
        decimals: Number(fromToken?.decimals),
    })
    const calculateRoute = useCallback(async () => {
        if (!fromAmount || fromAmount === '0.0' || !walletAddress) {
            dispatch({ type: 'SET_RECEIVED_AMOUNT', payload: '0.0' })
            dispatch({ type: 'SET_ROUTER_INFO', payload: null })
            return
        }

        dispatch({ type: 'SET_LOADING', payload: true })

        try {
            const { path } = CONFIG.API.ENDPOINTS['route']
            const httpClient = HttpClient.getInstance()

            const params = {
                fromChainId: fromNetwork.chainId,
                toChainId: CONFIG.CHAIN.BASE.chainId,
                fromTokenAddress: fromToken?.tokenContractAddress,
                toTokenAddress: CONFIG.CHAIN.BASE.tokens.USDC.tokenContractAddress,
                amount: toDecimals(Number(fromAmount), Number(fromToken?.decimals)),
                slippage: '0.015',
            }

            const response = await httpClient.get<OKXRoute[]>(path, params)
            if (response.code === '0' && response.data[0].routerList?.[0]) {
                const routerResult = response.data[0].routerList[0]

                dispatch({
                    type: 'SET_RECEIVED_AMOUNT',
                    payload: toWholeNumber(
                        Number(routerResult.toTokenAmount),
                        Number(CONFIG.CHAIN.BASE.tokens.USDC.decimals),
                    ).toString(),
                })

                dispatch({
                    type: 'SET_ROUTER_INFO',
                    payload: {
                        protocol: routerResult.router.bridgeName,
                        rate: {
                            from: {
                                amount: fromAmount,
                                token: fromToken?.tokenSymbol || '',
                            },
                            to: {
                                amount: toWholeNumber(
                                    Number(routerResult.toTokenAmount),
                                    Number(CONFIG.CHAIN.BASE.tokens.USDC.decimals),
                                ).toString(),
                                token: CONFIG.CHAIN.BASE.tokens.USDC.tokenSymbol,
                            },
                        },
                        fee: {
                            networkFee: toWholeNumber(Number(routerResult.fromChainNetworkFee), 18).toString(),
                            token: 'ETH',
                        },
                        estimatedTime: formatTime(Number(routerResult.estimateTime)),
                        slippage: '0.015',
                    },
                })

                dispatch({
                    type: 'SET_APPROVAL_STATUS',
                    payload: !!isApproved,
                })
            } else {
                throw new Error(response.msg || 'No routes available')
            }
        } catch (error) {
            const apiError = handleAPIError(error)
            console.error('Route calculation error:', apiError.message)
            toast.error(apiError.message)
            dispatch({ type: 'SET_RECEIVED_AMOUNT', payload: '0.0' })
            dispatch({ type: 'SET_ROUTER_INFO', payload: null })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [fromNetwork, fromToken, fromAmount, walletAddress, dispatch, isApproved])

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            void calculateRoute()
        }, 500)

        return () => clearTimeout(debounceTimeout)
    }, [calculateRoute])
}
