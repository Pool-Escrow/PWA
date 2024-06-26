export const poolsMock: () => Partial<PoolFrontend>[] = () => [
    {
        id: 1,
        name: 'Pool 1',
        // it starts in 1 day and ends in 2 days
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    },
    {
        id: 2,
        name: 'Pool 2',
        // it starts in 30 minutes and ends in 1 hour
        startDate: new Date(Date.now() + 1000 * 60 * 30),
        endDate: new Date(Date.now() + 1000 * 60 * 60),
    },
    {
        id: 3,
        name: 'Pool 3',
        // it started 1 week ago and ended 40 seconds ago
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        endDate: new Date(Date.now() - 1000 * 40),
    },
    {
        id: 4,
        name: 'Pool 4',
        // it started 2 days ago and ended 1 day ago
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
        id: 5,
        name: 'Pool 5',
        // it started 1 day ago and ends in 1 day
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    {
        id: 6,
        name: 'Pool 6',
        // it started 2 hours ago and ends in 3 hours
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 3),
    },
]
