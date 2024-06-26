'use client'

import { usePathname } from 'next/navigation'
import { getTopBarElements } from './top-bar.config'
import { useUserStore } from '@/stores/profile.store'
import { useEffect } from 'react'
import { getUserProfile } from '../profile/profile.action'

export default function TopBarLayout(): JSX.Element {
    const pathname = usePathname()
    const { left, center, right } = getTopBarElements(pathname)
    const { setProfile, setError } = useUserStore()

    useEffect(() => {
        async function loadUserProfile() {
            try {
                const profile = await getUserProfile()
                setProfile(profile)
            } catch (error) {
                setError(error as Error)
            }
        }

        loadUserProfile()
    }, [setProfile, setError])

    return (
        <header className='fixed left-0 top-0 z-30 w-dvw'>
            <nav className='flex-center mx-auto h-24 max-w-screen-md bg-white pt-5 px-safe-or-6 *:flex *:flex-1 *:items-center'>
                <div className='justify-start'>{left}</div>
                <div className='justify-center'>{center}</div>
                <div className='justify-end'>{right}</div>
            </nav>
        </header>
    )
}
