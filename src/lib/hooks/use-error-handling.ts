import { useCallback, useState } from 'react'

export const useErrorHandling = () => {
	const [error, setError] = useState<string | null>(null)

	const handleError = useCallback((message: string, error: Error) => {
		console.error(message, error)
		setError(`${message}: ${error.message}`)
	}, [])

	const resetError = useCallback(() => {
		setError(null)
	}, [])

	return { error, handleError, resetError }
}
