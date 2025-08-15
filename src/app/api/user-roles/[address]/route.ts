import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi } from 'viem'
import { baseSepolia } from 'viem/chains'
import { env } from '@/lib/env/client'
import { AddressSchema, safeParseWithError, UserRolesSchema } from '@/lib/schemas'

// Pool contract ABI for role checking
const poolAbi = parseAbi([
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
  'function WHITELISTED_HOST() view returns (bytes32)',
  'function WHITELISTED_SPONSOR() view returns (bytes32)',
])

// Pool contract address
const POOL_CONTRACT_ADDRESS = env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890'

// Create viem client for blockchain calls
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

/**
 * GET /api/user-roles/[address]
 * Check if a user has admin roles in the smart contract
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse<{ address: string, roles: { isAdmin: boolean, isHost: boolean, isSponsor: boolean } } | { error: string }>> {
  const { address: rawAddress } = await params

  // Validate address using Zod schema
  const addressResult = safeParseWithError(AddressSchema, rawAddress)
  if (!addressResult.success) {
    return NextResponse.json({ error: `Invalid address: ${addressResult.error}` }, { status: 400 })
  }

  const validatedAddress = addressResult.data

  try {
    // Check if contract address is configured
    if (!POOL_CONTRACT_ADDRESS) {
      console.error('[API] Pool contract address not configured')
      return NextResponse.json({ error: 'Pool contract address not configured' }, { status: 500 })
    }

    console.warn('[API] Checking roles for address:', validatedAddress)
    console.warn('[API] Contract address:', POOL_CONTRACT_ADDRESS)

    // Get role constants from the contract
    const [defaultAdminRole, whitelistedHostRole, whitelistedSponsorRole] = await Promise.all([
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'DEFAULT_ADMIN_ROLE',
      }),
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'WHITELISTED_HOST',
      }),
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'WHITELISTED_SPONSOR',
      }),
    ])

    // Check if user has each role
    const [isAdmin, isHost, isSponsor] = await Promise.all([
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'hasRole',
        args: [defaultAdminRole, validatedAddress],
      }),
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'hasRole',
        args: [whitelistedHostRole, validatedAddress],
      }),
      client.readContract({
        address: POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: poolAbi,
        functionName: 'hasRole',
        args: [whitelistedSponsorRole, validatedAddress],
      }),
    ])

    const responseData = {
      address: validatedAddress,
      roles: {
        isAdmin: Boolean(isAdmin),
        isHost: Boolean(isHost),
        isSponsor: Boolean(isSponsor),
      },
    }

    // Validate response with Zod schema before sending
    const validationResult = safeParseWithError(UserRolesSchema, responseData)
    if (!validationResult.success) {
      console.error('[API] Response validation failed:', validationResult.error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const response = NextResponse.json(validationResult.data)

    // Set basic caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, max-age=3600') // 1 hour cache

    return response
  }
  catch (error) {
    console.error('[API] Error checking user roles:', error)

    // Check if it's a contract interaction error
    if (error instanceof Error) {
      if (error.message.includes('Contract read failed') || error.message.includes('execution reverted')) {
        console.warn('[API] Contract not deployed or not responding, returning default roles')
        // Return default roles when contract is not available
        return NextResponse.json({
          address: validatedAddress,
          roles: {
            isAdmin: false,
            isHost: false,
            isSponsor: false,
          },
        })
      }
      if (error.message.includes('network')) {
        return NextResponse.json({ error: 'Network error' }, { status: 503 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
