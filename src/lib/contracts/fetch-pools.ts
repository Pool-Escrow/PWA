import { wagmi } from '@/providers/configs'
import wagmiConfig from '@/providers/configs/wagmi.config'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'

export const fetchPools = async () => {
    if (!process.env.NEXT_PUBLIC_INITIAL_BLOCK) {
        throw new Error('Initial block not set')
    }

    const initialBlock = BigInt(process.env.NEXT_PUBLIC_INITIAL_BLOCK)
    const publicClient = getPublicClient(wagmi.config)

    const chainId = wagmiConfig.config.state.chainId as keyof typeof poolAddress
    if (!(chainId in poolAddress)) {
        throw new Error(`Invalid chainId: ${chainId}`)
    }

    const poolLogs = await publicClient?.getContractEvents({
        abi: poolAbi,
        address: poolAddress[chainId],
        eventName: 'PoolCreated',
        fromBlock: initialBlock,
        toBlock: 'latest',
    })

    if (!poolLogs) {
        throw new Error('No pool logs found')
    }

    const pools = await Promise.all(
        poolLogs.map(async log => {
            const { poolId } = log.args
            if (!poolId) return
            const pool = await publicClient?.readContract({
                abi: poolAbi,
                address: poolAddress[chainId],
                functionName: 'getPoolDetail',
                args: [poolId],
            })

            if (!pool) {
                throw new Error(`No pool found for id: ${poolId}`)
            }

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
