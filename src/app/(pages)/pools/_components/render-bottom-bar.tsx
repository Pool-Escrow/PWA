'use client'

import { Button } from '@/components/ui/button'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { useSafeNavigation } from '@/hooks/use-safe-navigation'
import { useAppStore } from '@/providers/app-store.provider'
import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useEffect } from 'react'

export default function RenderBottomBar() {
    const { authenticated } = usePrivy()
    const setBottomBar = useAppStore(state => state.setBottomBarContent)
    const { navigate, isRouting } = useSafeNavigation()
    const { isAdmin, isLoading } = useIsAdmin()

    const handleCreatePool = useCallback(() => {
        const success = navigate('/pool/new')
        if (!success && process.env.NODE_ENV === 'development') {
            console.warn('[RenderBottomBar] Navigation to /pool/new was blocked')
        }
    }, [navigate])

    useEffect(() => {
        if (isAdmin && !isRouting && authenticated) {
            setBottomBar(
                <Button
                    data-testid='create-pool-button'
                    onClick={handleCreatePool}
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:bg-cta-active active:shadow-button-push'>
                    Create Pool
                </Button>,
            )
        }
        return () => {
            setBottomBar(null)
        }
    }, [isAdmin, setBottomBar, isRouting, authenticated, handleCreatePool])

    if (isLoading) return null

    return null
}
