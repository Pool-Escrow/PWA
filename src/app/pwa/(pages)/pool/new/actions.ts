'use server'

import { getPrivyUser, getWalletAddress, isAdmin } from '@/app/pwa/_server/auth/privy'
import { db } from '@/app/pwa/_server/database/db'
import { createPoolUseCase } from '@/app/pwa/_server/use-cases/pools/create-pool'
import { dropletAddress } from '@/types/contracts'
import { cookies } from 'next/headers'
import { baseSepolia } from 'viem/chains'
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
    }
    internalPoolId?: string
    poolData?: {
        name: string
        startDate: string
        endDate: string
        price: string
    }
}

export async function createPoolAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    const user = await getPrivyUser()
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!user || !privyAuthToken) {
        return {
            message: 'Not connected with Privy',
        }
    }

    const walletAddress = await getWalletAddress()

    if (!walletAddress || !(await isAdmin(walletAddress))) {
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
    const dateRangeString = formData.get('dateRange')
    let dateRange: { start: string; end: string } | null = null

    console.log('dateRangeString', dateRangeString)

    if (dateRangeString && typeof dateRangeString === 'string') {
        try {
            const parsedDateRange = JSON.parse(dateRangeString) as { start: string; end: string }

            // Convert local dates to UTC by subtracting the timezone offset
            dateRange = {
                start: new Date(parsedDateRange.start).toISOString().substring(0, 16), // YYYY-MM-DDTHH:MM
                end: new Date(parsedDateRange.end).toISOString().substring(0, 16), // YYYY-MM-DDTHH:MM
            };
        } catch (error) {
            console.error('Error parsing dateRange:', error)
        }
    }

    console.log('dateRange', dateRange)

    if (!dateRange || !dateRange.start || !dateRange.end) {
        return {
            message: 'Invalid date range',
        }
    }

    // Validate fields
    const validationResult = CreatePoolFormSchema.safeParse({
        name,
        bannerImage,
        description,
        termsURL: termsURL || undefined,
        dateRange,
        softCap: Number(softCap),
        price: Number(price),
        // tokenAddress,
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
        const internalPoolId = await createPoolUseCase(walletAddress, {
            bannerImage,
            name,
            description,
            termsURL,
            softCap: Number(softCap),
            startDate: dateRange.start,
            endDate: dateRange.end,
            price: Number(price),
            tokenAddress: dropletAddress[baseSepolia.id],
        })

        return {
            message: 'Pool created successfully',
            internalPoolId,
            poolData: {
                name,
                startDate: dateRange.start,
                endDate: dateRange.end,
                price,
            },
        }
    } catch (error) {
        return { message: 'Error creating pool: ' + (error as Error).message }
    }
}

export async function updatePoolStatus(
    poolId: string,
    status: 'draft' | 'unconfirmed' | 'inactive' | 'depositsEnabled' | 'started' | 'paused' | 'ended' | 'deleted',
    contract_id: number,
) {
    const user = await getPrivyUser()
    if (!user) {
        throw new Error('User not found trying to add as mainhost')
    }

    const { error } = await db.from('pools').update({ status, contract_id }).eq('internal_id', poolId)

    // TODO: move this to persistence layer
    const { data: userId, error: userError } = await db.from('users').select('id').eq('privyId', user?.id).single()

    if (userError) {
        console.error('Error finding user:', userError)
        throw userError
    }

    // Now insert into pool_participants using the found user ID
    const { error: participantError } = await db.from('pool_participants').insert({
        user_id: userId.id,
        pool_id: contract_id,
        poolRole: 'mainHost',
    })

    if (participantError) {
        console.error('Error adding participant:', participantError)
        throw participantError
    }

    if (error) throw error
}
