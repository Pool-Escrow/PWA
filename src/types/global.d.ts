declare global {
    type LayoutWithSlots<T extends string> = {
        [K in T]: React.ReactNode
    }

    type ChainId = keyof typeof poolAddress

    interface Pool {
        id: bigint
        name: string
        startTime: Date
        endTime: Date
        status: 'live' | 'upcoming' | 'past'
    }
    interface PoolDetails {
        id: bigint
        name: string
        startTime: Date
        endTime: Date
        status: 'live' | 'upcoming' | 'past'
    }

    type HexString = `0x${string}`
}

export {}
