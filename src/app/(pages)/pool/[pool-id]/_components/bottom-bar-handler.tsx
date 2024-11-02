'use client'

import { Button } from '@/app/_components/ui/button'
import { poolAbi } from '@/types/contracts'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import type { Address } from 'viem'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { usePoolActions } from '@/app/_client/hooks/use-pool-actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAccount, useReadContract } from 'wagmi'
import { getAbiItem } from 'viem'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import HybridRegistration from './terms-acceptance-dialog'
import { addParticipantToPool } from '../../new/actions'
import { useOnRamp } from '@/app/_client/hooks/use-onramp'

type ButtonConfig = {
    label: string
    action: () => void
}

type PoolStatusConfig = {
    admin: ButtonConfig | null
    user: ButtonConfig | null
}

interface BottomBarHandlerProps {
    isAdmin: boolean
    poolStatus: POOLSTATUS
    poolId: string
    poolPrice: number
    poolTokenSymbol: string
    tokenDecimals: number
    requiredAcceptance: boolean
    termsUrl: string
}

export default function BottomBarHandler({
    isAdmin,
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
    requiredAcceptance,
    termsUrl,
}: BottomBarHandlerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [transactionProcessed, setTransactionProcessed] = useState(false)
    const updateBottomBarContentRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    const setTransactionInProgress = useAppStore(state => state.setTransactionInProgress)

    const { address } = useAccount() as { address: Address | undefined }

    const { data: isParticipant, isLoading: isParticipantLoading } = useReadContract({
        abi: [
            getAbiItem({
                abi: poolAbi,
                name: 'isParticipant',
            }),
        ],
        address: currentPoolAddress,
        functionName: 'isParticipant',
        args: [address || '0x', BigInt(poolId)],
        query: {
            enabled: Boolean(address && poolId),
        },
    })

    const { handleOnRamp } = useOnRamp()

    const handleOnRampClick = async () => {
        const success = await handleOnRamp(poolPrice)
        if (success) {
            resetJoinPoolProcess()
            setIsLoading(false)
            updateBottomBarContent()
            router.refresh()
        }
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
    } = usePoolActions(poolId, poolPrice, tokenDecimals, handleOnRampClick, async () => {
        try {
            if (address === undefined) {
                console.log('user address not found')
                return
            }
            const success = await addParticipantToPool(poolId, address)
            if (success) {
                // TODO: handle success, revalidate
            }
        } catch (error) {
            console.error('Error joining pool:', error)
            // TODO: handle error
        }
    })

    const handleViewTicket = useCallback(() => {
        router.push(`/pool/${poolId}/ticket`)
    }, [router, poolId])

    const [showTermsDialog, setShowTermsDialog] = useState(false)

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
                user: isParticipant
                    ? { label: 'View My Ticket', action: handleViewTicket }
                    : { label: `Register for ${poolPrice} ${poolTokenSymbol}`, action: handleJoinPoolWithTerms },
            },
            [POOLSTATUS.STARTED]: {
                admin: { label: 'End pool', action: handleEndPool },
                user: isParticipant ? { label: 'View My Ticket', action: handleViewTicket } : null,
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
            handleJoinPool,
            handleEndPool,
            isParticipant,
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
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-4 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={() => {
                        setIsLoading(true)
                        config.action()
                    }}
                    disabled={isPending || isLoading || isConfirming}>
                    {isPending || isLoading || isConfirming ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
        let content: React.ReactNode = null

        if (isParticipantLoading) {
            content = <Button disabled>Loading...</Button>
        } else if (isParticipant && !isAdmin && poolStatus !== POOLSTATUS.ENDED) {
            content = renderButton({ label: 'View My Ticket', action: handleViewTicket }, 'view-ticket')
        } else {
            const statusConfig = buttonConfig[poolStatus]
            const role = isAdmin ? 'admin' : 'user'
            const config = statusConfig[role]

            if (config && (!isParticipant || isAdmin)) {
                content = renderButton(config, `${role}-${poolStatus}`)
            }
        }

        setBottomBarContent(content)
    }, [
        isParticipant,
        isParticipantLoading,
        isAdmin,
        poolStatus,
        buttonConfig,
        renderButton,
        handleViewTicket,
        setBottomBarContent,
    ])

    useEffect(() => {
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
        if (isConfirmed && !transactionProcessed) {
            router.refresh()
            updateBottomBarContent()
            resetConfirmation()
            setIsLoading(false)
            setTransactionProcessed(true)
        }
    }, [isConfirmed, updateBottomBarContent, router, resetConfirmation, transactionProcessed])

    useEffect(() => {
        setTransactionInProgress(isPending || isConfirming)
    }, [setTransactionInProgress, isPending, isConfirming])

    useEffect(() => {
        if (!isPending && !isConfirmed) {
            setIsLoading(false)
        }
    }, [isPending, isConfirmed])

    useEffect(() => {
        if (!isPending && !isConfirming) {
            setTransactionProcessed(false)
        }
    }, [isPending, isConfirming])

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
        </>
    )
}
