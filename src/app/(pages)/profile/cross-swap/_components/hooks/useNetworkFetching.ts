import type { ConnectedWallet } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Chain, Network, OKXNetwork } from '../../types'
import { HttpClient } from '../api/http-client'
import { CONFIG } from '../config'
import { handleAPIError } from '../utils/errors'

// Auxiliary function to convert Chain to Network
const _chainToNetwork = (chain: Chain): Network => ({
    chainId: chain.chainId.toString(),
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpc,
    blockExplorerUrls: chain.explorers?.map(explorer => explorer.url),
})

export const useNetworkFetching = (wallets: ConnectedWallet[]) => {
    const httpClient = HttpClient.getInstance()
    const [afterQuery, setAfterQuery] = useState(false)
    const { data: fetchedNetworks, refetch: fetchNetworks } = useQuery({
        queryKey: ['networks', wallets[0]?.address],
        queryFn: async () => {
            const { path } = CONFIG.API.ENDPOINTS['chains']
            const response = await httpClient.get<OKXNetwork[]>(path)
            setAfterQuery(true)
            if (response.code === '0' && Array.isArray(response.data)) {
                return response.data //response.data.map(chainToNetwork)
            }
            throw new Error(response.msg || 'Failed to fetch networks')
        },
        enabled: !!wallets[0],
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            if (error instanceof Error && error.message.includes('50011')) {
                return failureCount < 3
            }
            return false
        },
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
    // Handle errors outside of the query options
    if (fetchedNetworks === undefined && afterQuery) {
        const error = handleAPIError(new Error('Failed to fetch networks'))
        console.error('Network fetching error:', error.message)
        toast.error(error.message)
    }

    return {
        fetchedNetworks: fetchedNetworks ?? [],
        fetchNetworks,
    }
}
