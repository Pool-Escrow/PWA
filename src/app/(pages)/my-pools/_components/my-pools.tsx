'use client'

import { useServerActionQuery } from '@/app/_client/hooks/server-action-hooks'
import type { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { appActions, appStore$ } from '@/app/stores/app.store'
import { use$ } from '@legendapp/state/react'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { getUserPastPoolsAction, getUserUpcomingPoolsAction } from '../actions'
import MyPoolsTabs from './my-pools.tabs'

interface MyPoolsProps {
    initialUpcomingPools: PoolItem[] | null
    initialPastPools: PoolItem[] | null
}

const MyPools: React.FC<MyPoolsProps> = ({ initialUpcomingPools, initialPastPools }): React.JSX.Element => {
    const searchParams = useSearchParams()
    const myPoolsTab = use$(appStore$.settings.myPoolsTab)
    const initialLoadRef = useRef(true)

    const { data: upcomingPools } = useServerActionQuery(getUserUpcomingPoolsAction, {
        queryKey: ['getUserUpcomingPoolsAction'],
        input: undefined,
        initialData: initialUpcomingPools ?? [],
    })

    const { data: pastPools } = useServerActionQuery(getUserPastPoolsAction, {
        queryKey: ['getUserPastPoolsAction'],
        input: undefined,
        initialData: initialPastPools ?? [],
    })

    useEffect(() => {
        const tabFromUrl = searchParams?.get('tab') as 'active' | 'past'

        if (initialLoadRef.current) {
            if (tabFromUrl && ['active', 'past'].includes(tabFromUrl)) {
                appActions.setMyPoolsTab(tabFromUrl)
            } else {
                updateSearchParam(myPoolsTab)
            }
            initialLoadRef.current = false
        }
    }, [searchParams, myPoolsTab])

    const updateSearchParam = (tab: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', tab)
        window.history.replaceState(null, '', `?${params.toString()}`)
    }

    return <MyPoolsTabs initialLoad={initialLoadRef.current} upcomingPools={upcomingPools} pastPools={pastPools} />
}

export default MyPools
