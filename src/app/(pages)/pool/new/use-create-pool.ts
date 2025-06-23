import useMediaQuery from '@/hooks/use-media-query'
import useTransactions from '@/hooks/use-transactions'
import { currentPoolAddress, currentTokenAddress } from '@/server/blockchain/server-config'
import { Steps, usePoolCreationStore } from '@/stores/pool-creation-store'
import { poolAbi } from '@/types/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import type { Hash } from 'viem'
import { ContractFunctionExecutionError, parseEventLogs, parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { z } from 'zod'
import { CreatePoolFormSchema, PoolObjectSchema } from './_lib/definitions'
import { createPoolAction, deletePool, updatePoolStatus } from './actions'

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
        requiredAcceptance: [],
    },
    internalPoolId: undefined,
    poolData: undefined,
}

type FormValues = z.infer<typeof PoolObjectSchema>
type FormErrors = Partial<Record<keyof FormValues, string[]>>

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
    const queryClient = useQueryClient()
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showRetryDialog, setShowRetryDialog] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [isWaitingForRetry, setIsWaitingForRetry] = useState(false)
    const [transactionProcessed, setTransactionProcessed] = useState(false)
    const [hasAttemptedChainCreation, setHasAttemptedChainCreation] = useState(false)
    const [poolUpdated, setPoolUpdated] = useState(false)
    const [formData, setFormData] = useState<Partial<FormValues>>({})
    const [formErrors, setFormErrors] = useState<FormErrors>({})

    const validateField = useCallback(<K extends keyof FormValues>(name: K, value: FormValues[K]) => {
        const fieldSchema = z.object({ [name]: PoolObjectSchema.shape[name] })
        const result = fieldSchema.safeParse({ [name]: value })

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors as Partial<Record<keyof FormValues, string[]>>

            setFormErrors(prev => ({
                ...prev,
                [name]: fieldErrors[name],
            }))
        } else {
            setFormErrors(prev => {
                const { [name]: _, ...rest } = prev
                return rest
            })
        }
    }, [])

    const handleFieldChange = useCallback(
        <K extends keyof FormValues>(name: K, value: FormValues[K] | null) => {
            if (value === null) return
            setFormData(prev => ({ ...prev, [name]: value }))
            validateField(name, value)
        },
        [validateField],
    )

    const validateForm = useCallback(() => {
        const result = CreatePoolFormSchema.safeParse(formData)
        if (!result.success) {
            const flat = result.error.flatten().fieldErrors as Record<string, string[]>
            const aggregated: FormErrors = {}

            Object.entries(flat).forEach(([k, v]) => {
                if (k.startsWith('dateRange')) {
                    // Provide more specific error messages for dateRange
                    const enhancedMessages = v.map(msg => {
                        if (msg.includes('Start date')) {
                            return msg // Keep specific start date messages
                        } else if (msg.includes('End date') || msg.includes('End time')) {
                            return msg // Keep specific end date messages
                        } else if (msg.includes('required')) {
                            return 'Please select both start and end dates for your event'
                        } else {
                            return msg
                        }
                    })
                    aggregated.dateRange = [...(aggregated.dateRange ?? []), ...enhancedMessages]
                } else if (k === 'description') {
                    // Provide more specific error messages for description
                    const enhancedMessages = v.map(msg => {
                        if (msg.includes('required')) {
                            return 'Please provide a description for your pool'
                        } else if (msg.includes('5 characters')) {
                            return 'Description must be at least 5 characters long'
                        } else if (msg.includes('500 characters')) {
                            return 'Description cannot exceed 500 characters'
                        } else {
                            return msg
                        }
                    })
                    aggregated.description = enhancedMessages
                } else {
                    // Keep other field errors as they are
                    ;(aggregated as Record<string, string[]>)[k as keyof FormValues] = v
                }
            })
            setFormErrors(aggregated)
            return false
        }
        setFormErrors({})
        return true
    }, [formData])

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
                parseUnits(price, 6),
                1000, // TODO: implement max participants
                currentTokenAddress,
            ],
        }

        setHasAttemptedChainCreation(true)
        isCreatingPool.current = true
        setStep(Steps.CreatingChain)
        executeTransactions([contractCall], {
            type: 'CREATE_POOL',
            onSuccess: () => {
                setStep(Steps.UpdatingStatus)
            },
        })
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
    }, [state.internalPoolId, state.poolData, hasAttemptedChainCreation, setStep, executeTransactions, setError])

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
        setHasAttemptedChainCreation(false)
    }, [])

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
    }, [state.internalPoolId, state.poolData, isWaitingForRetry, hasAttemptedChainCreation, createPoolOnChain])

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
                    void queryClient.invalidateQueries({ queryKey: ['upcoming-pools'] })
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
                    setHasAttemptedChainCreation(false)
                })
        } else {
            setError('Failed to find pool creation event')
            showToast({
                type: 'error',
                message: 'Failed to find pool creation event',
            })
            setTransactionProcessed(false)
            setPoolUpdated(false)
            setHasAttemptedChainCreation(false)
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
            void updatePool(state.internalPoolId, 'unconfirmed', 0)
        }
    }, [state, updatePool])

    return {
        formAction,
        state,
        formData,
        formErrors,
        handleFieldChange,
        validateForm,
        createPoolOnChain: createPoolOnChain,
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
        poolUpdated,
        hasAttemptedChainCreation,
    }
}
