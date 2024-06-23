import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import { Address } from 'viem'

export const fetchPools = async () => {
    if (!process.env.NEXT_PUBLIC_INITIAL_BLOCK) {
        throw new Error('Initial block not set')
    }

    const initialBlock = BigInt(process.env.NEXT_PUBLIC_INITIAL_BLOCK)
    const publicClient = getPublicClient(wagmi.config)

    const poolLogs = await publicClient?.getContractEvents({
        abi: poolAbi,
        address: poolAddress[publicClient.chain.id] as Address,
        eventName: 'PoolCreated',
        fromBlock: initialBlock,
        toBlock: 'latest',
    })
    if (!poolLogs) return []
    const pools = await Promise.all(
        poolLogs.map(async log => {
            const { poolId } = log.args
            if (!poolId) return
            const pool = await publicClient?.readContract({
                abi: poolAbi,
                address: poolAddress[publicClient.chain.id] as Address,
                functionName: 'getPoolDetail',
                args: [poolId],
            })
            if (!pool) return
            const startTime = new Date(pool.timeStart * 1000)
            const endTime = new Date(pool.timeEnd * 1000)
            const now = new Date()
            const status: 'upcoming' | 'live' | 'past' = startTime > now ? 'upcoming' : endTime > now ? 'live' : 'past'

            return {
                id: poolId,
                name: pool.poolName,
                startTime,
                endTime,
                status,
            }
        }),
    )
    return pools
}
