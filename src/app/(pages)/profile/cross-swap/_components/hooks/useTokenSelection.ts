import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { Network, OKXToken } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'

interface TokenSelectionProps {
    fromNetwork: Network
}

export const useTokenSelection = ({ fromNetwork }: TokenSelectionProps) => {
    const [selectedNetwork, setSelectedNetwork] = useState<string>(fromNetwork.chainId)
    const [searchQuery, setSearchQuery] = useState<string>('')

    const httpClient = HttpClient.getInstance()

    const {
        data: tokens,
        isLoading,
        error,
        refetch,
    } = useQuery<OKXToken[], Error>({
        queryKey: ['tokens', selectedNetwork],
        queryFn: async (): Promise<OKXToken[]> => {
            const { path } = CONFIG.API.ENDPOINTS['tokens/all']
            const response = await httpClient.get<OKXToken[]>(path, {
                chainId: selectedNetwork,
            })

            if (response.code !== '0') {
                throw new Error(response.msg || 'Failed to fetch tokens')
            }

            return response.data
        },
        enabled: !!selectedNetwork && selectedNetwork !== 'all',
    })

    // Update selected network when fromNetwork changes
    useEffect(() => {
        setSelectedNetwork(fromNetwork.chainId)
        void refetch()
    }, [fromNetwork, refetch])

    const filteredTokens =
        tokens?.filter(token => {
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch =
                token.tokenSymbol.toLowerCase().includes(searchLower) ||
                token?.tokenName?.toLowerCase().includes(searchLower)
            return matchesSearch
        }) ?? []

    return {
        tokens: tokens ?? [],
        filteredTokens,
        selectedNetwork,
        searchQuery,
        setSelectedNetwork,
        setSearchQuery,
        isLoading,
        error,
        hasTokens: Boolean(tokens?.length),
        hasFilteredTokens: filteredTokens.length > 0,
    }
}

export type TokenSelectionReturn = ReturnType<typeof useTokenSelection>
