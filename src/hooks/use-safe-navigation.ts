'use client'

import { useAppStore } from '@/providers/app-store.provider'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

/**
 * A safer navigation hook that handles routing state properly
 * and prevents navigation issues that can cause blank screens
 */
export function useSafeNavigation() {
    const router = useRouter()
    const { isRouting, setIsRouting } = useAppStore(state => ({
        isRouting: state.isRouting,
        setIsRouting: state.setIsRouting,
    }))

    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const safeNavigate = useCallback(
        (path: string, options?: { replace?: boolean }) => {
            // Prevent navigation if already routing
            if (isRouting) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[useSafeNavigation] Navigation blocked - already routing')
                }
                return false
            }

            try {
                // Clear any existing timeout
                if (navigationTimeoutRef.current) {
                    clearTimeout(navigationTimeoutRef.current)
                }

                // Set routing state
                setIsRouting(true)

                // Set a fallback timeout to reset routing state
                navigationTimeoutRef.current = setTimeout(() => {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[useSafeNavigation] Navigation timeout reached, resetting routing state')
                    }
                    setIsRouting(false)
                }, 3000)

                // Perform navigation
                if (options?.replace) {
                    router.replace(path)
                } else {
                    router.push(path)
                }

                return true
            } catch (error) {
                console.error('[useSafeNavigation] Navigation error:', error)
                setIsRouting(false)
                if (navigationTimeoutRef.current) {
                    clearTimeout(navigationTimeoutRef.current)
                }
                return false
            }
        },
        [router, isRouting, setIsRouting],
    )

    const safeBack = useCallback(() => {
        if (isRouting) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[useSafeNavigation] Back navigation blocked - already routing')
            }
            return false
        }

        try {
            setIsRouting(true)
            router.back()
            return true
        } catch (error) {
            console.error('[useSafeNavigation] Back navigation error:', error)
            setIsRouting(false)
            return false
        }
    }, [router, isRouting, setIsRouting])

    const safeForward = useCallback(() => {
        if (isRouting) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[useSafeNavigation] Forward navigation blocked - already routing')
            }
            return false
        }

        try {
            setIsRouting(true)
            router.forward()
            return true
        } catch (error) {
            console.error('[useSafeNavigation] Forward navigation error:', error)
            setIsRouting(false)
            return false
        }
    }, [router, isRouting, setIsRouting])

    return {
        navigate: safeNavigate,
        back: safeBack,
        forward: safeForward,
        isRouting,
    }
}
