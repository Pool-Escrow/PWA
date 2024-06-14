import { usePools } from '@/hooks/use-pools'
import PoolCard from './pool-list-card'

export default function PoolList({ maxPools }: { maxPools?: number }) {
	const { pools, isLoading, error } = usePools()

	if (isLoading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!pools) return <div>No pools found</div>

	return (
		<div className='flex flex-col flex-grow mt-3 w-full h-full space-y-4'>
			{pools.slice(0, maxPools).map((pool) => {
				if (!pool) return null
				return (
					<PoolCard key={pool.id} name={pool.name} startDate={pool.startTime} />
				)
			})}
		</div>
	)
}
