/**
 * @file src/lib/hooks/use-pools.ts
 * @description hook to fetch pools from the contract
 */
import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPools } from '../contracts/fetch-pools'

export const usePools = () =>
    useQuery({
        queryKey: ['pools', wagmi.config.state.chainId],
        queryFn: fetchPools,
        staleTime: 60_000, // 1 minute
    })
