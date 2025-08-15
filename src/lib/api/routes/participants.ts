import type { ApiResponse, ParticipantDetail } from '../types'
import type { SupportedChainId } from '@/lib/constants/chains'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { isContractDeployed, readParticipantDetails } from '@/lib/backend/contract-client'
import { chainLogger } from '@/lib/backend/logger'

const participants = new Hono()

// Validation schemas
const participantParamsSchema = z.object({
  chainId: z.string().transform(val => Number.parseInt(val, 10)),
  poolId: z.string().transform(val => Number.parseInt(val, 10)),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
})

// Validation schemas for the validated data
const validatedParticipantParamsSchema = z.object({
  chainId: z.number().int().positive(),
  poolId: z.number().int().positive(),
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

// GET /participants/:chainId/:poolId/:address - Get participant details
participants.get(
  '/:chainId/:poolId/:address',
  validator('param', (value, c) => {
    const parsed = participantParamsSchema.safeParse(value)
    if (!parsed.success) {
      return c.json(createValidationError('Invalid parameters', parsed.error.issues), 400)
    }
    return parsed.data
  }),
  async (c) => {
    const params = c.req.valid('param' as never)

    // Validate the validated data against our schema
    const validatedParams = validatedParticipantParamsSchema.safeParse(params)
    if (!validatedParams.success) {
      return c.json(createValidationError('Invalid parameters', validatedParams.error.issues), 400)
    }

    const { chainId, poolId, address } = validatedParams.data

    try {
      chainLogger.info('Fetching participant details', chainId, { poolId, address })

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

      // Get participant data from contract
      const participantData = await readParticipantDetails(
        address as `0x${string}`,
        BigInt(poolId),
        chainId as SupportedChainId,
      )

      // Transform the data to our expected format
      const responseData: ParticipantDetail = {
        deposit: participantData.deposit,
        feesCharged: participantData.feesCharged,
        participantIndex: participantData.participantIndex,
        joinedPoolsIndex: participantData.joinedPoolsIndex,
        refunded: participantData.refunded,
      }

      chainLogger.info('Participant details fetched successfully', chainId, { poolId, address })

      return c.json({
        success: true,
        data: responseData,
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse<ParticipantDetail>)
    }
    catch (error) {
      chainLogger.error('Error fetching participant details', error as Error, chainId, { poolId, address })

      const isNotFound = error instanceof Error
        && (error.message.includes('Contract read failed')
          || error.message.includes('execution reverted'))

      return c.json({
        success: false,
        error: {
          code: isNotFound ? 'PARTICIPANT_NOT_FOUND' : 'INTERNAL_ERROR',
          message: isNotFound ? 'Participant not found' : 'Failed to fetch participant details',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          timestamp: Date.now(),
          chainId,
        },
      } satisfies ApiResponse, isNotFound ? 404 : 500)
    }
  },
)

export { participants }
