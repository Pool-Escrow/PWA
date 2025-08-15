/**
 * Global type definitions for the Pool PWA
 * These types are available throughout the entire application without imports
 */

import type { Address as ViemAddress } from 'viem'

declare global {
  /**
   * Common application types
   */
  namespace App {
    /**
     * Blockchain address type - globally available
     * Based on viem's Address type for maximum compatibility
     */
    type Address = ViemAddress
    /**
     * User related types
     */
    interface User {
      address: Address
      ready: boolean
      displayName?: string
      bio?: string
      joinedDate?: string
    }

    /**
     * Pool related types
     */
    interface Pool {
      id: string
      name: string
      description: string
      participants: number
      maxParticipants: number
      startDate: string
      status: 'upcoming' | 'live' | 'ended'
      hostAddress: Address
      pricePerParticipant: number
    }

    /**
     * Token balance types
     */
    interface TokenBalance {
      symbol: string
      balance: number
      rawBalance: string
    }

    /**
     * Balance response from API
     */
    interface BalancesResponse {
      address: Address
      balances: {
        usdc: TokenBalance
        drop: TokenBalance
      }
    }

    /**
     * User roles response from API
     */
    interface UserRolesResponse {
      address: Address
      roles: {
        isAdmin: boolean
        isHost: boolean
        isSponsor: boolean
      }
    }

    // Smart contract types
    interface PoolAdmin {
      host: Address
      penaltyFeeRate: number
    }

    interface PoolDetail {
      timeStart: number
      timeEnd: number
      poolName: string
      depositAmountPerPerson: bigint
    }

    interface PoolBalance {
      totalDeposits: bigint
      feesAccumulated: bigint
      feesCollected: bigint
      balance: bigint
      sponsored: bigint
    }

    interface ParticipantDetail {
      deposit: bigint
      feesCharged: bigint
      participantIndex: number
      joinedPoolsIndex: number
      refunded: boolean
    }

    interface WinnerDetail {
      amountWon: bigint
      amountClaimed: bigint
      timeWon: number
      claimed: boolean
      forfeited: boolean
      alreadyInList: boolean
    }

    interface SponsorDetail {
      name: string
      amount: bigint
    }

    interface PoolData {
      poolAdmin: PoolAdmin
      poolDetail: PoolDetail
      poolBalance: PoolBalance
      poolStatus: import('@/types/pools').POOLSTATUS
      poolToken: Address
      participants: Address[]
      winners: Address[]
    }

    // Re-export POOLSTATUS for easier access
    type POOLSTATUS = import('@/types/pools').POOLSTATUS
    type PoolItem = import('@/types/pools').PoolItem

    /**
     * Component prop helpers
     */
    type WithAddress<T = object> = T & {
      address: Address
    }

    type WithOptionalAddress<T = object> = T & {
      address?: Address
    }
  }

  /**
   * Environment variables - globally typed
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      NEXT_PUBLIC_APP_URL: string
      // Add more env vars as needed
    }
  }
}

export {}
