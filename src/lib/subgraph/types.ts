export interface SubgraphPoolCreated {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    host: string
    poolName: string
    depositAmountPerPerson: string
    penaltyFeeRate: string
    token: string
}

export interface SubgraphDeposit {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    participant: string
    amount: string
}

export interface SubgraphPoolStatusChanged {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    status: string
}

export interface SubgraphPoolBalanceUpdated {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    balanceBefore: string
    balanceAfter: string
}

export interface SubgraphWinnerSet {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    winner: string
    amount: string
}

export interface SubgraphPoolStartTimeChanged {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    startTime: string
}

export interface SubgraphPoolEndTimeChanged {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    endTime: string
}

export interface SubgraphParticipantRemoved {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    participant: string
}

export interface SubgraphRefund {
    id: string
    block_number: string
    timestamp_: string
    transactionHash_: string
    contractId_: string
    poolId: string
    participant: string
    amount: string
}

// Combined pool data interface
export interface SubgraphPoolData {
    // Pool creation data
    poolCreated: SubgraphPoolCreated | null

    // Latest status
    latestStatus: SubgraphPoolStatusChanged | null

    // Latest balance
    latestBalance: SubgraphPoolBalanceUpdated | null

    // Start/End times
    latestStartTime: SubgraphPoolStartTimeChanged | null
    latestEndTime: SubgraphPoolEndTimeChanged | null

    // Participants
    deposits: SubgraphDeposit[]
    removedParticipants: SubgraphParticipantRemoved[]

    // Winners
    winners: SubgraphWinnerSet[]

    // Refunds
    refunds: SubgraphRefund[]

    // Derived data
    currentParticipants: string[]
    totalDeposits: string
    participantCount: number
    currentBalance: string
    currentStatus: number
}

// Query response types
export interface PoolCreatedResponse {
    poolCreateds: SubgraphPoolCreated[]
}

export interface PoolDataResponse {
    poolCreateds: SubgraphPoolCreated[]
    poolStatusChangeds: SubgraphPoolStatusChanged[]
    poolBalanceUpdateds: SubgraphPoolBalanceUpdated[]
    poolStartTimeChangeds: SubgraphPoolStartTimeChanged[]
    poolEndTimeChangeds: SubgraphPoolEndTimeChanged[]
    deposits: SubgraphDeposit[]
    participantRemoveds: SubgraphParticipantRemoved[]
    winnerSets: SubgraphWinnerSet[]
    refunds: SubgraphRefund[]
}

export interface UserPoolsResponse {
    // Pools where user is host
    poolCreateds: SubgraphPoolCreated[]
    // Pools where user deposited
    deposits: SubgraphDeposit[]
}

// Pool status enum (matching contract)
export enum PoolStatus {
    INACTIVE = 0,
    DEPOSIT_ENABLED = 1,
    STARTED = 2,
    ENDED = 3,
    DELETED = 4,
}
