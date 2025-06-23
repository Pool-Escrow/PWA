import { getConfig } from '@/providers/configs/wagmi.config'
import { useQuery } from '@tanstack/react-query'
import { fetchTokenDecimals } from './fetch-token-decimal'

export const useTokenDecimals = (tokenAddress: string) => {
    const {
        data: tokenDecimalsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tokenDecimals', tokenAddress, getConfig().state.chainId],
        queryFn: fetchTokenDecimals,
    })

    // Provide a default value of 18 if the query fails
    const decimals = tokenDecimalsData?.tokenDecimals ?? 18

    return { tokenDecimalsData: { tokenDecimals: decimals }, isLoading, error }
}
