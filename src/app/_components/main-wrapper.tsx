'use client'

import { cn } from '@/lib/utils/tailwind'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useContext, useRef } from 'react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { getPageTransition } from '@/lib/utils/animations'
import dynamic from 'next/dynamic'

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext ?? {})
    const frozen = useRef(context).current

    return <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
}

// We wrap the component with dynamic to ensure it only renders on the client
const ClientFrozenRouter = dynamic(() => Promise.resolve(FrozenRouter), {
    ssr: false,
})

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isBottomBarVisible, setIsTransitioning } = useAppStore(state => ({
        isBottomBarVisible: Boolean(state.bottomBarContent),
        setIsTransitioning: state.setIsPageTransitioning,
    }))

    const pathname = usePathname()
    const [isRouting, setIsRouting] = useState(false)
    const [currentPath, setCurrentPath] = useState(pathname)

    useEffect(() => {
        if (pathname !== currentPath && !isRouting) {
            setIsTransitioning(true)
            setIsRouting(true)
            setCurrentPath(pathname)
        }
    }, [pathname, currentPath, isRouting, setIsTransitioning])

    const handleDragEnd = (_event: any, info: any) => {
        if (info.offset.x > 100) {
            router.back()
        } else if (info.offset.x < -100) {
            router.forward()
        }
    }

    const pageTransition = getPageTransition(pathname)

    return (
        <main
            className={cn(
                'relative mx-auto flex w-dvw max-w-screen-md flex-1 flex-col overflow-hidden px-safe-or-2',
                'pb-safe-offset',
                isBottomBarVisible ? 'mb-safe-or-24' : 'mb-safe',
            )}>
            <AnimatePresence
                mode='popLayout'
                initial={false}
                onExitComplete={() => {
                    setIsRouting(false)
                    setIsTransitioning(false)
                }}>
                <motion.div
                    key={currentPath}
                    className='flex flex-1 flex-col pt-safe'
                    drag={pathname === '/profile' ? 'x' : undefined}
                    dragConstraints={pathname === '/profile' ? { left: 0, right: 0 } : undefined}
                    dragElastic={0.2}
                    onDragEnd={pathname === '/profile' ? handleDragEnd : undefined}
                    variants={pageTransition.variants}
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    transition={pageTransition.transition}>
                    <ClientFrozenRouter>{children}</ClientFrozenRouter>
                </motion.div>
            </AnimatePresence>
        </main>
    )
}
