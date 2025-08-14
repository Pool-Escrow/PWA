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

export interface PoolDetail {
  timeStart: number
  timeEnd: number
  poolName: string
  depositAmountPerPerson: number
}

export interface PoolBalance {
  totalDeposits: number
  feesAccumulated: number
  feesCollected: number
  balance: number
  sponsored: number
}

export interface ParticipantDetail {
  deposit: number
  feesCharged: number
  participantIndex: number
  joinedPoolsIndex: number
  refunded: boolean
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
