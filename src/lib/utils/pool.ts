import type { PoolData, PoolItem } from '@/types/pools'
import { POOLSTATUS } from '@/types/pools'

/**
 * Transform smart contract pool data to UI-friendly format
 */
export function transformPoolDataToUI(poolData: PoolData, poolId: string): PoolItem & {
  totalDeposits: number
  balance: number
  sponsored: number
  penaltyFeeRate: number
  tokenAddress: `0x${string}`
} {
  return {
    id: poolId,
    name: poolData.poolDetail.poolName,
    image: '/app/images/frog.png', // Default image
    startDate: new Date(poolData.poolDetail.timeStart * 1000).toISOString(),
    endDate: new Date(poolData.poolDetail.timeEnd * 1000).toISOString(),
    status: poolData.poolStatus,
    numParticipants: poolData.participants.length,
    softCap: Number(poolData.poolBalance.totalDeposits),
    hostAddress: poolData.poolAdmin.host,
    depositAmountPerPerson: Number(poolData.poolDetail.depositAmountPerPerson),
    description: `Pool hosted by ${poolData.poolAdmin.host.slice(0, 6)}...${poolData.poolAdmin.host.slice(-4)}`,
    // Additional smart contract data
    totalDeposits: Number(poolData.poolBalance.totalDeposits),
    balance: Number(poolData.poolBalance.balance),
    sponsored: Number(poolData.poolBalance.sponsored),
    penaltyFeeRate: poolData.poolAdmin.penaltyFeeRate,
    tokenAddress: poolData.poolToken,
  }
}

/**
 * Get pool status display name
 */
export function getPoolStatusName(status: POOLSTATUS): string {
  switch (status) {
    case POOLSTATUS.INACTIVE:
      return 'Inactive'
    case POOLSTATUS.DEPOSIT_ENABLED:
      return 'Open'
    case POOLSTATUS.STARTED:
      return 'Live'
    case POOLSTATUS.ENDED:
      return 'Ended'
    case POOLSTATUS.DELETED:
      return 'Deleted'
    default:
      return 'Unknown'
  }
}

/**
 * Check if pool is upcoming (not started yet)
 */
export function isPoolUpcoming(poolData: PoolData): boolean {
  const now = Math.floor(Date.now() / 1000)
  return poolData.poolDetail.timeStart > now && poolData.poolStatus === POOLSTATUS.DEPOSIT_ENABLED
}

/**
 * Check if pool is live (started but not ended)
 */
export function isPoolLive(poolData: PoolData): boolean {
  const now = Math.floor(Date.now() / 1000)
  return poolData.poolDetail.timeStart <= now && poolData.poolDetail.timeEnd > now && poolData.poolStatus === POOLSTATUS.STARTED
}

/**
 * Check if pool is ended
 */
export function isPoolEnded(poolData: PoolData): boolean {
  const now = Math.floor(Date.now() / 1000)
  return poolData.poolDetail.timeEnd <= now || poolData.poolStatus === POOLSTATUS.ENDED
}

/**
 * Format bigint to number with proper decimals
 */
export function formatBigInt(bigIntValue: bigint, decimals: number = 18): number {
  return Number(bigIntValue) / 10 ** decimals
}

/**
 * Format pool balance for display
 */
export function formatPoolBalance(balance: bigint, decimals: number = 18): string {
  const value = formatBigInt(balance, decimals)
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}
