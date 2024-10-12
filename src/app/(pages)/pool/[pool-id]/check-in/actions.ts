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
        const isParticipant = await isParticipantUseCase(address, BigInt(poolId))

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
            return { success: false, message: 'User is already checked in' }
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
        return { success: false, message: 'Check-in failed' }
    }
}
