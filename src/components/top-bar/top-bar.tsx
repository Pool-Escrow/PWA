'use client'

import { usePathname } from 'next/navigation'
import { getTopBarElements } from './top-bar.config'

export default function TopBarLayout(): JSX.Element {
    const pathname = usePathname()
    const { left, center, right } = getTopBarElements(pathname)

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
