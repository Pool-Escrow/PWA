'use client'

import { Button } from '@/components/ui/button'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { useMyPoolsTabStore } from '@/providers/my-pools.provider'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import MyPoolsTabs from './my-pools.tabs'
import { MyPoolsTab } from './my-pools.tabs.config'

const MyPools: React.FC = (): JSX.Element => {
    const searchParams = useSearchParams()
    const { currentTab, setCurrentTab } = useMyPoolsTabStore(state => ({
        currentTab: state.currentTab,
        setCurrentTab: state.setCurrentTab,
    }))
    const initialLoadRef = useRef(true)

    const showBar = useBottomBarStore(state => state.showBar)
    const setContent = useBottomBarStore(state => state.setContent)

    useEffect(() => {
        console.log('MyPools mounted')
        const tabFromUrl = searchParams?.get('tab') as 'upcoming' | 'past'

        if (initialLoadRef.current) {
            if (tabFromUrl && ['upcoming', 'past'].includes(tabFromUrl)) {
                setCurrentTab(tabFromUrl)
            } else {
                // Si no hay deeplink válido, ajusta el search param al valor de la store
                updateSearchParam(currentTab)
            }
            initialLoadRef.current = false
        }

        setContent(
            <Button
                asChild
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                <Link href='/pool/new'>Create Pool</Link>
            </Button>
        )
        showBar()
    }, [searchParams, currentTab, setCurrentTab, setContent, showBar])

    const updateSearchParam = (tab: string) => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', tab)
        window.history.replaceState(null, '', `?${params.toString()}`)
    }

    const handleChangeTab = useCallback(
        (tabId: string) => {
            console.log('Changing tab to:', tabId)
            setCurrentTab(tabId as MyPoolsTab['id'])
            updateSearchParam(tabId)
        },
        [setCurrentTab],
    )

    return <MyPoolsTabs currentTab={currentTab} onChangeTab={handleChangeTab} initialLoad={initialLoadRef.current} />
}

export default MyPools
