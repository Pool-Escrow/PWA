import type {
  ApiResponse,
  PoolData,
  PoolDetail,
} from '../types'
import type { PoolItem } from '@/types/pools'
import type { SupportedChainId } from '@/lib/constants/chains'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { isContractDeployed, readAllPoolInfo } from '@/lib/backend/contract-client'
import { chainLogger } from '@/lib/backend/logger'

const pools = new Hono()

// Validation schemas
const poolParamsSchema = z.object({
  chainId: z.string().transform(val => Number.parseInt(val, 10)),
  poolId: z.string().transform(val => Number.parseInt(val, 10)),
})

// Validation schemas for the validated data
const validatedPoolParamsSchema = z.object({
  chainId: z.number().int().positive(),
  poolId: z.number().int().positive(),
})

// Validation schema for user address
const userAddressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

// Helper function to create validation error response
function createValidationError(message: string, details?: unknown): ApiResponse {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
    meta: {
      timestamp: Date.now(),
      chainId: 0,
    },
  }
}

// GET /pools/upcoming - Get upcoming pools (returns empty array when no pools exist)
pools.get('/upcoming', async (c) => {
  try {
    chainLogger.info('Fetching upcoming pools')

    // For now, return empty array since we don't have a way to list all pools
    // This prevents the 404 error and shows the nice placeholder instead
    return c.json({
      success: true,
      data: {
        pools: [] as PoolItem[],
        total: 0,
      },
      meta: {
        timestamp: Date.now(),
        chainId: 0,
      },
    } satisfies ApiResponse<{ pools: PoolItem[], total: number }>)
  }
  catch (error) {
    chainLogger.error('Error fetching upcoming pools', error as Error, 0)

    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch upcoming pools',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      meta: {
        timestamp: Date.now(),
        chainId: 0,
      },
    } satisfies ApiResponse, 500)
  }
})

// GET /pools/user/:address - Get user pools (returns empty array when no pools exist)
pools.get(
  '/user/:address',
  validator('param', (value, c) => {
    const parsed = userAddressSchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid address', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  async (c) => {
    const params = c.req.valid('param' as never) as { address: string }
    const { address } = params

    try {
      chainLogger.info('Fetching user pools', 0, { address })

      // For now, return empty array since we don't have a way to list user pools
      // This prevents the 404 error and shows the nice placeholder instead
      return c.json({
        success: true,
        data: {
          pools: [] as PoolItem[],
          total: 0,
          address,
        },
        meta: {
          timestamp: Date.now(),
          chainId: 0,
        },
      } satisfies ApiResponse<{ pools: PoolItem[], total: number, address: string }>)
    }
    catch (error) {
      chainLogger.error('Error fetching user pools', error as Error, 0, { address })

      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user pools',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: Date.now(),
          chainId: 0,
        },
      } satisfies ApiResponse, 500)
    }
  },
)

export { pools }
