'use client'

import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePoolStore } from '@/stores/pool.store'
import { useAuth } from '@/lib/hooks/use-auth'
import { getAuthStatus } from '@/lib/server/auth.action'
import { fetchUserPools } from '@/lib/hooks/use-pools'

export default function PoolsLayout({ yours, upcoming }: LayoutWithSlots<'yours' | 'upcoming'>) {
    const { showBar, hideBar, setContent } = useBottomBarStore(state => state)
    const { isAuthenticated, address } = useAuth()
    const { setUserAddress } = usePoolStore()

    const { data: userPools } = useQuery({
        queryKey: ['userPools', address],
        queryFn: () => (address ? fetchUserPools(address) : Promise.resolve([])),
        enabled: !!isAuthenticated && !!address,
    })

    useEffect(() => {
        if (address) {
            setUserAddress(address)
        }
    }, [address, setUserAddress])

    useEffect(() => {
        async function checkAuthStatus() {
            const { isAdmin } = await getAuthStatus()
            if (isAdmin) {
                setContent(
                    <Button
                        asChild
                        className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        <Link href='/pool/new'>Create Pool</Link>
                    </Button>,
                )
                showBar()
            } else {
                hideBar()
            }
        }

        checkAuthStatus()
    }, [])

    return (
        <div className='flex min-h-dvh scroll-py-6 flex-col gap-6'>
            {isAuthenticated && userPools && userPools.length > 0 && yours}
            {upcoming}
        </div>
    )
}
