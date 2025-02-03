export enum POOL_PRETTY_STATUS {
    INACTIVE = 'Upcoming',
    DEPOSIT_ENABLED = 'Registring',
    STARTED = 'Live',
    ENDED = 'Ended',
    DELETED = 'Deleted'
}

export const POOL_STATUSES_CONFIGS: Record<number, {name: string, color: string}> = {
    0: { name: POOL_PRETTY_STATUS.INACTIVE, color: '#4078F4'},
    1: { name: POOL_PRETTY_STATUS.DEPOSIT_ENABLED, color: '#CDFE65'},
    2: { name: POOL_PRETTY_STATUS.STARTED, color: '#FE6651'},
    3: { name: POOL_PRETTY_STATUS.ENDED, color: '#111112'},
    4: { name: POOL_PRETTY_STATUS.DELETED, color: '#111112'},
}