import type { ApiResponse, UserBalances, UserRoles } from '../types'
import type { SupportedChainId } from '@/lib/constants/chains'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { isContractDeployed, readAllUserRoles } from '@/lib/backend/contract-client'
import { chainLogger } from '@/lib/backend/logger'
import { DEFAULT_CHAIN_ID } from '@/lib/constants/chains'
import { getTokenAddress, isTokenDeployed } from '@/lib/constants/tokens'

const users = new Hono()

// Validation schemas
const userParamsSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

const chainQuerySchema = z.object({
  chainId: z.string().optional().transform(val => val !== undefined && val !== '' ? Number.parseInt(val, 10) : DEFAULT_CHAIN_ID),
})

// Validation schemas for the validated data
const validatedUserParamsSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

const validatedChainQuerySchema = z.object({
  chainId: z.number().int().positive(),
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

// GET /users/:address/roles - Get user roles
users.get(
  '/:address/roles',
  validator('param', (value, c) => {
    const parsed = userParamsSchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid address parameter', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  validator('query', (value, c) => {
    const parsed = chainQuerySchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid chainId query parameter', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  async (c) => {
    const paramData = c.req.valid('param' as never)
    const queryData = c.req.valid('query' as never)

    // Validate the validated data against our schemas
    const validatedParams = validatedUserParamsSchema.safeParse(paramData)
    if (!validatedParams.success) {
      return c.json(createValidationError('Invalid address parameter', validatedParams.error.issues), 400)
    }

    const validatedQuery = validatedChainQuerySchema.safeParse(queryData)
    if (!validatedQuery.success) {
      return c.json(createValidationError('Invalid chainId query parameter', validatedQuery.error.issues), 400)
    }

    const { address } = validatedParams.data
    const { chainId } = validatedQuery.data

    try {
      chainLogger.info('Fetching user roles', chainId, { address })

      // Check if contract is deployed
      if (!isContractDeployed(chainId as SupportedChainId)) {
        return c.json({
          success: false,
          error: {
            code: 'CONTRACT_NOT_DEPLOYED',
            message: 'Pool contract not deployed on this chain',
          },
          meta: {
            timestamp: Date.now(),
            chainId,
          },
        } satisfies ApiResponse, 404)
      }

      // Get user roles from contract
      const rolesData = await readAllUserRoles(address as `0x${string}`, chainId as SupportedChainId)

      chainLogger.info('User roles fetched successfully', chainId, { address })

      return c.json({
        success: true,
        data: rolesData,
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse<UserRoles>)
    }
    catch (error) {
      chainLogger.error('Error fetching user roles', error as Error, chainId, { address })

      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user roles',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse, 500)
    }
  },
)

// GET /users/:address/balances - Get user token balances (placeholder for future implementation)
users.get(
  '/:address/balances',
  validator('param', (value, c) => {
    const parsed = userParamsSchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid address parameter', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  validator('query', (value, c) => {
    const parsed = chainQuerySchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid chainId query parameter', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  async (c) => {
    const paramData = c.req.valid('param' as never)
    const queryData = c.req.valid('query' as never)

    // Validate the validated data against our schemas
    const validatedParams = validatedUserParamsSchema.safeParse(paramData)
    if (!validatedParams.success) {
      return c.json(createValidationError('Invalid address parameter', validatedParams.error.issues), 400)
    }

    const validatedQuery = validatedChainQuerySchema.safeParse(queryData)
    if (!validatedQuery.success) {
      return c.json(createValidationError('Invalid chainId query parameter', validatedQuery.error.issues), 400)
    }

    const { address } = validatedParams.data
    const { chainId } = validatedQuery.data

    try {
      chainLogger.info('Fetching user balances', chainId, { address })

      // Get token addresses for this chain
      const usdcAddress = getTokenAddress(chainId as SupportedChainId, 'USDC')
      const dropAddress = getTokenAddress(chainId as SupportedChainId, 'DROP')

      // Check if tokens are deployed on this chain
      const usdcDeployed = isTokenDeployed(chainId as SupportedChainId, 'USDC')
      const dropDeployed = isTokenDeployed(chainId as SupportedChainId, 'DROP')

      // TODO: Implement actual balance fetching from blockchain contracts
      // For now, return mock balances for development
      // In production, this should call the actual token contracts
      const responseData = {
        address: address as `0x${string}`,
        balances: {
          usdc: {
            symbol: 'USDC',
            balance: usdcDeployed ? 1250.50 : 0, // Mock realistic USDC balance if deployed
            rawBalance: usdcDeployed ? '1250500000' : '0', // 6 decimals for USDC
          },
          drop: {
            symbol: 'DROP',
            balance: dropDeployed ? 2500 : 0, // Mock DROP token balance if deployed
            rawBalance: dropDeployed ? '2500000000000000000000' : '0', // 18 decimals for DROP
          },
        },
      }

      chainLogger.info('User balances fetched successfully', chainId, { 
        address, 
        usdcAddress, 
        dropAddress,
        usdcDeployed,
        dropDeployed 
      })

      return c.json({
        success: true,
        data: responseData,
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse)
    }
    catch (error) {
      chainLogger.error('Error fetching user balances', error as Error, chainId, { address })

      return c.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user balances',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse, 500)
    }
  },
)

export { users }
