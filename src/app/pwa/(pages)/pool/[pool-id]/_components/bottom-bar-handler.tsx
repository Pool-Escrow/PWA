'use client'

import { Button } from '@/app/pwa/_components/ui/button'
import { useReadPoolIsParticipant } from '@/types/contracts'
import { useCallback, useEffect, useMemo } from 'react'
import type { Address } from 'viem'
import { useAppStore } from '@/app/pwa/_client/providers/app-store.provider'
import { POOLSTATUS } from '../_lib/definitions'
import { usePoolActions } from '@/app/pwa/_client/hooks/use-pool-actions'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'

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
    poolId: bigint
    poolPrice: number
    poolTokenSymbol: string
    tokenDecimals: number
    walletAddress: Address | null
}

export default function BottomBarHandler({
    isAdmin,
    walletAddress,
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
}: BottomBarHandlerProps) {
    const router = useRouter()
    const setBottomBarContent = useAppStore(state => state.setBottomBarContent)

    // @ts-expect-error ts(2589) FIXME: Type instantiation is excessively deep and possibly infinite.
    const { data: isParticipant } = useReadPoolIsParticipant({
        args: [walletAddress || '0x', poolId],
    })

    const { handleEnableDeposits, handleEndPool, handleJoinPool, handleStartPool, ready, isPending, isConfirmed } =
        usePoolActions(poolId, poolPrice, tokenDecimals)

    const handleViewTicket = useCallback(() => {
        router.push(`/pool/${poolId}/ticket` as Route)
    }, [router, poolId])

    const buttonConfig = useMemo<Record<POOLSTATUS, PoolStatusConfig>>(
        () => ({
            [POOLSTATUS.INACTIVE]: {
                admin: { label: 'Enable deposit', action: handleEnableDeposits },
                user: null,
            },
            [POOLSTATUS.DEPOSIT_ENABLED]: {
                admin: { label: 'Start Pool', action: handleStartPool },
                user: isParticipant ? { label: 'View My Ticket', action: handleViewTicket } : { label: `Register for ${poolPrice} ${poolTokenSymbol}`, action: handleJoinPool },
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
        [poolPrice, poolTokenSymbol, handleEnableDeposits, handleStartPool, handleJoinPool, handleEndPool],
    )

    const renderButton = useCallback(
        (config: { label: string; action: () => void } | null) => {
            if (!config) return null
            return (
                <Button
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={config.action}
                    disabled={isPending}>
                    {isPending ? 'Confirming...' : config.label}
                </Button>
            )
        },
        [isPending],
    )

    const updateBottomBarContent = useCallback(() => {
        let content: React.ReactNode = null

        if (isParticipant && !isAdmin && poolStatus !== POOLSTATUS.ENDED) {
            content = renderButton({ label: 'View My Ticket', action: handleViewTicket })
        } else {
            const statusConfig = buttonConfig[poolStatus]
            const role = isAdmin ? 'admin' : 'user'
            const config = statusConfig[role]

            if (config && (!isParticipant || isAdmin)) {
                content = renderButton(config)
            }
        }

        setBottomBarContent(content)
    }, [isParticipant, isAdmin, poolStatus, buttonConfig, renderButton, handleViewTicket, setBottomBarContent])

    useEffect(() => {
        if (ready) {
            updateBottomBarContent()
        }
        return () => setBottomBarContent(null)
    }, [ready, updateBottomBarContent, setBottomBarContent])

    useEffect(() => {
        if (isConfirmed) {
            console.log('Transaction confirmed')
            router.refresh()
            updateBottomBarContent()
        }
    }, [isConfirmed, updateBottomBarContent, router])

    return null
}
