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

            if (result.isNewUser) {
                router.push('/participant/new')
            } else if (!isNewUser) {
                // user already exists in privy, but not in our db
                console.log('User already exists in privy, but not in our db')
                router.push('/participant/new')
            } else {
                router.push('/')
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
