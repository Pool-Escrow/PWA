import crypto from 'crypto'
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Types for Goldsky webhook events
interface GoldskyEvent {
    table: string
    operation: 'INSERT' | 'UPDATE' | 'DELETE'
    data: Record<string, unknown>
    old_data?: Record<string, unknown>
    timestamp: string
    block_number: number
    transaction_hash: string
    log_index: number
}

interface GoldskyWebhookPayload {
    events: GoldskyEvent[]
    sync_status: {
        latest_block: number
        synced_block: number
        lag_seconds: number
    }
}

// Verify webhook signature from Goldsky
function verifyGoldskySignature(payload: string, signature: string): boolean {
    const secret = process.env.GOLDSKY_WEBHOOK_SECRET
    if (!secret) {
        console.error('GOLDSKY_WEBHOOK_SECRET not configured')
        return false
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
}

// Real-time notification system (placeholder for now)
function notifyClients(event: GoldskyEvent) {
    // TODO: Implement WebSocket/SSE or Pusher integration
    console.log('📡 [Goldsky Webhook] Broadcasting event:', {
        table: event.table,
        operation: event.operation,
        poolId: (event.data.pool_id as number) || (event.data.contract_id as number),
    })

    // For now, we'll use console logging
    // In Phase 3, we'll integrate with Pusher or similar service
}

// Handle pool-related events
function handlePoolEvent(event: GoldskyEvent) {
    const { data, operation, table } = event

    try {
        switch (table) {
            case 'pools':
                handlePoolsTableEvent(event)
                break
            case 'pool_participants':
                handleParticipantsTableEvent(event)
                break
            case 'pool_winners':
                handleWinnersTableEvent(event)
                break
            case 'pool_sponsors':
                handleSponsorsTableEvent(event)
                break
            default:
                console.log(`⚠️ [Goldsky Webhook] Unknown table: ${table}`)
        }

        // Notify connected clients about the update
        notifyClients(event)
    } catch (error) {
        console.error(`❌ [Goldsky Webhook] Error handling ${table} event:`, error)
        throw error
    }
}

function handlePoolsTableEvent(event: GoldskyEvent) {
    const { data, operation } = event

    console.log(`🏊 [Goldsky Webhook] Pool ${operation}:`, {
        poolId: data.contract_id as number,
        name: data.name as string,
        status: data.status as string,
        blockNumber: data.block_number as number,
    })

    // TODO: Phase 2 - Add React Query cache invalidation
    // TODO: Phase 3 - Add real-time UI updates
}

function handleParticipantsTableEvent(event: GoldskyEvent) {
    const { data, operation } = event

    console.log(`👥 [Goldsky Webhook] Participant ${operation}:`, {
        poolId: data.pool_id as number,
        userAddress: data.user_address as string,
        role: data.pool_role as string,
        status: data.status as string,
    })

    // TODO: Phase 2 - Trigger pool participant count updates
    // TODO: Phase 3 - Real-time participant list updates
}

function handleWinnersTableEvent(event: GoldskyEvent) {
    const { data, operation } = event

    console.log(`🏆 [Goldsky Webhook] Winner ${operation}:`, {
        poolId: data.pool_id as number,
        winnerAddress: data.winner_address as string,
        amountWon: data.amount_won as number,
        claimed: data.claimed as boolean,
    })

    // TODO: Phase 2 - Update pool status to ended
    // TODO: Phase 3 - Real-time winner announcements
}

function handleSponsorsTableEvent(event: GoldskyEvent) {
    const { data, operation } = event

    console.log(`💰 [Goldsky Webhook] Sponsor ${operation}:`, {
        poolId: data.pool_id as number,
        sponsorAddress: data.sponsor_address as string,
        amount: data.amount_sponsored as number,
    })

    // TODO: Phase 2 - Update pool balance
    // TODO: Phase 3 - Real-time sponsorship notifications
}

export async function POST(req: NextRequest) {
    try {
        // Get the raw body for signature verification
        const body = await req.text()
        const headersList = headers()
        const signature = headersList.get('goldsky-signature') || headersList.get('x-goldsky-signature')

        if (!signature) {
            console.error('❌ [Goldsky Webhook] Missing signature header')
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
        }

        // Verify the webhook signature
        if (!verifyGoldskySignature(body, signature)) {
            console.error('❌ [Goldsky Webhook] Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse the payload
        const payload = JSON.parse(body) as GoldskyWebhookPayload

        console.log(`📨 [Goldsky Webhook] Received ${payload.events.length} events, sync status:`, {
            latestBlock: payload.sync_status.latest_block,
            syncedBlock: payload.sync_status.synced_block,
            lagSeconds: payload.sync_status.lag_seconds,
        })

        // Process each event
        for (const event of payload.events) {
            try {
                handlePoolEvent(event)
            } catch (error) {
                console.error('❌ [Goldsky Webhook] Failed to process event:', error)
                // Continue processing other events even if one fails
            }
        }

        // Log sync lag if significant
        if (payload.sync_status.lag_seconds > 30) {
            console.warn(`⚠️ [Goldsky Webhook] High sync lag: ${payload.sync_status.lag_seconds}s`)
        }

        return NextResponse.json({
            success: true,
            processed: payload.events.length,
            sync_status: payload.sync_status,
        })
    } catch (error) {
        console.error('❌ [Goldsky Webhook] Webhook processing failed:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 },
        )
    }
}

// Health check endpoint
export function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'goldsky-webhook',
    })
}
