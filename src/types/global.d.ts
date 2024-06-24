declare global {
    type LayoutWithSlots<T extends string> = {
        [K in T]: React.ReactNode
    }

    interface Pool {
        id: string
        name: string
        startTime: Date
        endTime: Date
        status: 'live' | 'upcoming' | 'past'
    }
}

export {}
