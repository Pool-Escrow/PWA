'use client'

import { motion } from 'framer-motion'
import BackButton from './back-button'
import PageTitle from './page-title'
import { usePathname } from 'next/navigation'
import { getPageTransition } from '@/lib/utils/animations'
import UserMenu from './user-menu'

export type TopBarProps = {
    title?: string
    backButton?: boolean
    actionButton?: React.ReactNode
}

function TopBarContent({ title, backButton, actionButton }: TopBarProps) {
    const pathname = usePathname()
    const pageTransition = getPageTransition(pathname)

    return (
        <motion.div
            variants={pageTransition.variants}
            initial={false}
            animate='animate'
            exit='exit'
            key={pathname}
            transition={pageTransition.transition}
            className='grid h-24 grid-cols-[1fr_auto_1fr] items-center'>
            <div className='w-6'>{backButton && <BackButton />}</div>
            <div className='text-center'>
                <PageTitle title={title} />
            </div>
            <div className='justify-self-end'>{actionButton ?? <UserMenu />}</div>
        </motion.div>
    )
}

export default function TopBar(props: TopBarProps) {
    return (
        <header className='z-30 bg-white'>
            <nav className='mx-auto h-24 max-w-screen-md px-safe-or-6'>
                <TopBarContent {...props} />
            </nav>
        </header>
    )
}
