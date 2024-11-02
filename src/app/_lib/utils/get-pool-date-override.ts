interface DateOverride {
    startDate: number
    endDate: number
}

const POOL_27_DATES = {
    startDate: Math.floor(new Date('2024-11-10T01:00:00Z').getTime() / 1000),
    endDate: Math.floor(new Date('2024-11-18T04:00:00Z').getTime() / 1000),
} as const

export function getPoolDateOverride(poolId: string | number): DateOverride | null {
    return poolId?.toString() === '27' ? POOL_27_DATES : null
}

console.log('Pool 27 override dates:', {
    ...POOL_27_DATES,
    startDateReadable: new Date(POOL_27_DATES.startDate * 1000).toISOString(),
    endDateReadable: new Date(POOL_27_DATES.endDate * 1000).toISOString(),
})
