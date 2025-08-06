/**
 * Global schemas using zod for runtime validation and TypeScript inference
 */

import { z } from 'zod'

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
