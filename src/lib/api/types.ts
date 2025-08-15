/**
 * API Response Types
 * Standardized response formats for the REST API
 */

import type { Address } from 'viem'

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    timestamp: number
    chainId: number
  }
}

// Contract return types (matching the actual contract structure)
export interface ContractPoolAdmin {
  host: Address
  penaltyFeeRate: number
}

export interface ContractPoolDetail {
  timeStart: number
  timeEnd: number
  poolName: string
  depositAmountPerPerson: bigint
}

export interface ContractPoolBalance {
  totalDeposits: bigint
  feesAccumulated: bigint
  feesCollected: bigint
  balance: bigint
  sponsored: bigint // Note: contract returns uint256, not bool
}

export interface ContractParticipantDetail {
  deposit: bigint
  feesCharged: bigint
  participantIndex: bigint
  joinedPoolsIndex: bigint
  refunded: boolean
}

// Contract getAllPoolInfo return type (tuple structure)
export type ContractAllPoolInfo = readonly [
  ContractPoolAdmin, // _poolAdmin
  ContractPoolDetail, // _poolDetail
  ContractPoolBalance, // _poolBalance
  number, // _poolStatus
  Address, // _poolToken
  readonly Address[], // _participants
  readonly Address[], // _winners
]

// API response types (transformed from contract types)
export interface PoolData {
  poolAdmin: {
    host: Address
    penaltyFeeRate: number
  }
  poolDetail: {
    timeStart: number
    timeEnd: number
    poolName: string
    depositAmountPerPerson: bigint
  }
  poolBalance: {
    totalDeposits: bigint
    feesAccumulated: bigint
    feesCollected: bigint
    balance: bigint
    sponsored: boolean // Converted from bigint to boolean
  }
  poolStatus: number
  poolToken: Address
  participants: bigint
  winners: Address[]
}

export interface PoolDetail {
  timeStart: number
  timeEnd: number
  poolName: string
  depositAmountPerPerson: bigint
}

export interface ParticipantDetail {
  deposit: bigint
  feesCharged: bigint
  participantIndex: bigint
  joinedPoolsIndex: bigint
  refunded: boolean
}

export interface UserBalances {
  [tokenAddress: string]: {
    balance: bigint
    symbol: string
    decimals: number
  }
}

export interface UserRoles {
  isAdmin: boolean
  isHost: boolean
  isSponsor: boolean
}

// Request parameter types
export interface PoolParams {
  chainId: string
  poolId: string
}

export interface ParticipantParams extends PoolParams {
  address: string
}

export interface UserParams {
  address: string
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: number
  version: string
  uptime: number
}

// Validation parameter types (after transformation)
export interface ValidatedPoolParams {
  chainId: number
  poolId: number
}

export interface ValidatedParticipantParams extends ValidatedPoolParams {
  address: string
}

export interface ValidatedUserParams {
  address: string
}

export interface ValidatedChainQuery {
  chainId: number
}
