import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { decodeEventLog, parseEther, keccak256, toHex, Hash, TransactionReceipt, parseEventLogs } from 'viem'
import { createPoolAction, updatePoolStatus } from './actions'
import { wagmi } from '@/app/pwa/_client/providers/configs'
import { dropletAddress, poolAbi, poolAddress } from '@/types/contracts'
import useSmartTransaction from '@/app/pwa/_client/hooks/use-smart-transaction'
import { Steps, usePoolCreationStore } from '@/app/pwa/_client/stores/pool-creation-store'
import { Route } from 'next'
import { useWaitForTransactionReceipt } from 'wagmi'
import { fromZonedTime } from 'date-fns-tz'

const initialState = {
    message: '',
    errors: {
        bannerImage: [],
        name: [],
        dateRange: [],
        description: [],
        price: [],
        softCap: [],
        termsURL: [],
    },
    internalPoolId: undefined,
    poolData: undefined,
}

export function useCreatePool() {
    const [state, formAction] = useFormState(createPoolAction, initialState)
    const router = useRouter()
    const { executeTransactions, result } = useSmartTransaction()
    const { setStep, setOnChainPoolId, setError, showToast } = usePoolCreationStore(state => ({
        setStep: state.setStep,
        setOnChainPoolId: state.setOnChainPoolId,
        setError: state.setError,
        showToast: state.showToast,
    }))
    const {
        data: receipt,
        isLoading: isConfirming,
        isSuccess: isConfirmed,
    } = useWaitForTransactionReceipt({
        hash: result.hash as Hash | undefined,
    })
    const isCreatingPool = useRef(false)
    const isPoolUpdated = useRef(false)

    const createPoolOnChain = useCallback(() => {
        console.log('createPoolOnChain called')

        if (isCreatingPool.current) {
            console.log('Pool creation already in progress')
            return
        }

        if (state.internalPoolId && state.poolData) {
            console.log('Starting pool creation on chain')
            isCreatingPool.current = true
            setStep(Steps.CreatingChain)
            showToast()
            const { poolData } = state

            console.log('Pool data:', poolData)
            console.log("startDate", Math.floor(fromZonedTime(poolData.startDate, 'UTC').getTime() / 1000))

            const contractCall = {
                address: poolAddress[wagmi.config.state.chainId as ChainId],
                abi: poolAbi,
                functionName: 'createPool',
                args: [
                    Math.floor(new Date(poolData.startDate).getTime() / 1000),
                    Math.floor(new Date(poolData.endDate).getTime() / 1000),
                    poolData.name,
                    parseEther(poolData.price.toString()),
                    1000,
                    dropletAddress[wagmi.config.state.chainId as ChainId],
                ],
            }
            console.log('Contract call:', contractCall)

            executeTransactions([contractCall])
                .then(() => {
                    console.log('Transaction executed, current result:', result)
                    setStep(Steps.UpdatingStatus)
                    showToast()
                })
                .catch(error => {
                    console.error('Error initiating transaction:', error)
                    setError('Failed to start transaction')
                    showToast()
                })
                .finally(() => {
                    isCreatingPool.current = false
                })
        } else {
            console.log('Missing internalPoolId or poolData', {
                internalPoolId: state.internalPoolId,
                poolData: state.poolData,
            })
        }
    }, [state.internalPoolId, state.poolData, executeTransactions, setStep, setError, showToast])

    useEffect(() => {
        console.log('isConfirmed:', isConfirmed)
        console.log('receipt:', receipt)

        if (isConfirmed && receipt && !isPoolUpdated.current) {
            isPoolUpdated.current = true

            console.log('Transaction confirmed. Full receipt:', receipt)

            console.log('Transaction logs:', receipt.logs)

            const logs = parseEventLogs({
                abi: poolAbi,
                logs: receipt.logs,
                eventName: 'PoolCreated',
            })
            console.log('Parsed logs:', logs)

            if (logs.length > 0) {
                const poolCreatedLog = logs[0]
                console.log('PoolCreated event found:', poolCreatedLog)

                const latestPoolId = Number(poolCreatedLog.args.poolId)
                console.log('Latest Pool ID:', latestPoolId)

                // Continuar con la lógica de actualización del estado del pool
                updatePoolStatus(state.internalPoolId!, 'inactive', latestPoolId)
                    .then(() => {
                        setStep(Steps.Completed)
                        showToast()
                        router.push(`/pool/${latestPoolId}` as Route)
                    })
                    .catch(error => {
                        console.error('Error updating pool:', error)
                        setError('Failed to finalize pool creation')
                        showToast()
                    })
            } else {
                console.log('PoolCreated event not found in logs')
                setError('Failed to find pool creation event')
                showToast()
            }
        }
    }, [isConfirmed, receipt, router, setStep, setError, showToast, state.internalPoolId, isPoolUpdated.current])

    return {
        formAction,
        state,
        createPoolOnChain,
        isPending: result.isLoading,
        isConfirming,
        callsStatus: result.callsStatus,
        isError: result.isError,
    }
}
