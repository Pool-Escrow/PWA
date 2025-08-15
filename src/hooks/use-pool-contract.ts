/**
 * Pool Contract Utilities
 * Utilities for interacting with the Pool contract via API routes
 */

import type { Address } from 'viem'
import { getPoolAddress, POOL_ADDRESSES } from '@/lib/contracts/pool'
import {
  BalancesApiResponseSchema,
  CreatePoolResponseSchema,
  DepositResponseSchema,
  PoolDataApiResponseSchema,
  safeParseWithError,
  UserRolesApiResponseSchema,
} from '@/lib/schemas'

// ===== API HELPER FUNCTIONS =====

/**
 * Fetch pool information via REST API
 */
export async function fetchPoolInfo(poolId: bigint, chainId: number = 84532): Promise<App.PoolData> {
  const response = await fetch(`/api/pools/${chainId}/${poolId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch pool info: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(PoolDataApiResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid pool data: ${result.error}`)
  }

  if (!result.data.data) {
    throw new Error('No pool data received')
  }

  return result.data.data
}

/**
 * Fetch pool details via REST API
 */
export async function fetchPoolDetails(poolId: bigint, chainId: number = 84532): Promise<App.PoolData> {
  const response = await fetch(`/api/pools/${chainId}/${poolId}/details`)
  if (!response.ok) {
    throw new Error(`Failed to fetch pool details: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(PoolDataApiResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid pool details: ${result.error}`)
  }

  if (!result.data.data) {
    throw new Error('No pool details received')
  }

  return result.data.data
}

/**
 * Fetch participant details via REST API
 */
export async function fetchParticipantDetails(
  userAddress: Address,
  poolId: bigint,
  chainId: number = 84532,
): Promise<App.PoolData> {
  const response = await fetch(`/api/participants/${chainId}/${poolId}/${userAddress}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch participant details: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(PoolDataApiResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid participant data: ${result.error}`)
  }

  if (!result.data.data) {
    throw new Error('No participant data received')
  }

  return result.data.data
}

/**
 * Fetch user roles via REST API
 */
export async function fetchUserRoles(userAddress: Address, chainId: number = 84532): Promise<App.UserRolesResponse> {
  const response = await fetch(`/api/users/${userAddress}/roles?chainId=${chainId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch user roles: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(UserRolesApiResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid user roles data: ${result.error}`)
  }

  if (!result.data.data) {
    throw new Error('No user roles data received')
  }

  return result.data.data
}

/**
 * Fetch user balances via REST API
 */
export async function fetchUserBalances(userAddress: Address, chainId: number = 84532): Promise<App.BalancesResponse> {
  const response = await fetch(`/api/users/${userAddress}/balances?chainId=${chainId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch user balances: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(BalancesApiResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid user balances data: ${result.error}`)
  }

  if (!result.data.data) {
    throw new Error('No user balances data received')
  }

  return result.data.data
}

/**
 * Create a new pool via API
 */
export async function createPool(
  params: {
    timeStart: number
    timeEnd: number
    poolName: string
    depositAmountPerPerson: bigint
    penaltyFeeRate: number
    token: Address
  },
  chainId: number = 84532,
): Promise<{ success: boolean, poolId: string }> {
  const response = await fetch(`/api/pools/${chainId}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error(`Failed to create pool: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(CreatePoolResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid create pool response: ${result.error}`)
  }

  return result.data
}

/**
 * Deposit to a pool via API
 */
export async function depositToPool(
  poolId: bigint,
  amount: bigint,
  chainId: number = 84532,
): Promise<{ success: boolean, transactionHash: string }> {
  const response = await fetch(`/api/pools/${chainId}/${poolId}/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: amount.toString() }),
  })

  if (!response.ok) {
    throw new Error(`Failed to deposit to pool: ${response.status}`)
  }

  const rawData = await response.json() as unknown
  const result = safeParseWithError(DepositResponseSchema, rawData)

  if (!result.success) {
    throw new Error(`Invalid deposit response: ${result.error}`)
  }

  return result.data
}

// Utility functions
export function isPoolDeployed(chainId: number): boolean {
  return getPoolAddress(chainId) !== undefined
}

export function getSupportedChains(): number[] {
  return Object.keys(POOL_ADDRESSES)
    .map(Number)
    .filter(chainId => isPoolDeployed(chainId))
}

// Export contract configuration helpers (for reference only)
export { getPoolAddress, POOL_ADDRESSES }
