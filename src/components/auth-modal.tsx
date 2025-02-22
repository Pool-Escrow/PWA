'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { memo, useCallback, useEffect, useRef } from 'react'

const AuthModal = memo(function AuthModal() {
    const { login, authenticated, ready } = usePrivy()
    const searchParams = useSearchParams()
    const router = useRouter()

    const lastStateRef = useRef({ ready, authenticated })

    const handleAuthCheck = useCallback(() => {
        const authRequired = searchParams.get('auth') === 'required'

        // Early return si no hay necesidad de auth check
        if (!authRequired && authenticated) {
            return
        }

        if (!ready) {
            console.info('⏳ [AuthModal] Not ready yet, skipping check')
            return
        }

        // Solo logear si algo cambió
        if (lastStateRef.current.ready !== ready || lastStateRef.current.authenticated !== authenticated) {
            console.info('🎫 [AuthModal] Auth check:', { ready, authenticated, authRequired })
            lastStateRef.current = { ready, authenticated }
        }

        if (authRequired) {
            if (authenticated) {
                console.info('✅ [AuthModal] Already authenticated, cleaning URL')
                const url = new URL(window.location.href)
                url.searchParams.delete('auth')
                router.replace(url.pathname + url.search)
            } else {
                console.info('🔑 [AuthModal] Not authenticated, triggering login')
                login()
            }
        }
    }, [ready, authenticated, searchParams, login, router])

    useEffect(() => {
        // Solo ejecutar el efecto si ready o authenticated cambian y es necesario
        const authRequired = searchParams.get('auth') === 'required'
        if (
            (lastStateRef.current.ready !== ready || lastStateRef.current.authenticated !== authenticated) &&
            (authRequired || !authenticated)
        ) {
            console.info('🔄 [AuthModal] State changed:', { ready, authenticated, authRequired })
            handleAuthCheck()
        }
    }, [ready, authenticated, handleAuthCheck, searchParams])

    // No renderizar nada si no es necesario
    return null
})

export default AuthModal
