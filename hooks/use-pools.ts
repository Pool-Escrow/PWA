import { wagmi } from '@/configs'
import { poolAbi, poolAddress } from '@/lib/contracts/generated'
import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@wagmi/core'

const fetchPools = async () => {
	if (!process.env.NEXT_PUBLIC_INITIAL_BLOCK) {
		throw new Error('Initial block not set')
	}

	const initialBlock = BigInt(process.env.NEXT_PUBLIC_INITIAL_BLOCK)
	const publicClient = getPublicClient(wagmi.config)

	const poolLogs = await publicClient.getContractEvents({
		abi: poolAbi,
		address: poolAddress[publicClient.chain.id],
		eventName: 'PoolCreated',
		fromBlock: initialBlock,
		toBlock: 'latest',
	})

	const pools = await Promise.all(
		poolLogs.map(async (log) => {
			const { poolId } = log.args
			if (!poolId) return
			const pool = await publicClient.readContract({
				abi: poolAbi,
				address: poolAddress[publicClient.chain.id],
				functionName: 'getPoolDetail',
				args: [poolId],
			})
			return {
				id: poolId,
				name: pool.poolName,
				startTime: new Date(pool.timeStart * 1000),
				endTime: pool.timeEnd,
			}
		}),
	)
	return pools
}

export const usePools = () => {
	const {
		data: pools,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['pools', wagmi.config.state.chainId],
		queryFn: fetchPools,
	})

	return { pools, isLoading, error }
}
