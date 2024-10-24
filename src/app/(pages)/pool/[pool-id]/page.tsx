import { getPoolDetailsUseCase } from '@/app/_server/use-cases/pools/get-pool-details'
import PoolDetails from './_components/pool-details'

export default async function PoolPage({ params }: { params: { 'pool-id': string } }) {
    const poolDetails = await getPoolDetailsUseCase(params['pool-id'])

    const data = {
        pool: poolDetails,
    }
    console.log('page for pool', params['pool-id'])
    console.log('data loaded', data)

    return data?.pool && <PoolDetails pool={data.pool} />
}
