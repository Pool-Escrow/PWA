'use client'

import { getTopBarElements } from '@/components/shared/layout/top-bar/top-bar.config'
import { usePathname } from 'next/navigation'

export default function TopBarLayout(): JSX.Element {
    const pathname = usePathname()
    const { left, center, right } = getTopBarElements(pathname)
    return (
        <header className='fixed left-0 top-0 z-10 h-top-bar min-w-full '>
            <nav className='flex-center h-full max-w-screen-md bg-white pb-5 pt-safe-or-5 px-safe-or-6 *:flex *:flex-1 *:items-center'>
                <div className='justify-start'>{left}</div>
                <div className='justify-center'>{center}</div>
                <div className='justify-end'>{right}</div>
            </nav>
        </header>
    )
}
