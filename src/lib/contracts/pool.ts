/**
 * Pool Contract Integration
 * Auto-generated contract types and addresses from wagmi-cli
 */

import type { Address } from 'viem'
import { poolAbi, poolAddress, poolConfig } from './generated'

// Export the auto-generated contract configuration
export const poolContract = poolConfig

// Use auto-generated addresses directly
export const POOL_ADDRESSES = poolAddress

// Helper to get contract address for current chain
export function getPoolAddress(chainId: number): Address | undefined {
  return POOL_ADDRESSES[chainId as keyof typeof POOL_ADDRESSES]
}

// Re-export everything from generated file
export { poolAbi, poolAddress, poolConfig }

// Helper function to check if Pool is deployed on a chain
export function isPoolDeployed(chainId: number): boolean {
  return getPoolAddress(chainId) !== undefined
}

// Supported chains where Pool is deployed
export const SUPPORTED_CHAINS = Object.keys(POOL_ADDRESSES)
  .map(Number)
  .filter(chainId => isPoolDeployed(chainId))

// eslint-disable-next-line no-console
console.log('🎯 Pool Contract Addresses:', POOL_ADDRESSES)
// eslint-disable-next-line no-console
console.log('🌐 Supported Chains:', SUPPORTED_CHAINS)
