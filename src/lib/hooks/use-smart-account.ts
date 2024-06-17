'use client'

import { useLogin, type CallbackError } from '@privy-io/react-auth'
import { useState } from 'react'
import { useErrorHandling } from './use-error-handling'
import { useInitializeAccount } from './use-initialize-account'

export const useSmartAccount = () => {
	const [loading, setLoading] = useState(false)
	const { error, handleError, resetError } = useErrorHandling()
	const initializeAccount = useInitializeAccount(handleError)

	const { login } = useLogin({
		onComplete: async (_user, isNewUser) => {
			if (!isNewUser) return
			setLoading(true)
			resetError()
			await initializeAccount()
			setLoading(false)
		},
		onError: (error: CallbackError['arguments']) =>
			handleError('Login error', error),
	})

	return { login, loading, error }
}
