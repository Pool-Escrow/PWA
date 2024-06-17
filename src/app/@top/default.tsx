'use client'

import { getTopBarElements } from '@/components/shared/layout/top-bar/top-bar.config'
import { usePathname } from 'next/navigation'

export default function TopBarLayout() {
	const pathname = usePathname()
	const { left, center, right } = getTopBarElements(pathname)
	return (
		<header className='fixed left-0 top-0 w-full z-10 bg-white min-h-top-bar pb-5 pt-safe-or-5 px-safe-or-6'>
			<nav className='flex-center h-full max-w-screen-md *:items-center *:flex *:flex-1'>
				<div className='justify-start'>{left}</div>
				<div className='justify-center'>{center}</div>
				<div className='justify-end'>{right}</div>
			</nav>
		</header>
	)
}
