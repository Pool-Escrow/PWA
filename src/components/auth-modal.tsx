'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthModal() {
    const { login, authenticated, ready } = usePrivy()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (!ready) return

        const authRequired = searchParams.get('auth') === 'required'

        if (authRequired) {
            if (authenticated) {
                // Si ya está autenticado, simplemente removemos el parámetro auth
                const url = new URL(window.location.href)
                url.searchParams.delete('auth')
                router.replace(url.pathname + url.search)
            } else {
                // Solo intentamos login si no está autenticado
                login()
            }
        }
    }, [ready, authenticated, searchParams, login, router])

    return null
}
