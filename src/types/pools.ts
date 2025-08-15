/**
 * Pool types based on smart contract interface
 * Matches the contract structure for consistency
 */

export enum POOLSTATUS {
  INACTIVE = 'INACTIVE',
  DEPOSIT_ENABLED = 'DEPOSIT_ENABLED',
  STARTED = 'STARTED',
  ENDED = 'ENDED',
  DELETED = 'DELETED',
}

export interface PoolItem {
  id: string
  name: string
  image?: string
  startDate: Date | string
  endDate: Date | string
  status: POOLSTATUS
  numParticipants: number
  softCap: number
  hostAddress: string
  depositAmountPerPerson: number
  description?: string
}

// Smart contract structures
export interface PoolAdmin {
  host: `0x${string}`
  penaltyFeeRate: number
}

export interface PoolDetail {
  timeStart: number
  timeEnd: number
  poolName: string
  depositAmountPerPerson: bigint
}

export interface PoolBalance {
  totalDeposits: bigint
  feesAccumulated: bigint
  feesCollected: bigint
  balance: bigint
  sponsored: bigint
}

export interface ParticipantDetail {
  deposit: bigint
  feesCharged: bigint
  participantIndex: number
  joinedPoolsIndex: number
  refunded: boolean
}

export interface WinnerDetail {
  amountWon: bigint
  amountClaimed: bigint
  timeWon: number
  claimed: boolean
  forfeited: boolean
  alreadyInList: boolean
}

export interface SponsorDetail {
  name: string
  amount: bigint
}

// Complete pool data from smart contract
export interface PoolData {
  poolAdmin: PoolAdmin
  poolDetail: PoolDetail
  poolBalance: PoolBalance
  poolStatus: POOLSTATUS
  poolToken: `0x${string}`
  participants: `0x${string}`[]
  winners: `0x${string}`[]
}

export type PoolsListType = 'upcoming' | 'user' | 'feed'

export interface PoolStatusConfig {
  name: string
  color: string
}

export const POOL_STATUSES_CONFIGS: Record<POOLSTATUS, PoolStatusConfig> = {
  [POOLSTATUS.INACTIVE]: {
    name: 'Inactive',
    color: '#6B7280',
  },
  [POOLSTATUS.DEPOSIT_ENABLED]: {
    name: 'Open',
    color: '#10B981',
  },
  [POOLSTATUS.STARTED]: {
    name: 'Live',
    color: '#F59E0B',
  },
  [POOLSTATUS.ENDED]: {
    name: 'Ended',
    color: '#EF4444',
  },
  [POOLSTATUS.DELETED]: {
    name: 'Deleted',
    color: '#6B7280',
  },
}
