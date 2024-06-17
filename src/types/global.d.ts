declare global {
	type LayoutWithSlots<T extends string> = {
		[K in T]: React.ReactNode
	}

	interface Pool {
		id: bigint
		name: string
		startTime: Date
		endTime: Date
		status: 'live' | 'upcoming' | 'past'
	}
}

export {}
