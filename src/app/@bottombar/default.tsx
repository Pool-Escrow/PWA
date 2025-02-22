'use client'

import { appStore$ } from '@/app/stores/app.store'
import { use$ } from '@legendapp/state/react'
import { AnimatePresence, motion } from 'motion/react'

export default function BottomBar() {
    const content = use$(appStore$.settings.bottomBarContent)

    if (!content) return null

    return (
        <AnimatePresence mode='wait'>
            <motion.footer
                initial={{ opacity: 0.7, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.7, y: 100 }}
                transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.4,
                }}
                className='fixed bottom-0 left-0 z-30 w-full'>
                <nav className='flex-center mx-auto h-24 max-w-screen-md rounded-t-3xl bg-neutral-100/50 pb-3 shadow-sm shadow-black/25 backdrop-blur-[32.10px] px-safe-or-4'>
                    {content}
                </nav>
            </motion.footer>
        </AnimatePresence>
    )
}
