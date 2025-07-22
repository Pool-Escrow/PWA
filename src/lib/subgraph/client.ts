import { GraphQLClient } from 'graphql-request'
import type { PoolCreatedResponse, PoolDataResponse, SubgraphPoolData, UserPoolsResponse } from './types'

const SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cmddr8fjwpnma01t4colyd03w/subgraphs/pool-main/1.0.0/gn'

// Create GraphQL client
export const subgraphClient = new GraphQLClient(SUBGRAPH_URL, {
    headers: {
        'Content-Type': 'application/json',
    },
})

// Query to get all pools with pagination
export const GET_ALL_POOLS = `
  query GetAllPools($first: Int = 1000, $skip: Int = 0, $orderBy: PoolCreated_orderBy = timestamp_, $orderDirection: OrderDirection = desc) {
    poolCreateds(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      host
      poolName
      depositAmountPerPerson
      penaltyFeeRate
      token
    }
  }
`

// Query to get comprehensive pool data by poolId
export const GET_POOL_DATA = `
  query GetPoolData($poolId: BigInt!) {
    # Pool creation data
    poolCreateds(where: { poolId: $poolId }) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      host
      poolName
      depositAmountPerPerson
      penaltyFeeRate
      token
    }
    
    # Status changes (latest first)
    poolStatusChangeds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: desc
      first: 1
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      status
    }
    
    # Balance updates (latest first)
    poolBalanceUpdateds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: desc
      first: 1
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      balanceBefore
      balanceAfter
    }
    
    # Start time changes (latest first)
    poolStartTimeChangeds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: desc
      first: 1
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      startTime
    }
    
    # End time changes (latest first)
    poolEndTimeChangeds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: desc
      first: 1
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      endTime
    }
    
    # All deposits for this pool
    deposits(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: asc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      participant
      amount
    }
    
    # Removed participants
    participantRemoveds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: asc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      participant
    }
    
    # Winners
    winnerSets(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: asc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      winner
      amount
    }
    
    # Refunds
    refunds(
      where: { poolId: $poolId }
      orderBy: timestamp_
      orderDirection: asc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      participant
      amount
    }
  }
`

// Query to get user's pools (where they are host or participant)
export const GET_USER_POOLS = `
  query GetUserPools($userAddress: String!) {
    # Pools where user is host
    poolCreateds(
      where: { host: $userAddress }
      orderBy: timestamp_
      orderDirection: desc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      host
      poolName
      depositAmountPerPerson
      penaltyFeeRate
      token
    }
    
    # Pools where user deposited
    deposits(
      where: { participant: $userAddress }
      orderBy: timestamp_
      orderDirection: desc
    ) {
      id
      block_number
      timestamp_
      transactionHash_
      contractId_
      poolId
      participant
      amount
    }
  }
`

// Query to check if user is participant in a specific pool
export const GET_USER_PARTICIPATION = `
  query GetUserParticipation($poolId: BigInt!, $userAddress: String!) {
    # Check deposits
    deposits(
      where: { poolId: $poolId, participant: $userAddress }
    ) {
      id
      participant
      amount
    }
    
    # Check if removed
    participantRemoveds(
      where: { poolId: $poolId, participant: $userAddress }
    ) {
      id
      participant
    }
  }
`

// Fetch all pools
export async function fetchAllPools(variables?: {
    first?: number
    skip?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}): Promise<PoolCreatedResponse> {
    const response = await subgraphClient.request<PoolCreatedResponse>(GET_ALL_POOLS, variables)
    return response
}

// Fetch comprehensive pool data
export async function fetchPoolData(poolId: string): Promise<SubgraphPoolData> {
    const response = await subgraphClient.request<PoolDataResponse>(GET_POOL_DATA, {
        poolId: poolId,
    })

    // Process and combine the data
    const poolCreated = response.poolCreateds[0] || null
    const latestStatus = response.poolStatusChangeds[0] || null
    const latestBalance = response.poolBalanceUpdateds[0] || null
    const latestStartTime = response.poolStartTimeChangeds[0] || null
    const latestEndTime = response.poolEndTimeChangeds[0] || null

    // Calculate current participants (deposited but not removed)
    const depositedParticipants = new Set(response.deposits.map(d => d.participant.toLowerCase()))
    const removedParticipants = new Set(response.participantRemoveds.map(r => r.participant.toLowerCase()))

    const currentParticipants = Array.from(depositedParticipants).filter(
        participant => !removedParticipants.has(participant),
    )

    // Calculate total deposits
    const totalDeposits = response.deposits.reduce((sum, deposit) => sum + BigInt(deposit.amount), BigInt(0)).toString()

    // Get current balance (latest balance update or total deposits)
    const currentBalance = latestBalance?.balanceAfter || totalDeposits

    // Get current status (latest status or default to INACTIVE)
    const currentStatus = latestStatus ? parseInt(latestStatus.status) : 0

    return {
        poolCreated,
        latestStatus,
        latestBalance,
        latestStartTime,
        latestEndTime,
        deposits: response.deposits,
        removedParticipants: response.participantRemoveds,
        winners: response.winnerSets,
        refunds: response.refunds,
        currentParticipants,
        totalDeposits,
        participantCount: currentParticipants.length,
        currentBalance,
        currentStatus,
    }
}

// Fetch user's pools
export async function fetchUserPools(userAddress: string): Promise<UserPoolsResponse> {
    const response = await subgraphClient.request<UserPoolsResponse>(GET_USER_POOLS, {
        userAddress: userAddress.toLowerCase(),
    })
    return response
}

// Check if user is participant in pool
export async function checkUserParticipation(poolId: string, userAddress: string): Promise<boolean> {
    const response = await subgraphClient.request<{
        deposits: { id: string }[]
        participantRemoveds: { id: string }[]
    }>(GET_USER_PARTICIPATION, {
        poolId: poolId,
        userAddress: userAddress.toLowerCase(),
    })

    // User is participant if they deposited and weren't removed
    const hasDeposited = response.deposits.length > 0
    const wasRemoved = response.participantRemoveds.length > 0

    return hasDeposited && !wasRemoved
}

// Utility function to convert subgraph timestamp to Date
export function subgraphTimestampToDate(timestamp: string): Date {
    return new Date(parseInt(timestamp) * 1000)
}

// Utility function to convert BigInt string to number with decimals
export function formatSubgraphAmount(amount: string, decimals: number = 6): number {
    return Number(BigInt(amount)) / Math.pow(10, decimals)
}
