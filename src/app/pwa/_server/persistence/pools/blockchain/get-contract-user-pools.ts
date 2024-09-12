// src/persistence/pools/blockchain/get-user-pools.ts
import 'server-only'

import { poolAbi, poolAddress } from '@/types/contracts'
import { createConfig, getPublicClient, multicall } from '@wagmi/core'
import { baseSepolia } from '@wagmi/core/chains'
import type { Address } from 'viem'
import { getAbiItem, http } from 'viem'

const config = createConfig({
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    syncConnectedChain: true,
    transports: {
        [baseSepolia.id]: http(process.env.RPC_ENDPOINT),
    },
    ssr: true,
})

const publicClient = getPublicClient(config)

const GetPoolsCreatedBy = getAbiItem({
    abi: poolAbi,
    name: 'getPoolsCreatedBy',
})

const GetPoolsJoinedBy = getAbiItem({
    abi: poolAbi,
    name: 'getPoolsJoinedBy',
})

const GetAllPoolInfo = getAbiItem({
    abi: poolAbi,
    name: 'getAllPoolInfo',
})

export async function getUserPools(userAddress: Address) {
    const [createdPoolsResult, joinedPoolsResult] = await multicall(config, {
        contracts: [
            {
                address: poolAddress[publicClient.chain.id],
                abi: [GetPoolsCreatedBy],
                functionName: 'getPoolsCreatedBy',
                args: [userAddress],
            },
            {
                address: poolAddress[publicClient.chain.id],
                abi: [GetPoolsJoinedBy],
                functionName: 'getPoolsJoinedBy',
                args: [userAddress],
            },
        ],
    })

    if (createdPoolsResult.status !== 'success' || joinedPoolsResult.status !== 'success') {
        throw new Error('Failed to fetch user pools')
    }

    const createdPools = createdPoolsResult.result
    const joinedPools = joinedPoolsResult.result
    const allUserPools = [...new Set([...createdPools, ...joinedPools])]

    const poolDetailsResults = await multicall(config, {
        contracts: allUserPools.map(poolId => ({
            address: poolAddress[publicClient.chain.id] as Address,
            abi: [GetAllPoolInfo],
            functionName: 'getAllPoolInfo',
            args: [poolId],
        })),
    })

    return poolDetailsResults
        .map((result, index) => {
            if (result.status === 'success') {
                const [, poolDetail, , poolStatus, , participants] = result.result
                return {
                    id: allUserPools[index].toString(),
                    timeStart: Number(poolDetail.timeStart),
                    timeEnd: Number(poolDetail.timeEnd),
                    status: poolStatus,
                    name: poolDetail.poolName,
                    numParticipants: participants.length,
                }
            }
            return null
        })
        .filter(Boolean)
}
