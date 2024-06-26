export function getPoolStatus({ startDate, endDate }: Pick<PoolFrontend, 'startDate' | 'endDate'>): PoolStatus {
    const now = new Date()

    return startDate > now ? 'upcoming' : endDate < now ? 'past' : 'live'
}
