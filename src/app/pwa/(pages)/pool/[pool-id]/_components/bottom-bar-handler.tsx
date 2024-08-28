'use client'

import { Button } from '@/app/pwa/_components/ui/button'
import { useReadPoolIsParticipant } from '@/types/contracts'
import { useEffect } from 'react'
import { Address } from 'viem'
import { useAppStore } from '@/app/pwa/_client/providers/app-store.provider'
import { POOLSTATUS } from '../_lib/definitions'
import { usePoolActions } from '@/app/pwa/_client/hooks/use-pool-actions'
import { useRouter } from 'next/navigation'
import { Route } from 'next'

export default function BottomBarHandler({
    isAdmin,
    walletAddress,
    poolStatus,
    poolId,
    poolPrice,
    poolTokenSymbol,
    tokenDecimals,
}: {
    isAdmin: boolean
    poolStatus: POOLSTATUS
    poolId: bigint
    poolPrice: number
    poolTokenSymbol: string
    tokenDecimals: number
    walletAddress: Address | null
}) {
    const router = useRouter()
    const { setBottomBarContent } = useAppStore(state => ({
        setBottomBarContent: state.setBottomBarContent,
    }))

    // @ts-expect-error ts(2589) FIXME: Type instantiation is excessively deep and possibly infinite.
    const { data: isParticipant } = useReadPoolIsParticipant({
        args: [walletAddress || '0x', poolId],
    })

    const { handleEnableDeposits, handleEndPool, handleJoinPool, handleStartPool, ready, isPending, isConfirmed } =
        usePoolActions(poolId, poolPrice, tokenDecimals)

    useEffect(() => {
        if (ready) {
            if (isParticipant && !isAdmin && poolStatus !== POOLSTATUS.ENDED) {
                setBottomBarContent(
                    <Button
                        className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                        onClick={handleViewTicket}
                        disabled={isPending}
                        // isLoading={isPending}
                    >
                        View My Ticket
                    </Button>,
                )
            } else {
                handleBottomBarContent(poolStatus, isAdmin)
            }
        }
        return () => {
            setBottomBarContent(null)
        }
    }, [poolStatus, isAdmin, setBottomBarContent, ready, isParticipant])

    useEffect(() => {
        if (isConfirmed) {
            console.log('Transaction confirmed')
            handleBottomBarContent(poolStatus, isAdmin)
        }
    }, [isConfirmed])

    const handleViewTicket = () => {
        router.push(`/pool/${poolId}/ticket` as Route)
    }

    const handleBottomBarContent = (poolStatus: POOLSTATUS, isAdmin: boolean) => {
        console.log('revalidating bottom bar content')
        router.refresh()

        console.log('poolStatus', poolStatus)
        switch (poolStatus) {
            case POOLSTATUS.INACTIVE: {
                if (isAdmin) {
                    setBottomBarContent(
                        <Button
                            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={handleEnableDeposits}
                            disabled={isPending}>
                            {isPending ? 'Confirming...' : 'Enable deposit'}
                        </Button>,
                    )
                }
                break
            }
            case POOLSTATUS.DEPOSIT_ENABLED: {
                if (isAdmin) {
                    setBottomBarContent(
                        <Button
                            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={handleStartPool}>
                            Start Pool
                        </Button>,
                    )
                } else {
                    setBottomBarContent(
                        <Button
                            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={handleJoinPool}>
                            {`Register for ${poolPrice} ${poolTokenSymbol}`}
                        </Button>,
                    )
                }
                break
            }

            case POOLSTATUS.STARTED: {
                if (isAdmin) {
                    setBottomBarContent(
                        <Button
                            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={handleEndPool}>
                            End pool
                        </Button>,
                    )
                } else {
                    setBottomBarContent(
                        <Button
                            className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                            onClick={handleJoinPool}>
                            {`Register for ${poolPrice} ${poolTokenSymbol}`}
                        </Button>,
                    )
                }
                break
            }
            case POOLSTATUS.ENDED:
                setBottomBarContent(null)
            // default:
            //     setBottomBarContent(
            //         <Button
            //             className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
            //             onClick={handleJoinPool}>
            //             {`Register for ${poolPrice} ${poolTokenSymbol}`}
            //         </Button>,
            //     )
        }
    }

    return null
}
