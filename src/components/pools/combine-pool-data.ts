import { fromUnixTime } from 'date-fns'

export const combinePoolData = (contractPools: PoolFromContract[], dbPools: PoolFromDb[]): PoolFrontend[] => {
    return contractPools.map(contractPool => {
        // TODO: convert this field to string in the database schema or ensure it can handle uint40
        const dbPool = dbPools.find(p => p.contract_id === contractPool.id)
        return {
            ...dbPool,
            ...contractPool,
            bannerImage: dbPool?.bannerImage ?? null,
            contract_id: contractPool.id,
            name: contractPool.poolName,
            tokenAddress: contractPool.tokenAddress,
            description: dbPool?.description ?? '',
            endDate: fromUnixTime(contractPool.timeEnd),
            startDate: fromUnixTime(contractPool.timeStart),
        }
    })
}
