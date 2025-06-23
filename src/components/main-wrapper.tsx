'use client'

import { DeveloperChainSetup } from '@/components/developer-chain-setup'
import { getPageTransition } from '@/lib/utils/animations'
import { cn } from '@/lib/utils/tailwind'
import { useAppStore } from '@/providers/app-store.provider'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext ?? {})
    const frozen = useRef(context).current

    return <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
}

// We wrap the component with dynamic to ensure it only renders on the client
const ClientFrozenRouter = dynamic(() => Promise.resolve(FrozenRouter), {
    ssr: false,
})

// Error fallback component
function NavigationErrorFallback({ children, error }: { children: React.ReactNode; error?: Error }) {
    if (error) {
        console.error('[MainWrapper] Navigation error:', error)
        return (
            <div className='flex flex-1 items-center justify-center p-4'>
                <div className='text-center'>
                    <p className='mb-4 text-gray-600'>Navigation error occurred</p>
                    <button
                        onClick={() => window.location.reload()}
                        className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
                        Reload Page
                    </button>
                </div>
            </div>
        )
    }
    return <>{children}</>
}

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isBottomBarVisible, isRouting, setIsRouting } = useAppStore(state => ({
        isBottomBarVisible: Boolean(state.bottomBarContent),
        setIsRouting: state.setIsRouting,
        isRouting: state.isRouting,
    }))

    const pathname = usePathname()
    const [currentPath, setCurrentPath] = useState(pathname)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [navigationError, setNavigationError] = useState<Error | null>(null)

    // Add a timeout ref to prevent stuck routing states
    const routingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup function to reset routing state
    const resetRoutingState = useCallback(() => {
        setIsRouting(false)
        setIsTransitioning(false)
        if (routingTimeoutRef.current) {
            clearTimeout(routingTimeoutRef.current)
            routingTimeoutRef.current = null
        }
    }, [setIsRouting])

    // Handle path changes with improved logic
    useEffect(() => {
        try {
            if (pathname !== currentPath) {
                // Clear any existing timeout
                if (routingTimeoutRef.current) {
                    clearTimeout(routingTimeoutRef.current)
                }

                // Only set routing state if we're not already transitioning
                if (!isRouting && !isTransitioning) {
                    setIsRouting(true)
                    setCurrentPath(pathname)

                    // Set a fallback timeout to prevent stuck states
                    routingTimeoutRef.current = setTimeout(() => {
                        console.warn('[MainWrapper] Routing timeout reached, resetting state')
                        resetRoutingState()
                    }, 2000) // 2 second fallback
                } else if (!isTransitioning) {
                    // If we're routing but not transitioning, just update the path
                    setCurrentPath(pathname)
                }
            }
        } catch (error) {
            console.error('[MainWrapper] Path change error:', error)
            setNavigationError(error as Error)
            resetRoutingState()
        }
    }, [pathname, currentPath, isRouting, setIsRouting, isTransitioning, resetRoutingState])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (routingTimeoutRef.current) {
                clearTimeout(routingTimeoutRef.current)
            }
        }
    }, [])

    const handleDragEnd = (_event: unknown, info: { offset: { x: number; y: number } }) => {
        if (info.offset.x > 100) {
            router.back()
        } else if (info.offset.x < -100) {
            router.forward()
        }
    }

    // Handle animation events with better error handling
    const handleAnimationStart = useCallback(() => {
        setIsTransitioning(true)
    }, [])

    const handleAnimationComplete = useCallback(() => {
        resetRoutingState()
    }, [resetRoutingState])

    // Safe page transition with error handling
    let pageTransition
    try {
        pageTransition = getPageTransition(pathname)
    } catch (error) {
        console.error('[MainWrapper] Page transition error:', error)
        setNavigationError(error as Error)
        pageTransition = {
            variants: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
            },
            transition: { duration: 0.3 },
        }
    }

    // If there's a navigation error, show the error fallback
    if (navigationError) {
        return (
            <main
                className={cn(
                    'relative mx-auto flex w-dvw max-w-screen-md flex-1 flex-col overflow-hidden px-safe-or-2',
                    'pb-safe-offset',
                    isBottomBarVisible ? 'mb-safe-or-24' : 'mb-safe',
                )}>
                <NavigationErrorFallback error={navigationError}>{children}</NavigationErrorFallback>
            </main>
        )
    }

    return (
        <main
            className={cn(
                'relative mx-auto flex w-dvw max-w-screen-md flex-1 flex-col overflow-hidden px-safe-or-2',
                'pb-safe-offset',
                isBottomBarVisible ? 'mb-safe-or-24' : 'mb-safe',
            )}>
            {/* Developer chain setup - handles automatic chain switching */}
            <DeveloperChainSetup />

            <AnimatePresence mode='popLayout' initial={false} onExitComplete={handleAnimationComplete}>
                <motion.div
                    key={currentPath}
                    className='flex flex-1 flex-col pt-safe'
                    drag={pathname === '/profile' ? 'x' : undefined}
                    dragConstraints={pathname === '/profile' ? { left: 0, right: 0 } : undefined}
                    dragElastic={0.2}
                    onDragEnd={pathname === '/profile' ? handleDragEnd : undefined}
                    onAnimationStart={handleAnimationStart}
                    onAnimationComplete={handleAnimationComplete}
                    variants={pageTransition.variants}
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    transition={pageTransition.transition}>
                    <ClientFrozenRouter>
                        <NavigationErrorFallback error={navigationError || undefined}>
                            {children}
                        </NavigationErrorFallback>
                    </ClientFrozenRouter>
                </motion.div>
            </AnimatePresence>
        </main>
    )
}
