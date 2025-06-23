import type { CallbackError } from '@privy-io/react-auth'
import { useCallback, useState } from 'react'

type ExtractPrivyErrorCode<T> = T extends (error: infer E) => void ? E : never
export type PrivyErrorCode = ExtractPrivyErrorCode<CallbackError>

export const useErrorHandling = () => {
    const [error, setError] = useState<string | null>(null)

    const handleError = useCallback((message: string, errorOrCode: PrivyErrorCode | Error) => {
        console.error(message, errorOrCode)

        if (typeof errorOrCode === 'string') {
            // Handle PrivyErrorCode
            setError(`${message}: ${errorOrCode}`)
        } else if (errorOrCode instanceof Error) {
            // Handle standard Error objects
            setError(`${message}: ${errorOrCode.message}`)
        } else {
            // Handle any other type of error
            setError(`${message}: Unknown error`)
        }
    }, [])

    const resetError = useCallback(() => {
        setError(null)
    }, [])

    return { error, handleError, resetError }
}
