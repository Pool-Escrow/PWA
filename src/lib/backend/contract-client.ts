/**
 * Backend Contract Client
 * Centralizes all contract reading operations for the backend
 */

import type { Address, PublicClient } from 'viem'
import type { ContractAllPoolInfo, ContractParticipantDetail, UserRoles } from '@/lib/api/types'
import type { SupportedChainId } from '@/lib/constants/chains'
import { createPublicClient, http } from 'viem'
import { CHAIN_CONFIG, DEFAULT_CHAIN_ID } from '@/lib/constants/chains'
import { getPoolAddress, POOL_ADDRESSES, poolAbi } from '@/lib/contracts/pool'
import { env } from '@/lib/env/server'

// Client cache for performance
const clientCache = new Map<SupportedChainId, PublicClient>()

export function getContractClient(chainId: SupportedChainId, rpcUrl?: string): PublicClient {
  // Check cache first
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId)!
  }

  const config = CHAIN_CONFIG[chainId]
  if (config === undefined) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  // Determine RPC URL with precedence: parameter > env > default
  let finalRpcUrl = rpcUrl
  if (finalRpcUrl === undefined) {
    switch (chainId) {
      case 84532:
        finalRpcUrl = env.BASE_SEPOLIA_RPC_URL ?? config.defaultRpcUrl
        break
      case 8453:
        finalRpcUrl = env.BASE_MAINNET_RPC_URL ?? config.defaultRpcUrl
        break
      case 31337:
        finalRpcUrl = env.ANVIL_RPC_URL ?? config.defaultRpcUrl
        break
      default:
        finalRpcUrl = config.defaultRpcUrl
    }
  }

  const client = createPublicClient({
    chain: config.chain,
    transport: http(finalRpcUrl),
  }) as PublicClient

  // Cache the client
  clientCache.set(chainId, client)
  return client
}

export function getPoolContractConfig(chainId: SupportedChainId = DEFAULT_CHAIN_ID) {
  const address = getPoolAddress(chainId)
  if (address === undefined) {
    throw new Error(`Pool contract not deployed on chain ${chainId}`)
  }

  return {
    abi: poolAbi,
    address,
    chainId,
  } as const
}

// ===== CONTRACT READ FUNCTIONS =====

/**
 * Read all pool information (combined data)
 */
export async function readAllPoolInfo(poolId: bigint, chainId: SupportedChainId = DEFAULT_CHAIN_ID): Promise<ContractAllPoolInfo> {
  const client = getContractClient(chainId)
  const contract = getPoolContractConfig(chainId)

  return client.readContract({
    ...contract,
    functionName: 'getAllPoolInfo',
    args: [poolId],
  }) as Promise<ContractAllPoolInfo>
}

/**
 * Read participant details for a user in a pool
 */
export async function readParticipantDetails(
  userAddress: Address,
  poolId: bigint,
  chainId: SupportedChainId = DEFAULT_CHAIN_ID,
): Promise<ContractParticipantDetail> {
  const client = getContractClient(chainId)
  const contract = getPoolContractConfig(chainId)

  return client.readContract({
    ...contract,
    functionName: 'getParticipantDetail',
    args: [userAddress, poolId],
  }) as Promise<ContractParticipantDetail>
}

/**
 * Check if user has a specific role
 */
export async function readUserRole(
  userAddress: Address,
  role: 'admin' | 'host' | 'sponsor',
  chainId: SupportedChainId = DEFAULT_CHAIN_ID,
): Promise<boolean> {
  const client = getContractClient(chainId)
  const contract = getPoolContractConfig(chainId)

  // Get role constants
  const [adminRole, hostRole, sponsorRole] = await Promise.all([
    client.readContract({
      ...contract,
      functionName: 'DEFAULT_ADMIN_ROLE',
    }),
    client.readContract({
      ...contract,
      functionName: 'WHITELISTED_HOST',
    }),
    client.readContract({
      ...contract,
      functionName: 'WHITELISTED_SPONSOR',
    }),
  ])

  const roleMap = {
    admin: adminRole,
    host: hostRole,
    sponsor: sponsorRole,
  } as const

  const targetRole = roleMap[role]
  if (!targetRole) {
    throw new Error(`Invalid role: ${role}`)
  }

  return client.readContract({
    ...contract,
    functionName: 'hasRole',
    args: [targetRole, userAddress],
  })
}

/**
 * Read all user roles at once (more efficient)
 */
export async function readAllUserRoles(
  userAddress: Address,
  chainId: SupportedChainId = DEFAULT_CHAIN_ID,
): Promise<UserRoles> {
  const client = getContractClient(chainId)
  const contract = getPoolContractConfig(chainId)

  // Get role constants
  const [adminRole, hostRole, sponsorRole] = await Promise.all([
    client.readContract({
      ...contract,
      functionName: 'DEFAULT_ADMIN_ROLE',
    }),
    client.readContract({
      ...contract,
      functionName: 'WHITELISTED_HOST',
    }),
    client.readContract({
      ...contract,
      functionName: 'WHITELISTED_SPONSOR',
    }),
  ])

  // Check all roles in parallel
  const [isAdmin, isHost, isSponsor] = await Promise.all([
    client.readContract({
      ...contract,
      functionName: 'hasRole',
      args: [adminRole, userAddress],
    }),
    client.readContract({
      ...contract,
      functionName: 'hasRole',
      args: [hostRole, userAddress],
    }),
    client.readContract({
      ...contract,
      functionName: 'hasRole',
      args: [sponsorRole, userAddress],
    }),
  ])

  return {
    isAdmin: Boolean(isAdmin),
    isHost: Boolean(isHost),
    isSponsor: Boolean(isSponsor),
  }
}

/**
 * Check if contract is deployed on a specific chain
 */
export function isContractDeployed(chainId: SupportedChainId): boolean {
  return getPoolAddress(chainId) !== undefined
}

/**
 * Get all supported chain IDs where contract is deployed
 */
export function getSupportedChainIds(): SupportedChainId[] {
  return Object.keys(POOL_ADDRESSES)
    .map(Number)
    .filter((chainId): chainId is SupportedChainId =>
      chainId in CHAIN_CONFIG && isContractDeployed(chainId as SupportedChainId),
    )
}

// Export configuration for reference
export { DEFAULT_CHAIN_ID, getPoolAddress, POOL_ADDRESSES, poolAbi }
