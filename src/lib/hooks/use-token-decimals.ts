import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchTokenDecimals } from '../contracts/fetch-token-decimals'

export const useTokenDecimals = (tokenAddress: string) => {
    const {
        data: tokenDecimalsData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tokenDecimals', tokenAddress, wagmi.config.state.chainId],
        queryFn: fetchTokenDecimals,
    })

    return { tokenDecimalsData, isLoading, error }
}
