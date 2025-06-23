'use client'

import { createUserAction } from '@/server/actions/create-user.action'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDisconnect } from 'wagmi'
import { useServerActionMutation } from './server-action-hooks'

export function useAuth() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [toastId, setToastId] = useState<string | number | null>(0)

    const { mutate: createNewUser } = useServerActionMutation(createUserAction, {
        onSuccess: () => {
            console.log('[use-auth] user created in database')
            if (toastId !== 0) {
                setToastId(
                    toast.success('Welcome to the Pool family!', {
                        richColors: true,
                        description: 'Please fill in your profile information.',
                    }),
                )
            }
        },
        onError: (error: unknown) => {
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
                void queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })
            },
        },
    })

    const { logout: privyLogout } = useLogout({
        onSuccess: () => {
            console.log('[use-auth] logout success')
            void queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })
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
            void queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })
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
        onComplete({
            // user,
            isNewUser,
            wasAlreadyAuthenticated,
            loginMethod,
            // loginAccount,
        }) {
            // Reduce console logging to prevent noise
            if (process.env.NODE_ENV === 'development') {
                console.log('[use-auth] auth complete', { isNewUser, wasAlreadyAuthenticated })
            }
            void queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] })

            if (isNewUser) {
                createNewUser(undefined, {
                    onSuccess: () => {
                        router.replace('/profile/new')
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[use-auth] new user created', { loginMethod })
                        }
                    },
                })
                // this mutation does not need any arguments, so we pass undefined
                return
            }

            if (wasAlreadyAuthenticated) {
                // Only log in development mode to reduce noise
                if (process.env.NODE_ENV === 'development') {
                    console.log('[use-auth] already authenticated')
                }
                return
            }

            router.refresh()
        },
        onError(error) {
            if (error.toString() === 'exited_auth_flow') {
                return console.log('[use-auth] exited auth flow')
            }

            if (error.toString() === 'generic_connect_wallet_error') {
                // search for the close button and simulate a click
                setTimeout(() => {
                    console.log('[use-auth] generic connect wallet error, attempting to close modal')

                    const closeButton = document.querySelector('button[aria-label="close modal"]') as HTMLButtonElement
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
