import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

/**
 * Database pool status values (strings from Supabase enum)
 */
export type DatabasePoolStatus =
    | 'draft'
    | 'unconfirmed'
    | 'inactive'
    | 'depositsEnabled'
    | 'started'
    | 'paused'
    | 'ended'
    | 'deleted'

/**
 * Mapping from database string status to smart contract numeric status
 */
const DB_STATUS_TO_CONTRACT_STATUS: Record<DatabasePoolStatus, POOLSTATUS> = {
    draft: POOLSTATUS.INACTIVE,
    unconfirmed: POOLSTATUS.INACTIVE,
    inactive: POOLSTATUS.INACTIVE,
    depositsEnabled: POOLSTATUS.DEPOSIT_ENABLED,
    started: POOLSTATUS.STARTED,
    paused: POOLSTATUS.STARTED, // Treat paused as started for filtering purposes
    ended: POOLSTATUS.ENDED,
    deleted: POOLSTATUS.DELETED,
}

/**
 * Convert database string status to smart contract numeric status
 */
export function mapDbStatusToContractStatus(dbStatus: string | null | undefined): POOLSTATUS {
    if (!dbStatus) {
        return POOLSTATUS.INACTIVE
    }

    const status = dbStatus.toLowerCase() as DatabasePoolStatus
    return DB_STATUS_TO_CONTRACT_STATUS[status] ?? POOLSTATUS.INACTIVE
}

/**
 * Check if a database status should be visible in upcoming pools
 * (equivalent to contractStatus <= POOLSTATUS.DEPOSIT_ENABLED)
 */
export function isPoolStatusVisible(dbStatus: string | null | undefined): boolean {
    const contractStatus = mapDbStatusToContractStatus(dbStatus)
    const isVisible = contractStatus <= POOLSTATUS.DEPOSIT_ENABLED

    // Only enable for debugging, is very noisy
    // if (process.env.NODE_ENV === 'development') {
    //     console.log(
    //         `[isPoolStatusVisible] Status check: "${dbStatus}" -> ${contractStatus} (${POOLSTATUS[contractStatus]}) = ${isVisible ? '✅' : '❌'}`,
    //     )
    // }

    return isVisible
}

/**
 * Get all database statuses that should be visible
 */
export function getVisibleDbStatuses(): DatabasePoolStatus[] {
    return Object.entries(DB_STATUS_TO_CONTRACT_STATUS)
        .filter(([, contractStatus]) => contractStatus <= POOLSTATUS.DEPOSIT_ENABLED)
        .map(([dbStatus]) => dbStatus as DatabasePoolStatus)
}

/**
 * Development helper: Log status mapping for debugging
 * Only logs when NEXT_PUBLIC_VERBOSE_LOGS is explicitly enabled
 */
export function logStatusMapping() {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        console.log('[pool-status-mapping] Status mapping:')
        Object.entries(DB_STATUS_TO_CONTRACT_STATUS).forEach(([dbStatus, contractStatus]) => {
            const visible = contractStatus <= POOLSTATUS.DEPOSIT_ENABLED
            console.log(`  "${dbStatus}" -> ${contractStatus} (${POOLSTATUS[contractStatus]}) ${visible ? '✅' : '❌'}`)
        })
        console.log(`[pool-status-mapping] Visible statuses: ${getVisibleDbStatuses().join(', ')}`)
    }
}
