import PoolList from '@/components/pools/pool-list/pool-list'

export default function Upcoming() {
	return (
		<>
			<h1 className='font-semibold text-lg'>Upcoming Pools</h1>
			<PoolList filter={{ status: ['live', 'upcoming'] }} />
		</>
	)
}
