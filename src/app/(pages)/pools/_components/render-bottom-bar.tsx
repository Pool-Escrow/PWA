'use client'

import { Button } from '@/app/_components/ui/button'
import { appActions, appStore$ } from '@/app/stores/app.store'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { use$ } from '@legendapp/state/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect } from 'react'

export default function RenderBottomBar() {
    const isRouting = use$(appStore$.settings.isRouting)
    const { data: isAdmin, isLoading } = useQuery({
        queryKey: ['userAdminStatus'],
        queryFn: () => getUserAdminStatusActionWithCookie(),
    })

    useEffect(() => {
        if (isAdmin && !isRouting) {
            appActions.setBottomBarContent(
                <Button
                    data-testid='create-pool-button'
                    asChild
                    className='btn-cta active:bg-cta-active mb-3 h-[46px] w-full rounded-[2rem] px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <Link href='/pool/new'>Create Pool</Link>
                </Button>,
            )
        }
        return () => {
            appActions.setBottomBarContent(null)
        }
    }, [isAdmin, isRouting])

    if (isLoading) return null

    return null
}
