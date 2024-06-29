/**
 * @file src/lib/hooks/use-pools.ts
 * @description hook to fetch pools from the contract
 */

import { useQuery } from '@tanstack/react-query'
import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient, multicall } from '@wagmi/core'
import { Address, getAbiItem } from 'viem'
import { usePoolStore } from '@/stores/pool.store'
import { fetchPoolsFromDb } from '@/components/pools/pools.actions'
import { combinePoolData } from '@/components/pools/combine-pool-data'

const PoolDetailsFunction = getAbiItem({
    abi: poolAbi,
    name: 'getPoolDetail',
})

const PoolTokenProperty = getAbiItem({
    abi: poolAbi,
    name: 'poolToken',
})

const publicClient = getPublicClient(wagmi.config)
const chainId = wagmi.config.state.chainId as ChainId

if (!publicClient) {
    throw new Error('Wagmi Public client not found')
}

const fetchPoolsFromContract = async (): Promise<PoolFromContract[]> => {
    const latestPoolId = await publicClient.readContract({
        address: poolAddress[chainId],
        abi: poolAbi,
        functionName: 'latestPoolId',
    })

    const poolIds = Array.from({ length: Number(latestPoolId) }, (_, i) => BigInt(i + 1))

    const poolTokens = await multicall(wagmi.config, {
        contracts: poolIds.map(id => ({
            abi: [PoolTokenProperty],
            address: poolAddress[chainId],
            functionName: 'poolToken',
            args: [id],
        })),
    })

    const results = await multicall(wagmi.config, {
        contracts: poolIds.map(id => ({
            abi: [PoolDetailsFunction],
            address: poolAddress[chainId],
            functionName: 'getPoolDetail',
            args: [id],
        })),
    })

    return poolIds.map((id, index) => {
        const pool = results[index].result
        const token = poolTokens[index].result
        if (!pool || !token) {
            throw new Error(`No pool/token found for id: ${id}`)
        }

        return {
            id: Number(id),
            tokenAddress: token,
            // fixes issue with bigint serialization
            ...Object.fromEntries(
                Object.entries(pool).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value]),
            ),
        }
    })
}

export const fetchPools = async (): Promise<any[]> => {
    const contractPools = await fetchPoolsFromContract()
    const dbPools = await fetchPoolsFromDb()
    return combinePoolData(contractPools, dbPools)
}

export const fetchUserPools = async (address: Address): Promise<PoolFrontend[]> => {
    const userParticipatedPools = await multicall(wagmi.config, {
        contracts: [
            {
                abi: poolAbi,
                address: poolAddress[chainId],
                functionName: 'getPoolsJoinedBy',
                args: [address],
            },
            {
                abi: poolAbi,
                address: poolAddress[chainId],
                functionName: 'getPoolsCreatedBy',
                args: [address],
            },
        ],
    })

    const userPoolIds: Set<string> = new Set(
        userParticipatedPools
            .map(({ result }) => result)
            .filter((result): result is readonly bigint[] => result != null)
            .flat()
            .map(id => id.toString()),
    )

    const userPools = (await fetchPools()).filter(pool => userPoolIds.has(pool.contract_id))

    return userPools
}

export const usePools = () => {
    const { pools, updatePoolsWithContractData, setError } = usePoolStore()

    return useQuery({
        queryKey: ['pools', wagmi.config.state.chainId],
        queryFn: async () => {
            try {
                const contractPools = await fetchPoolsFromContract()
                updatePoolsWithContractData(contractPools)
                return pools
            } catch (error) {
                setError(error as Error)
                throw error
            }
        },
        staleTime: 60_000, // 1 minute
    })
}

export const useUserPools = (address: Address) => {
    return useQuery({
        queryKey: ['userPools', address],
        queryFn: () => fetchUserPools(address),
        enabled: !!address,
    })
}
