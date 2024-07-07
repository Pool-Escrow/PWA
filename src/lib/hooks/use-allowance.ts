import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPoolDetails } from '../contracts/fetch-pool-details'
import { fetchAllowance } from '../contracts/fetch-allowance'
import { Address } from 'viem'

export const useAllowance = (address: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['allowance', address],
        queryFn: fetchAllowance,
    })

    return { data, isLoading, error }
}
