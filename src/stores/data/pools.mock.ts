export const poolsMock: () => Pool[] = () => [
    {
        id: 1n,
        name: 'Pool 1',
        status: 'upcoming',
        // it starts in 1 day and ends in 2 days
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    },
    {
        id: 2n,
        name: 'Pool 2',
        status: 'upcoming',
        // it starts in 30 minutes and ends in 1 hour
        startTime: new Date(Date.now() + 1000 * 60 * 30),
        endTime: new Date(Date.now() + 1000 * 60 * 60),
    },
    {
        id: 3n,
        name: 'Pool 3',
        status: 'past',
        // it started 1 week ago and ended 40 seconds ago
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        endTime: new Date(Date.now() - 1000 * 40),
    },
    {
        id: 4n,
        name: 'Pool 4',
        status: 'past',
        // it started 2 days ago and ended 1 day ago
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
        id: 5n,
        name: 'Pool 5',
        status: 'live',
        // it started 1 day ago and ends in 1 day
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    {
        id: 6n,
        name: 'Pool 6',
        status: 'live',
        // it started 2 hours ago and ends in 3 hours
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
    },
]
