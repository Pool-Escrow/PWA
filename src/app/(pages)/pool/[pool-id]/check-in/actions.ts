'use server'

import { UnauthorizedError } from '@/app/_lib/entities/errors/auth'
import { verifyToken } from '@/app/_server/auth/privy'
import { db } from '@/app/_server/database/db'
import { isAdminUseCase } from '@/app/_server/use-cases/users/is-admin'
import { isParticipantUseCase } from '@/app/_server/use-cases/users/is-participant'
import { Address } from 'viem'

export async function checkInAction(poolId: string, address: Address) {
    try {
        // Ensure the caller is an admin
        const callerUser = await verifyToken()

        if (!callerUser) {
            throw new UnauthorizedError('User is not logged in')
        }

        const callerAddress = callerUser.wallet?.address
        const isAdmin = await isAdminUseCase(callerAddress)

        if (!isAdmin) {
            throw new UnauthorizedError('User is not an admin')
        }

        console.log('caller is admin')

        // Ensure the user with the given address is registered in the pool
        const isParticipant = await isParticipantUseCase(address, poolId)

        if (!isParticipant) {
            throw new Error('User is not a participant')
        }

        console.log('user is participant')

        // Ensure the user is not already checked in
        const { data: userData, error: userError } = await db
            .from('users')
            .select('id')
            .eq('walletAddress', address)
            .single()

        console.log('user data', userData)

        if (userError || !userData) {
            throw new Error('Participant not found')
        }

        const { data: userPoolData, error: userPoolError } = await db
            .from('pool_participants')
            .select('status')
            .eq('user_id', userData.id)
            .eq('pool_id', poolId)
            .maybeSingle()

        console.log('user pool data', userPoolData)

        if (userPoolError) {
            throw new Error('User pool not found')
        }

        if (userPoolData?.status === 'CHECKED_IN') {
            return { success: true, message: 'This user is already checked in. Would you like to go to Payout?' }
        }

        console.log('user is not checked in')

        console.log('adding user id', userData.id, 'to pool', poolId)

        const { error } = await db.from('pool_participants').insert({
            pool_id: Number(poolId),
            user_id: userData.id,
            poolRole: 'participant',
            status: 'CHECKED_IN',
            checked_in_at: new Date().toISOString(),
        })

        if (error) {
            throw error
        }

        return { success: true, message: 'Check-in successful' }
    } catch (error) {
        console.error('Error in check-in process:', error)
        return { success: false, message: error }
    }
}

export async function checkParticipantStatusAction(poolId: string, address: Address) {
    try {
        // Ensure the caller is an admin
        const callerUser = await verifyToken()

        if (!callerUser) {
            throw new UnauthorizedError('User is not logged in')
        }

        const callerAddress = callerUser.wallet?.address
        const isAdmin = await isAdminUseCase(callerAddress)

        if (!isAdmin) {
            throw new UnauthorizedError('User is not an admin')
        }

        // Check if the user is registered in the pool
        const isParticipant = await isParticipantUseCase(address, poolId)

        if (!isParticipant) {
            return {
                success: false,
                status: 'NOT_REGISTERED',
                message: 'User is not registered in this pool',
            }
        }

        // Get user's check-in status
        const { data: userData, error: userError } = await db
            .from('users')
            .select('id')
            .eq('walletAddress', address)
            .single()

        if (userError || !userData) {
            throw new Error('Participant not found')
        }

        const { data: userPoolData, error: userPoolError } = await db
            .from('pool_participants')
            .select('status')
            .eq('user_id', userData.id)
            .eq('pool_id', poolId)
            .maybeSingle()
            console.log('-- userPoolError check status  --- ')
        if (userPoolError) {
            throw new Error('Error checking participant status')
        }

        if (userPoolData?.status === 'CHECKED_IN') {
            return {
                success: true,
                status: 'CHECKED_IN',
                message: 'User is already checked in',
            }
        }

        return {
            success: true,
            status: 'REGISTERED',
            message: 'User is registered but not checked in',
        }
    } catch (error) {
        console.error('Error checking participant status:', error)
        return {
            success: false,
            status: 'ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}
