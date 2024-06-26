'use client'

import { useLogin, type CallbackError } from '@privy-io/react-auth'
import { useState } from 'react'
import { useErrorHandling } from './use-error-handling'
import { useInitializeAccount } from './use-initialize-account'
import { createOrUpdateUser } from '@/components/profile/profile.action'
import { useRouter } from 'next/navigation'

export const useSmartAccount = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { error, handleError, resetError } = useErrorHandling()
    const initializeAccount = useInitializeAccount(handleError)

    const { login } = useLogin({
        onComplete: async (user, isNewUser) => {
            if (!user.wallet) {
                throw new Error('Wallet not found')
            }

            const result = await createOrUpdateUser(user.id, user.wallet.address)

            if (result.isNewUser || isNewUser) {
                router.push('/profile/new')
            } else {
                // Check if the user has a displayName and avatar
                if (result.user.displayName && result.user.avatar) {
                    router.push('/')
                } else {
                    router.push('/profile/new')
                }
            }

            setLoading(true)
            resetError()

            try {
                void initializeAccount()
            } catch (error) {
            } finally {
                setLoading(false)
            }
        },
        onError: (error: CallbackError['arguments']) => handleError('Login error', error),
    })

    return { login, loading, error }
}
