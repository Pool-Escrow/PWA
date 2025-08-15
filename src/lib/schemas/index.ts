/**
 * Global schemas using zod for runtime validation and TypeScript inference
 */

import { z } from 'zod'
import { POOLSTATUS } from '@/types/pools'

/**
 * Chain ID schema - validates supported chain IDs
 */
export const ChainIdSchema = z
  .number()
  .int()
  .min(1)
  .refine(
    chainId => [84532, 8453, 31337].includes(chainId),
    'Unsupported chain ID. Supported: 84532 (Base Sepolia), 8453 (Base Mainnet), 31337 (Local)',
  )

/**
 * Chain-aware pool ID schema
 * Format: "chainId:poolId" or just "poolId" (defaults to Base Sepolia)
 * Examples: "84532:123", "123" (defaults to 84532)
 */
export const ChainAwarePoolIdSchema = z
  .string()
  .regex(/^(\d+:)?\d+$/, 'Invalid pool ID format. Expected: "chainId:poolId" or "poolId"')
  .transform((val) => {
    const parts = val.split(':')
    if (parts.length === 2) {
      const chainId = Number.parseInt(parts[0], 10)
      const poolId = Number.parseInt(parts[1], 10)
      return { chainId, poolId }
    }
    else {
      const poolId = Number.parseInt(parts[0], 10)
      return { chainId: 84532, poolId } // Default to Base Sepolia
    }
  })
  .refine(
    data => !Number.isNaN(data.chainId) && !Number.isNaN(data.poolId),
    'Invalid numeric values in pool ID',
  )
  .refine(
    data => data.poolId > 0,
    'Pool ID must be greater than 0',
  )
  .refine(
    data => [84532, 8453, 31337].includes(data.chainId),
    'Unsupported chain ID. Supported: 84532 (Base Sepolia), 8453 (Base Mainnet), 31337 (Local)',
  ) as z.ZodType<{ chainId: number, poolId: number }>

/**
 * Address schema - validates Ethereum addresses
 */
export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  .transform(val => val as App.Address)

/**
 * User schema
 * TODO: Will be used for user profile validation
 */
export const UserSchema = z.object({
  address: AddressSchema,
  ready: z.boolean(),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  joinedDate: z.string().optional(),
  poolsParticipated: z.number().int().min(0).optional(),
  totalWinnings: z.number().min(0).optional(),
}) satisfies z.ZodType<App.User>

/**
 * TokenBalance schema
 * TODO: Will be used for balance validation
 */
export const TokenBalanceSchema = z.object({
  symbol: z.string(),
  balance: z.number(),
  rawBalance: z.string(),
}) satisfies z.ZodType<App.TokenBalance>

/**
 * BalancesResponse schema
 */
export const BalancesResponseSchema = z.object({
  address: AddressSchema,
  balances: z.object({
    usdc: TokenBalanceSchema,
    drop: TokenBalanceSchema,
  }),
}) satisfies z.ZodType<App.BalancesResponse>

/**
 * User roles schema
 */
export const UserRolesSchema = z.object({
  address: AddressSchema,
  roles: z.object({
    isAdmin: z.boolean(),
    isHost: z.boolean(),
    isSponsor: z.boolean(),
  }),
}) satisfies z.ZodType<App.UserRolesResponse>

/**
 * Smart contract schemas
 */
export const PoolAdminSchema = z.object({
  host: AddressSchema,
  penaltyFeeRate: z.number(),
}) satisfies z.ZodType<App.PoolAdmin>

export const PoolDetailSchema = z.object({
  timeStart: z.number(),
  timeEnd: z.number(),
  poolName: z.string(),
  depositAmountPerPerson: z.bigint(),
}) satisfies z.ZodType<App.PoolDetail>

export const PoolBalanceSchema = z.object({
  totalDeposits: z.bigint(),
  feesAccumulated: z.bigint(),
  feesCollected: z.bigint(),
  balance: z.bigint(),
  sponsored: z.bigint(),
}) satisfies z.ZodType<App.PoolBalance>

export const ParticipantDetailSchema = z.object({
  deposit: z.bigint(),
  feesCharged: z.bigint(),
  participantIndex: z.number(),
  joinedPoolsIndex: z.number(),
  refunded: z.boolean(),
}) satisfies z.ZodType<App.ParticipantDetail>

export const WinnerDetailSchema = z.object({
  amountWon: z.bigint(),
  amountClaimed: z.bigint(),
  timeWon: z.number(),
  claimed: z.boolean(),
  forfeited: z.boolean(),
  alreadyInList: z.boolean(),
}) satisfies z.ZodType<App.WinnerDetail>

export const SponsorDetailSchema = z.object({
  name: z.string(),
  amount: z.bigint(),
}) satisfies z.ZodType<App.SponsorDetail>

export const PoolDataSchema = z.object({
  poolAdmin: PoolAdminSchema,
  poolDetail: PoolDetailSchema,
  poolBalance: PoolBalanceSchema,
  poolStatus: z.nativeEnum(POOLSTATUS),
  poolToken: AddressSchema,
  participants: z.array(AddressSchema),
  winners: z.array(AddressSchema),
}) satisfies z.ZodType<App.PoolData>

/**
 * Pool schema
 * TODO: Will be used for pool creation and validation
 */
export const PoolSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Pool name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  participants: z.number().int().min(0),
  maxParticipants: z.number().int().min(1).max(500),
  startDate: z.string(), // Consider using z.date() if you parse dates
  status: z.enum(['upcoming', 'live', 'ended']),
  hostAddress: AddressSchema,
  pricePerParticipant: z.number().min(0),
}) satisfies z.ZodType<App.Pool>

/**
 * Generic API Response schema
 * TODO: Will be used for standardized API responses
 */
export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })
}

/**
 * Specific API Response schemas
 */
export const PoolDataApiResponseSchema = ApiResponseSchema(PoolDataSchema)
export const UserRolesApiResponseSchema = ApiResponseSchema(UserRolesSchema)
export const BalancesApiResponseSchema = ApiResponseSchema(BalancesResponseSchema)

/**
 * Create Pool Response schema
 */
export const CreatePoolResponseSchema = z.object({
  success: z.boolean(),
  poolId: z.string(),
  transactionHash: z.string().optional(),
}) satisfies z.ZodType<{ success: boolean, poolId: string, transactionHash?: string }>

/**
 * Deposit Response schema
 */
export const DepositResponseSchema = z.object({
  success: z.boolean(),
  transactionHash: z.string(),
}) satisfies z.ZodType<{ success: boolean, transactionHash: string }>

/**
 * Create Pool Form Schema
 * TODO: Will be used for pool creation form validation
 */
export const CreatePoolFormSchema = z.object({
  bannerImage: z.string().url('Invalid URL').optional(),
  name: z.string().min(1, 'Pool name is required'),
  description: z.string().min(10, 'Description is too short'),
  price: z.number().min(0, 'Price cannot be negative'),
  softCap: z.number().min(0, 'Soft cap cannot be negative'),
  requiredAcceptance: z.boolean(),
  termsURL: z.string().url('Invalid URL').optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
})

/**
 * Utility function for safe parsing with better error handling
 */
export function safeParseWithError<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true, data: T } | { success: false, error: string } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessage = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')

  return { success: false, error: errorMessage }
}

/**
 * TanStack Query specific schemas and utilities
 */
export function QueryResultSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.union([
    dataSchema,
    z.object({
      error: z.any(),
      message: z.string().optional(),
    }),
  ])
}

/**
 * Type guard for TanStack Query results
 */
export function isQuerySuccess<T>(data: unknown): data is T {
  return data !== null
    && data !== undefined
    && typeof data === 'object'
    && !('error' in data)
}

/**
 * Safe data extraction for TanStack Query
 */
export function safeQueryData<T>(data: unknown, schema: z.ZodSchema<T>, fallback: T): T {
  if (!isQuerySuccess(data)) {
    return fallback
  }

  const result = schema.safeParse(data)
  return result.success ? result.data : fallback
}
