'use client'

import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { useOnRamp } from '@/app/_client/hooks/use-onramp'
import { usePoolActions } from '@/app/_client/hooks/use-pool-actions'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { Button } from '@/app/_components/ui/button'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { useUserInfo } from '@/hooks/use-user-info'
import { poolAbi } from '@/types/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAbiItem } from 'viem'
import { useReadContract } from 'wagmi'
import { addParticipantToPool } from '../../new/actions'
import JoinPoolFeedbackDialog from './join-pool-feedback-dialog'
import HybridRegistration from './terms-acceptance-dialog'

type ButtonConfig = {
    label: string
    action: () => void
}

type PoolStatusConfig = {
    admin: ButtonConfig | null
    user: ButtonConfig | null
}

interface BottomBarHandlerProps {
    keysToRefetch: string[]
    isAdmin: boolean
    poolStatus: POOLSTATUS
    poolId: string
    poolPrice: number
    poolTokenSymbol: string
    tokenDecimals: number
    requiredAcceptance: boolean
    termsUrl: string
    poolName?: string
}

export default function BottomBarHandler({
    keysToRefetch,
    isAdmin,
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
    requiredAcceptance,
    termsUrl,
    poolName,
}: BottomBarHandlerProps) {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(false)
    const [transactionProcessed, setTransactionProcessed] = useState(false)
    const [localIsParticipant, setLocalIsParticipant] = useState(false)
    const updateBottomBarContentRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress)
    const isRouting = useAppStore(state => state.isRouting)

    const { data: user } = useUserInfo()
    const address = user?.address

    const {
        data: isParticipant,
        isLoading: isParticipantLoading,
        refetch: refetchParticipantStatus,
    } = useReadContract({
        abi: [getAbiItem({ abi: poolAbi, name: 'isParticipant' })],
        address: currentPoolAddress,
        functionName: 'isParticipant',
        args: [address || '0x', BigInt(poolId)],
        query: {
            enabled: Boolean(address && poolId),
            refetchInterval: 5_000,
        },
    })

    const { handleOnRamp } = useOnRamp()

    const handleOnRampClick = () => {
        handleOnRamp(poolPrice)
            .then(success => {
                if (success) {
                    resetJoinPoolProcess()
                    setIsLoading(false)
                    updateBottomBarContent()
                    router.refresh()
                }
            })
            .catch(error => {
                console.error('❌ [BottomBarHandler] Error on ramping:', error)
                setIsLoading(false)
                throw error
            })
    }

    const handleSuccessfulJoin = () => {
        // console.log('🎯 [BottomBarHandler] Executing onSuccessfulJoin callback')
        if (address === undefined) {
            console.error('❌ [BottomBarHandler] User address not found')
            throw new Error('User address not found')
        }
        console.log('📝 [BottomBarHandler] Adding participant to pool:', { poolId, address })

        addParticipantToPool(poolId, address)
            .then(success => {
                console.log('✅ [BottomBarHandler] Add participant result:', success)

                if (success) {
                    console.log('🔄 [BottomBarHandler] Participant added successfully, updating UI')
                    setLocalIsParticipant(true)
                    updateBottomBarContent()
                    router.refresh()
                } else {
                    console.error('❌ [BottomBarHandler] Failed to add participant')
                    throw new Error('Failed to add participant')
                }
            })
            .catch(error => {
                console.error('❌ [BottomBarHandler] Error joining pool:', error)
                setIsLoading(false)
                setTransactionProcessed(false)
                throw error
            })
    }

    const {
        handleEnableDeposits,
        handleEndPool,
        handleJoinPool,
        handleStartPool,
        resetJoinPoolProcess,
        ready,
        isPending,
        isConfirmed,
        isConfirming,
        resetConfirmation,
        isCancelled,
    } = usePoolActions({
        poolId,
        poolPrice,
        tokenDecimals,
        openOnRampDialog: handleOnRampClick,
        onSuccessfulJoin: handleSuccessfulJoin,
    })

    const handleViewTicket = useCallback(() => {
        router.push(`/pool/${poolId}/ticket`)
    }, [router, poolId])

    const [showTermsDialog, setShowTermsDialog] = useState(false)
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

    useEffect(() => {
        console.log('🎭 [BottomBarHandler] Feedback dialog state changed:', showFeedbackDialog)
    }, [showFeedbackDialog])

    const handleJoinPoolWithTerms = useCallback(() => {
        if (requiredAcceptance) {
            setShowTermsDialog(true)
        } else {
            handleJoinPool()
        }
    }, [requiredAcceptance, handleJoinPool])

    const buttonConfig = useMemo<Record<POOLSTATUS, PoolStatusConfig>>(
        () => ({
            [POOLSTATUS.INACTIVE]: {
                admin: { label: 'Enable deposit', action: handleEnableDeposits },
                user: null,
            },
            [POOLSTATUS.DEPOSIT_ENABLED]: {
                admin: { label: 'Start Pool', action: handleStartPool },
                user: localIsParticipant
                    ? { label: 'View My Ticket', action: handleViewTicket }
                    : { label: `Register for ${poolPrice} ${poolTokenSymbol}`, action: handleJoinPoolWithTerms },
            },
            [POOLSTATUS.STARTED]: {
                admin: { label: 'End pool', action: handleEndPool },
                user: localIsParticipant ? { label: 'View My Ticket', action: handleViewTicket } : null,
            },
            [POOLSTATUS.ENDED]: {
                admin: null,
                user: null,
            },
            [POOLSTATUS.DELETED]: {
                admin: null,
                user: null,
            },
        }),
        [
            poolPrice,
            poolTokenSymbol,
            handleEnableDeposits,
            handleStartPool,
            handleEndPool,
            localIsParticipant,
            handleViewTicket,
            handleJoinPoolWithTerms,
        ],
    )

    const renderButton = useCallback(
        (config: ButtonConfig | null, key: string) => {
            if (!config) return null
            return (
                <Button
                    key={key}
                    className='pool-button mb-3 h-[46px] w-full rounded-[2rem] px-4 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={() => {
                        setIsLoading(true)
                        config.action()
                    }}
                    disabled={isPending || isLoading || isConfirming}>
                    {isPending || isLoading || isConfirming ? (
                        <>
                            <Loader2 className='mr-2 size-4 animate-spin' />
                            Processing...
                        </>
                    ) : (
                        config.label
                    )}
                </Button>
            )
        },
        [isPending, isConfirming, isLoading],
    )

    const updateBottomBarContent = useCallback(() => {
        // console.log('🔄 [BottomBarHandler] Updating bottom bar content:', {
        //     isParticipantLoading,
        //     isParticipant,
        //     localIsParticipant,
        //     isAdmin,
        //     poolStatus,
        // })

        let content: React.ReactNode = null

        if (isParticipantLoading) {
            console.log('⏳ [BottomBarHandler] Loading participant status')
            content = <Button disabled>Loading...</Button>
        } else if ((isParticipant || localIsParticipant) && !isAdmin && poolStatus !== POOLSTATUS.ENDED) {
            console.log('🎫 [BottomBarHandler] Showing view ticket button')
            content = renderButton({ label: 'View My Ticket', action: handleViewTicket }, 'view-ticket')
        } else {
            const statusConfig = buttonConfig[poolStatus]
            const role = isAdmin ? 'admin' : 'user'
            // console.log('🔍 [BottomBarHandler] Determining button config:', { role, poolStatus })
            const config = statusConfig[role]

            if (config && (!isParticipant || isAdmin)) {
                content = renderButton(config, `${role}-${poolStatus}`)
            }
        }

        // console.log('✅ [BottomBarHandler] Setting bottom bar content:', content)
        if (!isRouting) {
            setBottomBarContent(content)
        }
    }, [
        isParticipantLoading,
        isParticipant,
        localIsParticipant,
        isAdmin,
        poolStatus,
        isRouting,
        renderButton,
        handleViewTicket,
        buttonConfig,
        setBottomBarContent,
    ])

    useEffect(() => {
        console.log('👤 [BottomBarHandler] Participant status changed:', {
            isParticipant,
            isParticipantLoading,
            localIsParticipant,
        })
        if (!isParticipantLoading && isParticipant !== undefined) {
            setLocalIsParticipant(isParticipant)
        }
    }, [isParticipant, isParticipantLoading, localIsParticipant])

    useEffect(() => {
        if (!isParticipantLoading && isParticipant) {
            keysToRefetch.forEach(key => {
                queryClient.refetchQueries({ queryKey: [key] }).catch(error => {
                    console.error('❌ [BottomBarHandler] Error refetching query:', error)
                })
            })
            setBottomBarContent(renderButton({ label: 'View My Ticket', action: handleViewTicket }, 'view-ticket'))
        }
    }, [
        handleViewTicket,
        isParticipant,
        isParticipantLoading,
        keysToRefetch,
        queryClient,
        renderButton,
        setBottomBarContent,
    ])

    useEffect(() => {
        // console.log('✨ [BottomBarHandler] Confirmation status:', {
        //     isConfirmed,
        //     transactionProcessed,
        // })
        if (isConfirmed && !transactionProcessed) {
            console.log('🔄 [BottomBarHandler] Processing confirmed transaction')
            console.log('🎊 [BottomBarHandler] Transaction confirmed - showing feedback dialog')
            setIsLoading(false)
            setTransactionProcessed(true)
            setShowFeedbackDialog(true) // Show feedback dialog on transaction confirmation
            router.refresh()
            resetConfirmation()
            void refetchParticipantStatus()
            updateBottomBarContent()
        }
    }, [isConfirmed, transactionProcessed, router, resetConfirmation, refetchParticipantStatus, updateBottomBarContent])

    useEffect(() => {
        // console.log('🔄 [BottomBarHandler] Transaction status effect:', {
        //     ready,
        //     isParticipantLoading,
        //     transactionProcessed,
        // })
        if (ready && !isParticipantLoading && !transactionProcessed) {
            if (updateBottomBarContentRef.current) {
                clearTimeout(updateBottomBarContentRef.current)
            }
            updateBottomBarContentRef.current = setTimeout(() => {
                updateBottomBarContent()
                updateBottomBarContentRef.current = null
            }, 100)
        }
        return () => {
            if (updateBottomBarContentRef.current) {
                clearTimeout(updateBottomBarContentRef.current)
            }
            setBottomBarContent(null)
        }
    }, [ready, isParticipantLoading, updateBottomBarContent, setBottomBarContent, transactionProcessed])

    useEffect(() => {
        setTransactionInProgress(isPending || isConfirming)
    }, [setTransactionInProgress, isPending, isConfirming])

    useEffect(() => {
        console.log('🔄 [BottomBarHandler] Transaction status changed:', { isPending, isConfirming, isConfirmed })
        if (!isPending && !isConfirming && !isConfirmed) {
            console.log('🧹 [BottomBarHandler] Cleaning up transaction state')
            setIsLoading(false)
            setTransactionProcessed(false)
            updateBottomBarContent()
        }
    }, [isPending, isConfirming, isConfirmed, updateBottomBarContent])

    useEffect(() => {
        if (isCancelled) {
            setIsLoading(false)
            setTransactionProcessed(false)
            updateBottomBarContent()
        }
    }, [isCancelled, updateBottomBarContent])

    return (
        <>
            {requiredAcceptance && (
                <HybridRegistration
                    open={showTermsDialog}
                    onOpenChange={setShowTermsDialog}
                    onAccept={handleJoinPool}
                    termsUrl={termsUrl}
                />
            )}
            <JoinPoolFeedbackDialog
                open={showFeedbackDialog}
                onOpenChange={setShowFeedbackDialog}
                poolName={poolName}
            />
        </>
    )
}
