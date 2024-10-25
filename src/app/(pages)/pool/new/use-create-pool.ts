import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { parseEther, Hash, parseEventLogs, ContractFunctionExecutionError } from 'viem'
import { createPoolAction, deletePool, updatePoolStatus } from './actions'
import { Steps, usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { currentPoolAddress, currentTokenAddress } from '@/app/_server/blockchain/server-config'
import useTransactions from '@/app/_client/hooks/use-transactions'
import { poolAbi } from '@/types/contracts'
import useMediaQuery from '@/app/_client/hooks/use-media-query'

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
        codeOfConductURL: [],
        requiredAcceptance: [],
    },
    internalPoolId: undefined,
    poolData: undefined,
}

export function useCreatePool() {
    const [state, formAction] = useFormState(createPoolAction, initialState)
    const router = useRouter()
    const { executeTransactions, result: txResult } = useTransactions()
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
        hash: txResult.hash as Hash | undefined,
    })
    const isCreatingPool = useRef(false)
    const isPoolUpdated = useRef(false)
    const queryClient = useQueryClient()
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showRetryDialog, setShowRetryDialog] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [isWaitingForRetry, setIsWaitingForRetry] = useState(false)
    const [transactionProcessed, setTransactionProcessed] = useState(false)
    const [hasAttemptedChainCreation, setHasAttemptedChainCreation] = useState(false)
    const [poolUpdated, setPoolUpdated] = useState(false)

    const createPoolOnChain = useCallback(() => {
        if (!state.internalPoolId || !state.poolData || hasAttemptedChainCreation) {
            console.error('Cannot create pool on chain: missing data or already attempted')
            return
        }

        const { name, startDate, endDate, price } = state.poolData

        const contractCall = {
            address: currentPoolAddress,
            abi: poolAbi,
            functionName: 'createPool',
            args: [
                BigInt(startDate / 1000), // is important to convert to seconds
                BigInt(endDate / 1000),
                name,
                parseEther(price),
                1000, // TODO: implement max participants
                currentTokenAddress,
            ],
        }

        setHasAttemptedChainCreation(true)
        isCreatingPool.current = true
        setStep(Steps.CreatingChain)
        executeTransactions([contractCall])
            .then(() => setStep(Steps.UpdatingStatus))
            .catch(error => {
                console.log('Transaction attempt failed', error)
                if (
                    error instanceof ContractFunctionExecutionError &&
                    error.message.includes('User rejected the request')
                ) {
                    setStep(Steps.UserRejected)
                } else {
                    setError('Failed to start transaction')
                }
                setIsWaitingForRetry(true)
                setShowRetryDialog(true)
            })
            .finally(() => {
                isCreatingPool.current = false
            })
    }, [state.internalPoolId, state.poolData, executeTransactions, setStep, setError, hasAttemptedChainCreation])

    const handleCancellation = useCallback(async () => {
        if (!state.internalPoolId) return

        try {
            await deletePool(state.internalPoolId)
            showToast({ type: 'info', message: 'Pool creation cancelled successfully.' })
            router.push('/pools')
        } catch (error) {
            console.error('Error cancelling pool:', error)
            showToast({ type: 'error', message: 'Failed to cancel pool creation. Please try again.' })
        } finally {
            setShowCancelDialog(false)
        }
    }, [state.internalPoolId, showToast, router])

    const handleCancelDialogClose = useCallback(() => {
        setShowCancelDialog(false)
    }, [])

    const handleRetry = useCallback(() => {
        setShowRetryDialog(false)
        setIsWaitingForRetry(false)
        createPoolOnChain()
    }, [createPoolOnChain])

    const handleRetryDialogClose = useCallback(async () => {
        setShowRetryDialog(false)
        setStep(Steps.Initial)

        if (state.internalPoolId) {
            try {
                await deletePool(state.internalPoolId)
                showToast({ type: 'info', message: 'Pool creation cancelled and data removed.' })
            } catch (error) {
                console.error('Error deleting pool:', error)
                showToast({ type: 'error', message: 'Failed to remove pool data. Please contact support.' })
            }
        }

        router.push('/pools')
    }, [setStep, state.internalPoolId, showToast, router])

    useEffect(() => {
        if (
            state.internalPoolId &&
            state.poolData &&
            !isCreatingPool.current &&
            !isWaitingForRetry &&
            !hasAttemptedChainCreation
        ) {
            createPoolOnChain()
        }
    }, [state.internalPoolId, state.poolData, createPoolOnChain, isWaitingForRetry, hasAttemptedChainCreation])

    useEffect(() => {
        if (!isConfirmed || !receipt || poolUpdated || transactionProcessed) return

        setPoolUpdated(true)
        setTransactionProcessed(true)

        const logs = parseEventLogs({
            abi: poolAbi,
            logs: receipt.logs,
            eventName: 'PoolCreated',
        })

        if (logs.length > 0) {
            const poolCreatedLog = logs[0]
            const latestPoolId = Number(poolCreatedLog.args.poolId)

            setOnChainPoolId(latestPoolId)
            updatePoolStatus(state.internalPoolId!, 'unconfirmed', latestPoolId)
                .then(() => {
                    setStep(Steps.Completed)
                    showToast({
                        type: 'success',
                        message: 'Pool created successfully',
                    })
                    queryClient.invalidateQueries({ queryKey: ['upcoming-pools'] })
                    router.push(`/pool/${latestPoolId}`)
                })
                .catch(error => {
                    console.error('Error updating pool status:', error)
                    setError('Failed to update pool status')
                    showToast({
                        type: 'error',
                        message: 'Failed to update pool status',
                    })
                })
                .finally(() => {
                    setPoolUpdated(false)
                    setTransactionProcessed(false)
                })
        } else {
            setError('Failed to find pool creation event')
            showToast({
                type: 'error',
                message: 'Failed to find pool creation event',
            })
            setTransactionProcessed(false)
            setPoolUpdated(false)
        }
    }, [
        isConfirmed,
        receipt,
        router,
        setStep,
        setError,
        showToast,
        state.internalPoolId,
        queryClient,
        transactionProcessed,
        setOnChainPoolId,
        poolUpdated,
    ])

    const updatePool = useCallback(
        async (
            internalPoolId: string,
            status:
                | 'draft'
                | 'unconfirmed'
                | 'inactive'
                | 'depositsEnabled'
                | 'started'
                | 'paused'
                | 'ended'
                | 'deleted',
            contractId: number,
        ) => {
            if (!internalPoolId) return
            try {
                await updatePoolStatus(internalPoolId, status, contractId)
            } catch (error) {
                console.error('Error updating pool status:', error)
            }
        },
        [],
    )

    useEffect(() => {
        if (state.message === 'Pool created successfully' && state.internalPoolId) {
            updatePool(state.internalPoolId, 'unconfirmed', 0)
        }
    }, [state, updatePool])

    return {
        formAction,
        state,
        createPoolOnChain,
        isPending: txResult.isLoading,
        isConfirming,
        callsStatus: txResult.callsStatus,
        isError: txResult.isError,
        showCancelDialog,
        setShowCancelDialog,
        handleCancellation,
        handleCancelDialogClose,
        showRetryDialog,
        handleRetry,
        handleRetryDialogClose,
        isDesktop,
        isWaitingForRetry,
        transactionProcessed,
    }
}
