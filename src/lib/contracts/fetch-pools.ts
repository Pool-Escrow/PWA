// src/lib/contracts/fetch-pools.ts

import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient, multicall } from '@wagmi/core'
import { getAbiItem } from 'viem'

type ChainId = keyof typeof poolAddress

const CreatePoolEvent = getAbiItem({
    abi: poolAbi,
    name: 'PoolCreated',
})

const PoolDetailsFunction = getAbiItem({
    abi: poolAbi,
    name: 'getPoolDetail',
})

export const fetchPools = async (): Promise<Pool[]> => {
    if (!process.env.NEXT_PUBLIC_INITIAL_BLOCK) {
        throw new Error('Initial block not set')
    }

    const initialBlock = BigInt(process.env.NEXT_PUBLIC_INITIAL_BLOCK)
    const publicClient = getPublicClient(wagmi.config)

    const chainId = wagmi.config.state.chainId as ChainId
    if (!(chainId in poolAddress)) {
        throw new Error(`Invalid chainId: ${chainId}`)
    }

    const createdPoolEvents = await publicClient?.getContractEvents({
        abi: [CreatePoolEvent],
        address: poolAddress[chainId],
        eventName: 'PoolCreated',
        fromBlock: initialBlock,
        toBlock: 'latest',
        strict: true,
    })

    if (!createdPoolEvents) {
        throw new Error('No pool logs found')
    }

    const poolIds = createdPoolEvents.map(log => log.args.poolId).filter((id): id is bigint => id !== undefined)

    const results = await multicall(wagmi.config, {
        contracts: poolIds.map(id => ({
            abi: [PoolDetailsFunction],
            address: poolAddress[chainId],
            functionName: 'getPoolDetail',
            args: [id],
        })),
    })

    const now = new Date()

    // TODO: add these fields dinamically on the frontend:
    /**
     * const status: 'upcoming' | 'live' | 'past' = startTime > now ? 'upcoming' : endTime > now ? 'live' : 'past'
     */
    return poolIds.map((id, index) => {
        const pool = results[index].result
        if (!pool) {
            throw new Error(`No pool found for id: ${id}`)
        }

        const startTime = new Date(Number(pool.timeStart) * 1000)
        const endTime = new Date(Number(pool.timeEnd) * 1000)

        return {
            id: id.toString(),
            name: pool.poolName,
            startTime,
            endTime,
            status: startTime > now ? 'upcoming' : endTime > now ? 'live' : 'past',
        } as Pool
    })
}
