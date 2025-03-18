import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Network, OKXToken } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'

interface TokenSelectionProps {
    fromNetwork: Network
}

interface APIResponse<T> {
    code: string
    msg?: string
    data: T
}

class ServiceUnavailableError extends Error {
    constructor() {
        super('Service temporarily unavailable')
        this.name = 'ServiceUnavailableError'
    }
}

export const useTokenSelection = ({ fromNetwork }: TokenSelectionProps) => {
    const [selectedNetwork, setSelectedNetwork] = useState<string>(fromNetwork.chainId)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [allTokens, setAllTokens] = useState<OKXToken[]>([])
    const [lastError, setLastError] = useState<Error | null>(null)

    const httpClient = HttpClient.getInstance()

    console.log('[TokenSelection] Initial state:', {
        selectedNetwork,
        fromNetwork,
        searchQuery,
        allTokensLength: allTokens.length,
    })

    const {
        data: tokens,
        isLoading,
        refetch,
    } = useQuery<OKXToken[]>({
        queryKey: ['tokens', selectedNetwork],
        queryFn: async (): Promise<OKXToken[]> => {
            console.log('[TokenSelection] Fetching tokens for network:', selectedNetwork)
            const { path } = CONFIG.API.ENDPOINTS['tokens/all']

            try {
                const response = await httpClient.get<APIResponse<OKXToken[]>>(path, {
                    chainId: selectedNetwork,
                })
                console.log('[TokenSelection] API Response:', {
                    code: response.code,
                    dataLength: Array.isArray(response.data) ? response.data.length : 0,
                    error: response.msg,
                })

                // Clear last error if request succeeds
                setLastError(null)

                if (response.code === '50050') {
                    const serviceError = new ServiceUnavailableError()
                    setLastError(serviceError)
                    throw serviceError
                }

                if (response.code !== '0') {
                    const apiError = new Error(response.msg || 'Failed to fetch tokens')
                    setLastError(apiError)
                    throw apiError
                }

                if (!Array.isArray(response.data)) {
                    throw new Error('Invalid response format: expected array of tokens')
                }

                return response.data
            } catch (err) {
                console.error('[TokenSelection] API Error:', err)
                const error = err instanceof Error ? err : new Error('Unknown error')
                // Only show error toast for non-service-unavailable errors
                if (!(error instanceof ServiceUnavailableError)) {
                    toast.error('Error loading tokens. Please try again later.')
                }
                setLastError(error)
                throw error
            }
        },
        enabled: !!selectedNetwork,
        retry: (failureCount, error) => {
            // Only retry for non-service-unavailable errors
            return failureCount < 3 && !(error instanceof ServiceUnavailableError)
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    })

    // Update tokens state when query data changes
    useEffect(() => {
        console.log('[TokenSelection] Tokens updated:', {
            hasTokens: !!tokens,
            tokensLength: tokens?.length ?? 0,
            selectedNetwork,
            isAll: selectedNetwork === 'all',
        })

        if (tokens) {
            if (selectedNetwork === 'all') {
                setAllTokens(prev => {
                    const newTokens = [...prev, ...tokens]
                    console.log('[TokenSelection] Updated allTokens for "all":', {
                        prevLength: prev.length,
                        newLength: newTokens.length,
                    })
                    return newTokens
                })
            } else {
                setAllTokens(tokens)
                console.log('[TokenSelection] Set specific network tokens:', {
                    length: tokens.length,
                })
            }
        }
    }, [tokens, selectedNetwork])

    // Update selected network when fromNetwork changes
    useEffect(() => {
        console.log('[TokenSelection] Network changed:', {
            from: selectedNetwork,
            to: fromNetwork.chainId,
        })
        setSelectedNetwork(fromNetwork.chainId)
        void refetch()
    }, [fromNetwork, refetch, selectedNetwork])

    const currentTokens = selectedNetwork === 'all' ? allTokens : (tokens ?? [])

    const filteredTokens = currentTokens.filter((token: OKXToken) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            token.tokenSymbol.toLowerCase().includes(searchLower) ||
            token.tokenName?.toLowerCase().includes(searchLower) ||
            false
        )
    })

    const isServiceUnavailable = lastError instanceof ServiceUnavailableError

    console.log('[TokenSelection] Final state:', {
        currentTokensLength: currentTokens.length,
        filteredTokensLength: filteredTokens.length,
        selectedNetwork,
        isLoading,
        hasError: !!lastError,
        isServiceUnavailable,
        errorType: lastError?.name,
    })

    return {
        tokens: currentTokens,
        filteredTokens,
        selectedNetwork,
        searchQuery,
        setSelectedNetwork,
        setSearchQuery,
        isLoading,
        error: lastError,
        isServiceUnavailable,
        hasTokens: currentTokens.length > 0,
        hasFilteredTokens: filteredTokens.length > 0,
        refetch,
    }
}

export type TokenSelectionReturn = ReturnType<typeof useTokenSelection>
