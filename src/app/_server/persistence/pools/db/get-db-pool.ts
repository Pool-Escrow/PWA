import 'server-only'
import { db } from '../../../database/db'

export interface PoolItem {
    description: string
    image: string
    softCap: number
    terms: string
    hostName: string
    requiredAcceptance: boolean
}

export async function getDbPool(poolId: string): Promise<PoolItem | null> {
    const { data: poolData, error } = await db
        .from('pools')
        .select('termsURL, description, softCap, bannerImage, required_acceptance')
        .eq('contract_id', Number(poolId))
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null // Pool not found
        }
        throw new Error(`Error fetching pool from database: ${error.message}`)
    }

    const hostName = await getDbPoolHostName(poolId)

    return {
        description: poolData.description,
        image: poolData.bannerImage,
        softCap: poolData.softCap,
        terms: poolData.termsURL,
        hostName,
        requiredAcceptance: poolData.required_acceptance,
    }
}

export async function getDbPoolHostName(poolId: string): Promise<string> {
    const { data: hostData, error } = await db
        .from('pool_participants')
        .select(
            `
            users (
                displayName,
                walletAddress
            )
        `,
        )
        .eq('pool_id', Number(poolId))
        .eq('poolRole', 'mainHost')
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw new Error(`Host for pool ${poolId} not found in database`)
        }
        throw new Error(`Error fetching pool host from database: ${error.message}`)
    }

    const { displayName, walletAddress } = hostData.users || {
        displayName: null,
        walletAddress: null,
    }

    if (!walletAddress) {
        throw new Error(`Host for pool ${poolId} not found in database`)
    }

    return displayName || walletAddress
}
