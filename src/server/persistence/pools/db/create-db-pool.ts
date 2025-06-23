import 'server-only'

import { getDb } from '@/server/database/db'
import type { Address } from 'viem'
import { uploadBannerImageToStorage } from '../storage/upload-banner-image'

interface PoolItem {
    name: string
    description: string
    bannerImage: File
    termsURL: string
    softCap: number
    startDate: number
    endDate: number
    price: number
    tokenAddress: Address
    requiredAcceptance: boolean
}

export async function createPoolInDb(creatorAddress: Address, data: PoolItem) {
    console.log('Creating pool in database...')

    const db = getDb()
    const { data: createdPool, error } = await db
        .from('pools')
        .insert({
            bannerImage: '',
            name: data.name,
            description: data.description,
            termsURL: data.termsURL,
            softCap: data.softCap,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            price: data.price,
            tokenAddress: data.tokenAddress,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            required_acceptance: data.requiredAcceptance,
            contract_id: null, // Explicitly set contract_id to null
        })
        .select('*')
        .single()

    if (error || !createdPool) {
        throw new Error(`Error creating pool in database: ${error.message}`)
    }

    const poolId = createdPool.internal_id.toString()
    let bannerImageUrl: string | undefined

    if (data.bannerImage) {
        // const processedBuffer = await processImage(data.bannerImage, 1024, 512)
        bannerImageUrl = await uploadBannerImageToStorage(poolId, data.bannerImage)
    }

    // update bannerImage with correct url
    const { error: updateError } = await db
        .from('pools')
        .update({ bannerImage: bannerImageUrl })
        .eq('internal_id', poolId)

    if (updateError) {
        throw new Error(`Error updating bannerImage in database: ${updateError.message}`)
    }

    // Add the creator as the main host
    // First, find the connected user's ID
    // managed from the update stage after contract confirm
    const { data: userData, error: userError } = await db
        .from('users')
        .select('id')
        .eq('walletAddress', creatorAddress)
        .single()

    if (userError) {
        console.error('Error finding user:', userError)
        throw userError
    }

    if (!userData) {
        throw new Error('User not found')
    }

    return createdPool // Return the created pool
}
