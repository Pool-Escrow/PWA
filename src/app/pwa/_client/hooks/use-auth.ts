'use client'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useAuth() {
    const router = useRouter()
    const { logout } = useLogout({
        onSuccess() {
            console.log('[use-auth] logout success')
            router.replace('/' as Route)
        },
    })
    const { login } = useLogin({
        onComplete(user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount) {
            console.log('[use-auth] auth complete')
            if (isNewUser) {
                console.log('[use-auth] new user', { loginMethod, loginAccount })
            }

            if (wasAlreadyAuthenticated) {
                console.log('[use-auth] already authenticated')
            }

            console.log('[use-auth] user', user)
        },
        onError(error) {
            console.error('[use-auth] error', error)
            toast.error('An error occurred while logging in. Please try again.')
            router.refresh()
        },
    })

    const { ready, authenticated } = usePrivy()

    return { login, logout, authenticated: ready && authenticated, ready }
}
