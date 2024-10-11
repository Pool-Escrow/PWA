import PoolDetails from './_components/pool-details'
import { getPoolDetailsAction } from './actions'

export default async function PoolPage({ params }: { params: { 'pool-id': string } }) {
    const [data] = await getPoolDetailsAction({ poolId: params['pool-id'] })
    return data?.pool && <PoolDetails pool={data.pool} />
}
