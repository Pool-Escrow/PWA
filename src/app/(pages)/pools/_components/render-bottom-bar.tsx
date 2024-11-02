'use client'

import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { Button } from '@/app/_components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'

export default function RenderBottomBar() {
    const setBottomBar = useAppStore(state => state.setBottomBarContent)

    const { data: isAdmin, isLoading } = useQuery({
        queryKey: ['userAdminStatus'],
        queryFn: () => getUserAdminStatusActionWithCookie(),
    })

    useEffect(() => {
        if (isAdmin) {
            setBottomBar(
                <Button
                    data-testid='create-pool-button'
                    asChild
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <Link href='/pool/new'>Create Pool</Link>
                </Button>,
            )
        }
        return () => {
            setBottomBar(null)
        }
    }, [isAdmin, setBottomBar])

    if (isLoading) return null

    return null
}
