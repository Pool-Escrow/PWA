import 'server-only'

import { poolAbi } from '@/types/contracts'
import { getPublicClient, multicall } from '@wagmi/core'
import { getAbiItem } from 'viem'
import { currentPoolAddress, serverConfig } from '../../../blockchain/server-config'

const LatestPoolId = getAbiItem({
    abi: poolAbi,
    name: 'latestPoolId',
})

const GetAllPoolInfo = getAbiItem({
    abi: poolAbi,
    name: 'getAllPoolInfo',
})

interface PoolItem {
    id: string
    name: string
    startDate: Date
    endDate: Date
    numParticipants: number
    status: string
}

const publicClient = getPublicClient(serverConfig)

export async function getContractPools(): Promise<PoolItem[]> {
    const latestPoolId = await publicClient.readContract({
        address: currentPoolAddress,
        abi: [LatestPoolId],
        functionName: 'latestPoolId',
    })

    const poolIds = Array.from({ length: Number(latestPoolId) }, (_, i) => BigInt(i + 1))

    const results = await multicall(serverConfig, {
        contracts: poolIds.map(id => ({
            address: currentPoolAddress,
            abi: [GetAllPoolInfo],
            functionName: 'getAllPoolInfo',
            args: [id],
        })),
    })

    return results
        .map((result, index) => {
            if (result.status === 'success') {
                const [, poolDetail, , poolStatus, , participants] = result.result
                return {
                    id: poolIds[index].toString(),
                    name: poolDetail.poolName,
                    status: ['INACTIVE', 'DEPOSIT_ENABLED', 'STARTED', 'ENDED', 'DELETED'][poolStatus],
                    startDate: new Date(Number(poolDetail.timeStart) * 1000),
                    endDate: new Date(Number(poolDetail.timeEnd) * 1000),
                    numParticipants: participants.length,
                }
            }
            // Handle error case if needed
            throw new Error(`Failed to fetch pool info for id ${poolIds[index]}`)
        })
        .filter(pool => pool !== null)
}
