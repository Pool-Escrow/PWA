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

    // Fetch real balances from the blockchain using the existing balances endpoint
    const baseUrl = request.nextUrl.origin
    const balancesResponse = await fetch(`${baseUrl}/api/balances/${address}`)

    if (!balancesResponse.ok) {
      console.error('[API] Failed to fetch balances from blockchain:', balancesResponse.statusText)
      return NextResponse.json({ error: 'Failed to fetch balances from blockchain' }, { status: 500 })
    }

    const balancesData = await balancesResponse.json() as App.BalancesResponse

    // Validate response with Zod schema before sending
    const validationResult = safeParseWithError(BalancesResponseSchema, balancesData)
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
