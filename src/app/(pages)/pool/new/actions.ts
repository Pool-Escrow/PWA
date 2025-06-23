'use server'

import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { verifyToken } from '@/server/auth/privy'
import { currentTokenAddress } from '@/server/blockchain/server-config'
import { verifyParticipantInContract } from '@/server/blockchain/verify-participant'
import { getDb } from '@/server/database/db'
import { createPoolUseCase } from '@/server/use-cases/pools/create-pool'
import { fromZonedTime } from 'date-fns-tz'
import { getUserAddressAction } from '../../pools/actions'
import { CreatePoolFormSchema } from './_lib/definitions'

type FormState = {
    message?: string
    errors?: {
        bannerImage: string[]
        name: string[]
        dateRange: string[]
        description: string[]
        price: string[]
        softCap: string[]
        termsURL: string[]
        requiredAcceptance: string[]
    }
    internalPoolId?: string
    poolData?: {
        name: string
        startDate: number
        endDate: number
        price: string
    }
}

export async function createPoolAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    console.log('createPoolAction started')
    const walletAddress = await getUserAddressAction()
    const isAdmin = await getUserAdminStatusActionWithCookie()

    if (!isAdmin) {
        console.log('Unauthorized user')
        return {
            message: 'Unauthorized user',
        }
    }

    const bannerImage = formData.get('bannerImage') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const termsURL = formData.get('termsURL') as string
    const softCap = formData.get('softCap') as string
    const price = formData.get('price') as string
    // TODO: implement token address
    // const tokenAddress = formData.get('tokenAddress') as Address
    const dateRangeString = formData.get('dateRange') as string
    const timezone = formData.get('dateRange_timezone') as string
    const requiredAcceptance = formData.get('requiredAcceptance') === 'on'

    console.log('dateRangeString', dateRangeString)
    console.log('timezone', timezone)

    const parsedDateRange = JSON.parse(dateRangeString) as { start: string; end: string }
    const utcDateRange = {
        start: fromZonedTime(parsedDateRange.start, timezone),
        end: fromZonedTime(parsedDateRange.end, timezone),
    }

    console.log('utcDateRange', utcDateRange)

    // Validate fields
    const validationResult = CreatePoolFormSchema.safeParse({
        name,
        bannerImage,
        description,
        termsURL: termsURL || undefined,
        dateRange: utcDateRange,
        softCap: Number(softCap),
        price: Number(price),
        // tokenAddress,
        requiredAcceptance,
    })

    function transformErrors(zodErrors: Record<string, string[]>): FormState['errors'] {
        return {
            bannerImage: zodErrors.bannerImage || [],
            name: zodErrors.name || [],
            dateRange: zodErrors.dateRange || [],
            description: zodErrors.description || [],
            price: zodErrors.price || [],
            softCap: zodErrors.softCap || [],
            termsURL: zodErrors.termsURL || [],
            requiredAcceptance: zodErrors.requiredAcceptance || [],
        }
    }

    if (!validationResult.success) {
        console.log('validationResult.error.flatten()', validationResult.error.flatten())
        return {
            message: 'Invalid form data',
            errors: transformErrors(validationResult.error.flatten().fieldErrors),
        }
    }

    try {
        console.log('Attempting to create pool')
        const internalPoolId = await createPoolUseCase(walletAddress, {
            bannerImage,
            name,
            description,
            termsURL,
            softCap: Number(softCap),
            startDate: utcDateRange.start.getTime(),
            endDate: utcDateRange.end.getTime(),
            price: Number(price),
            tokenAddress: currentTokenAddress,
            requiredAcceptance,
        })

        if (!internalPoolId) {
            throw new Error('Failed to create pool, internalPoolId is null')
        }

        console.log('Pool created successfully, internalPoolId:', internalPoolId)

        return {
            message: 'Pool created successfully',
            internalPoolId,
            poolData: {
                name,
                startDate: utcDateRange.start.getTime(),
                endDate: utcDateRange.end.getTime(),
                price,
            },
        }
    } catch (error) {
        console.error('Error creating pool:', error)
        return { message: 'Error creating pool: ' + (error as Error).message }
    }
}

export async function updatePoolStatus(
    poolId: string,
    status: 'draft' | 'unconfirmed' | 'inactive' | 'depositsEnabled' | 'started' | 'paused' | 'ended' | 'deleted',
    contract_id: number,
) {
    const privyUser = await verifyToken()
    if (!privyUser) {
        throw new Error('User not found trying to add as mainhost')
    }

    const isAdmin = await getUserAdminStatusActionWithCookie()
    if (!isAdmin) {
        throw new Error('User is not authorized to delete pools')
    }

    const db = getDb()
    const { error } = await db.from('pools').update({ status, contract_id }).eq('internal_id', poolId)

    if (error) throw error

    // TODO: move this to persistence layer
    const { data: user, error: userError } = await db.from('users').select('id').eq('privyId', privyUser?.id).single()

    if (userError) {
        console.error('Error finding user:', userError)
        throw userError
    }

    // Check if the user is already a participant
    const { data: existingParticipant, error: participantCheckError } = await db
        .from('pool_participants')
        .select('*')
        .eq('pool_id', contract_id)
        .eq('user_id', user.id)
        .single()

    if (participantCheckError && participantCheckError.code !== 'PGRST116') {
        console.error('Error checking existing participant:', participantCheckError)
        throw participantCheckError
    }

    if (!existingParticipant) {
        // Only insert if the user is not already a participant
        const { error: participantError } = await db.from('pool_participants').insert({
            user_id: user.id,
            pool_id: contract_id,
            poolRole: 'mainHost',
        })

        if (participantError) {
            console.error('Error adding participant:', participantError)
            throw participantError
        }
    }
}

export async function deletePool(poolId: string) {
    const user = await verifyToken()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const isAdmin = await getUserAdminStatusActionWithCookie()
    if (!isAdmin) {
        throw new Error('User is not authorized to delete pools')
    }

    const db = getDb()
    const { error } = await db.from('pools').update({ status: 'deleted' }).eq('internal_id', poolId)

    if (error) {
        console.error('Error deleting pool:', error)
        throw error
    }

    console.log(`Pool ${poolId} deleted successfully`)
}

export async function addParticipantToPool(poolId: string, userAddress: string): Promise<boolean> {
    try {
        const privyUser = await verifyToken()
        if (!privyUser) {
            throw new Error('User not found trying to add as participant')
        }

        const db = getDb()
        const { data: user, error: userError } = await db
            .from('users')
            .select('id')
            .eq('privyId', privyUser?.id)
            .single()

        if (userError) {
            console.error('Error finding user:', userError)
            throw userError
        }

        // Check if the user is already a participant
        const { data: existingParticipant, error: participantCheckError } = await db
            .from('pool_participants')
            .select('*')
            .eq('pool_id', parseInt(poolId))
            .eq('user_id', user.id)
            .single()

        if (participantCheckError && participantCheckError.code !== 'PGRST116') {
            console.error('Error checking existing participant:', participantCheckError)
            throw participantCheckError
        }

        if (existingParticipant) {
            console.log('User is already a participant in this pool')
            return true
        }

        // Check if the user is a participant in the contract
        const isParticipantInContract = await verifyParticipantInContract(userAddress, poolId)
        if (!isParticipantInContract) {
            console.error('User is not a participant in the contract')
            return false
        }

        // Add the user as a participant
        const { error: participantError } = await db.from('pool_participants').insert({
            user_id: user.id,
            pool_id: parseInt(poolId),
            poolRole: 'participant',
        })

        if (participantError) {
            console.error('Error adding participant:', participantError)
            throw participantError
        }

        console.log(`User ${userAddress} added as participant to pool ${poolId}`)
        return true
    } catch (error) {
        console.error('Error in addParticipantToPool:', error)
        return false
    }
}
