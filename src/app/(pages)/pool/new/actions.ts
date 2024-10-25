'use server'

import { db } from '@/app/_server/database/db'
import { createPoolUseCase } from '@/app/_server/use-cases/pools/create-pool'
import { CreatePoolFormSchema } from './_lib/definitions'
import { verifyToken } from '@/app/_server/auth/privy'
import { getAdminStatusAction, getUserAddressAction } from '../../pools/actions'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { fromZonedTime } from 'date-fns-tz'

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
        codeOfConductURL: string[]
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
    const isAdmin = await getAdminStatusAction()

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
    const codeOfConductURL = formData.get('codeOfConductURL') as string
    const requiredAcceptance = formData.get('requiredAcceptance') === 'true'

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
        codeOfConductURL: codeOfConductURL || undefined,
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
            codeOfConductURL: zodErrors.codeOfConductURL || [],
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
            codeOfConductURL,
            requiredAcceptance,
        })

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

    const isAdmin = await getAdminStatusAction()
    if (!isAdmin) {
        throw new Error('User is not authorized to delete pools')
    }

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

    const isAdmin = await getAdminStatusAction()
    if (!isAdmin) {
        throw new Error('User is not authorized to delete pools')
    }

    const { error: deleteError } = await db.from('pools').delete().eq('internal_id', poolId)

    if (deleteError) {
        console.error('Error deleting pool:', deleteError)
        throw new Error('Failed to delete pool')
    }

    const { error: participantDeleteError } = await db.from('pool_participants').delete().eq('pool_id', poolId)

    if (participantDeleteError) {
        console.error('Error deleting pool participants:', participantDeleteError)
    }

    console.log('Pool with id', poolId, 'and related data deleted successfully')
}
