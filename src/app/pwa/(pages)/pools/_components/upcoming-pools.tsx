import { getAllPoolsAction } from '../actions'
import PoolList from './pool-list'

export default async function UpcomingPools() {
    const pools = await getAllPoolsAction()
    const upcomingPools = pools.filter(pool => pool.startDate > new Date())

    if (upcomingPools.length === 0) {
        return (
            <>
                <h1 className='mb-4 text-lg font-semibold'>Upcoming Pools</h1>
                <div className='flex-center h-80 flex-col'>
                    <h1 className='mb-4 text-lg font-semibold'>No upcoming pools</h1>
                    <p className='text-sm'>Come back later</p>
                </div>
            </>
        )
    }

    return (
        <>
            <h1 className='mb-4 text-lg font-semibold'>Upcoming Pools</h1>
            <PoolList pools={upcomingPools} />
        </>
    )
}
