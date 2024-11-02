'use client'

import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useDisconnect } from 'wagmi'
import { useServerActionMutation } from './server-action-hooks'
import { createUserAction } from '@/server/actions/create-user.action'
import { useQueryClient } from '@tanstack/react-query'

export function useAuth() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { user } = usePrivy()

    const { mutate: createNewUser } = useServerActionMutation(createUserAction, {
        onSuccess: () => {
            console.log('[use-auth] user created in database')
            toast.success('Welcome to the Pool family!', {
                richColors: true,
                description: 'Please fill in your profile information.',
            })
        },
        onError: error => {
            console.error('[use-auth] error creating user:', error)
            toast.error('Account creation failed. Please try again.', {
                richColors: true,
            })
        },
    })

    const { disconnect, connectors } = useDisconnect({
        mutation: {
            onSuccess: () => {
                console.log('[use-auth] disconnect success')
            },
        },
    })

    const { logout: privyLogout } = useLogout({
        onSuccess: () => {
            console.log('[use-auth] logout success')
            queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })
            if (connectors.length > 0) {
                console.log('[use-auth] disconnecting connectors', connectors)
                disconnect()
            }
        },
    })

    // Create a wrapper function that handles both logout and navigation
    const handleLogout = async () => {
        try {
            await privyLogout()
            console.log('[use-auth] navigation after logout')
            router.replace('/')
            router.refresh()
            return true
        } catch (error) {
            console.error('[use-auth] logout error:', error)
            throw error
        }
    }

    const { login } = useLogin({
        async onComplete(user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount) {
            console.log('[use-auth] auth complete')
            queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })

            if (isNewUser) {
                router.replace('/profile/new')
                console.log('[use-auth] new user', { loginMethod, loginAccount })
                // this mutation does not need any arguments, so we pass undefined
                createNewUser(undefined)
                return
            }

            if (wasAlreadyAuthenticated) {
                console.log('[use-auth] already authenticated')
                return
            }

            router.refresh()
            console.log('[use-auth] user', user)
        },
        onError(error) {
            if (error === 'exited_auth_flow') {
                return console.log('[use-auth] exited auth flow')
            }

            if (error === 'generic_connect_wallet_error') {
                // search for the close button and simulate a click
                setTimeout(() => {
                    console.log('[use-auth] generic connect wallet error, attempting to close modal')

                    const closeButton = document.querySelector(
                        'button[aria-label="close modal"]',
                    ) as HTMLButtonElement | null
                    if (closeButton) {
                        closeButton.click()
                        console.log('[use-auth] close button clicked')

                        // try to restart the login process
                        setTimeout(() => {
                            console.log('[use-auth] attempting to restart login process')
                            login()
                        }, 500)
                    } else {
                        console.error('[use-auth] close button not found')
                    }
                }, 100)

                toast.warning('Login attempt cancelled', {
                    description: 'Please try again.',
                    richColors: true,
                })

                return
            }

            console.error('[use-auth] error', error)
            toast.error('An error occurred while logging in. Please try again.', {
                richColors: true,
            })
            router.refresh()
        },
    })

    const { ready, authenticated } = usePrivy()

    return {
        login,
        logout: handleLogout,
        authenticated: ready && authenticated,
        ready,
    }
}
