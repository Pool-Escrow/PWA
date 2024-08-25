'use client'

import { Button } from '@/app/pwa/_components/ui/button'
import route from '@/lib/utils/routes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { Route } from 'next'
import { useAppStore } from '@/app/pwa/_client/providers/app-store.provider'
import Section from '@/components/section'

const LoadingIndicator: React.FC = (): JSX.Element => {
    const searchParams = useSearchParams()

    const updateSearchParam = (tab: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', tab)
        window.history.replaceState(null, '', `?${params.toString()}`)
    }

    return (
        <div className='flex h-96 w-full flex-row items-center justify-center text-center'>
            <p>Loading Indicators</p>
        </div>
    )
}
export default LoadingIndicator
