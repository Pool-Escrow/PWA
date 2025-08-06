import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AddressSchema, BalancesResponseSchema, safeParseWithError } from '@/lib/schemas'

/**
 * GET /api/user-balances/[address]
 * Fetch user balances for a given address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse<App.BalancesResponse | { error: string }>> {
  try {
    const { address: rawAddress } = await params

    // Validate address using Zod schema
    const addressResult = safeParseWithError(AddressSchema, rawAddress)
    if (!addressResult.success) {
      return NextResponse.json({ error: `Invalid address: ${addressResult.error}` }, { status: 400 })
    }

    const address = addressResult.data

    // Mock data - replace with actual API calls
    const mockBalances: App.BalancesResponse = {
      address,
      balances: {
        usdc: {
          symbol: 'USDC',
          balance: 1234.56,
          rawBalance: '1234560000', // 6 decimals
        },
        drop: {
          symbol: 'DROP',
          balance: 18600,
          rawBalance: '18600000000000000000000', // 18 decimals
        },
      },
    }

    // Validate response with Zod schema before sending
    const validationResult = safeParseWithError(BalancesResponseSchema, mockBalances)
    if (!validationResult.success) {
      console.error('[API] Response validation failed:', validationResult.error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(validationResult.data)
  }
  catch (error) {
    console.error('[API] Error fetching user balances:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
