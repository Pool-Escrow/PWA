// import 'server-only'

import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient, multicall } from '@wagmi/core'
import { getAbiItem } from 'viem'
import { currentPoolAddress, getDefaultPublicClient, serverConfig } from '../../../blockchain/server-config'

const LatestPoolId = getAbiItem({
    abi: poolAbi,
    name: 'latestPoolId',
})

const GetAllPoolInfo = getAbiItem({
    abi: poolAbi,
    name: 'getAllPoolInfo',
})

export interface ContractPool {
    id: string
    name: string
    status: number
    timeStart: number
    timeEnd: number
    numParticipants: number
}

/**
 * Maximum number of individual contract reads aggregated in a single
 * Multicall3 request.  The optimal size depends on the RPC provider – 50 has
 * proven to be a safe value with both PublicNode and Tenderly without hitting
 * body-size limits (≈128 kB) or execution-timeouts.
 */
const MULTICALL_BATCH_SIZE = 50

/**
 * Helper that waits for a specified amount of time.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper that splits an array into evenly-sized chunks.
 */
const chunkArray = <T>(arr: readonly T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
    }
    return chunks
}

export async function getContractPools(chainId?: number): Promise<ContractPool[]> {
    /*
     * Allow dynamic chain selection so we can query pool data on the chain that the
     * user (or caller) is currently connected to.  If a "chainId" is provided we
     * resolve the correct public client and pool contract address for that chain.
     * Otherwise, we fallback to the default client / address configured in
     * `server-config`.
     */

    const publicClient = chainId ? getPublicClient(serverConfig, { chainId }) : getDefaultPublicClient()

    if (!publicClient) {
        throw new Error(`[getContractPools] Failed to obtain public client for chainId ${chainId ?? 'default'}`)
    }

    // Resolve pool contract address for the target chain. Fallback to the
    // currentPoolAddress (default chain) if mapping not found.
    const targetPoolAddress = (chainId && poolAddress[chainId as keyof typeof poolAddress]) || currentPoolAddress

    let latestPoolId = 0n
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 300

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await publicClient.readContract({
                address: targetPoolAddress,
                abi: [LatestPoolId],
                functionName: LatestPoolId.name,
            })
            latestPoolId = result // Directly cast to bigint

            if (latestPoolId > 0n) {
                break // Success
            }

            if (attempt < MAX_RETRIES) {
                console.log(
                    `[getContractPools] Attempt ${attempt}: latestPoolId is 0, retrying in ${RETRY_DELAY_MS * attempt}ms...`,
                )
                await sleep(RETRY_DELAY_MS * attempt)
            } else {
                console.warn(`[getContractPools] All ${MAX_RETRIES} attempts failed, latestPoolId is still 0.`)
            }
        } catch (error) {
            console.error(`[getContractPools] Error on attempt ${attempt} fetching latestPoolId:`, error)
            if (attempt >= MAX_RETRIES) {
                // If all retries fail, re-throw the last error or return empty
                return []
            }
            await sleep(RETRY_DELAY_MS * attempt)
        }
    }

    const poolIds = Array.from({ length: Number(latestPoolId) }, (_, i) => BigInt(i + 1))

    // If there are no pools yet, return early.
    if (poolIds.length === 0) return []

    // Break the multicall request into smaller batches to avoid large payloads
    // and give the transport layer a chance to retry smaller requests without
    // tripping provider-side rate-limits.
    const idChunks = chunkArray(poolIds, MULTICALL_BATCH_SIZE)

    const chunkResults = await Promise.all(
        idChunks.map(chunk =>
            multicall(serverConfig, {
                contracts: chunk.map(id => ({
                    address: targetPoolAddress,
                    abi: [GetAllPoolInfo],
                    functionName: GetAllPoolInfo.name,
                    args: [id],
                })),
            }),
        ),
    )

    const flatResults = chunkResults.flat()

    return flatResults
        .map((result, globalIndex) => {
            if (result.status === 'success') {
                const [, poolDetail, , poolStatus, , participants] = result.result
                return {
                    id: poolIds[globalIndex].toString(),
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
