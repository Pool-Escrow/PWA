// import 'server-only'

import { poolAbi } from '@/types/contracts'
import { getPublicClient, multicall } from '@wagmi/core'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import { currentPoolAddress, getDefaultPublicClient, serverConfig } from '../../../blockchain/server-config'
import type { ContractPool } from './get-contract-pools'

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

export async function getUserPools(userAddress: Address, chainId?: number): Promise<ContractPool[]> {
    /*
     * Allow dynamic chain selection so we can query user pool data on the chain that the
     * user (or caller) is currently connected to.  If a "chainId" is provided we
     * resolve the correct public client and pool contract address for that chain.
     * Otherwise, we fallback to the default client / address configured in
     * `server-config`.
     */

    const publicClient = chainId ? getPublicClient(serverConfig, { chainId }) : getDefaultPublicClient()

    if (!publicClient) {
        throw new Error(`[getUserPools] Failed to obtain public client for chainId ${chainId ?? 'default'}`)
    }

    // Get the actual chain ID from the client to ensure consistency
    const actualChainId = publicClient.chain?.id || chainId

    // Log for debugging only with verbose flag
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log(`[getUserPools] Using chain ${actualChainId}, user: ${userAddress}`)
    }

    const [createdPoolsResult, joinedPoolsResult] = await multicall(serverConfig, {
        // Specify the chainId to ensure we use the correct RPC endpoint
        chainId: actualChainId,
        contracts: [
            {
                address: currentPoolAddress,
                abi: [GetPoolsCreatedBy],
                functionName: GetPoolsCreatedBy.name,
                args: [userAddress],
            },
            {
                address: currentPoolAddress,
                abi: [GetPoolsJoinedBy],
                functionName: GetPoolsJoinedBy.name,
                args: [userAddress],
            },
        ],
    })

    if (createdPoolsResult.status !== 'success' || joinedPoolsResult.status !== 'success') {
        console.error('Failed to fetch user pools')
        return []
    }

    const createdPools = createdPoolsResult.result
    const joinedPools = joinedPoolsResult.result
    const allUserPools = [...new Set([...createdPools, ...joinedPools])]

    // If user has no pools, return early
    if (allUserPools.length === 0) {
        return []
    }

    const poolDetailsResults = await multicall(serverConfig, {
        // Specify the chainId to ensure we use the correct RPC endpoint
        chainId: actualChainId,
        contracts: allUserPools.map(poolId => ({
            address: currentPoolAddress,
            abi: [GetAllPoolInfo],
            functionName: GetAllPoolInfo.name,
            args: [poolId],
        })),
    })

    return poolDetailsResults
        .map((result, index) => {
            if (result.status === 'success') {
                const [, poolDetail, , poolStatus, , participants] = result.result
                return {
                    id: allUserPools[index].toString(),
                    name: poolDetail.poolName,
                    status: Number(poolStatus),
                    timeStart: Number(poolDetail.timeStart),
                    timeEnd: Number(poolDetail.timeEnd),
                    numParticipants: participants.length,
                }
            }
            return null
        })
        .filter((pool): pool is ContractPool => pool !== null)
}
