export function getPoolStatus({ startDate, endDate }: Pick<PoolFrontend, 'startDate' | 'endDate'>): PoolStatus {
    const now = Date.now()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    if (now < start) {
        return 'upcoming'
    } else if (now >= start && now < end) {
        return 'live'
    } else {
        return 'past'
    }
}
