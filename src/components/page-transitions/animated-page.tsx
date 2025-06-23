'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { type PropsWithChildren } from 'react'
import { fadeInOutTransition, fadeInOutVariants, slideUpDownTransition, slideUpDownVariants } from './variants'

const AnimatedPage = ({ children, animation = 'fade' }: PropsWithChildren & { animation?: 'fade' | 'slide' }) => {
    const pathname = usePathname()

    if (!pathname) return null

    const [variants, transition] =
        animation === 'fade' ? [fadeInOutVariants, fadeInOutTransition] : [slideUpDownVariants, slideUpDownTransition]

    return (
        <AnimatePresence mode='sync' initial={false}>
            <motion.main
                key={pathname}
                initial='initial'
                animate='in'
                exit='out'
                variants={variants}
                transition={transition}
                className='mx-auto flex size-full w-dvw max-w-screen-md flex-1 flex-col py-safe-offset-24 px-safe-or-6'>
                {children}
            </motion.main>
        </AnimatePresence>
    )
}

export default AnimatedPage
