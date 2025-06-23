'use server'

import { authenticatedProcedure } from '@/server/procedures/authenticated'
import { createProfileUseCase } from '@/server/use-cases/users/create-user'
import { isAdminUseCase } from '@/server/use-cases/users/is-admin'
import type { Address } from 'viem'

export const createUserAction = authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }) => {
    const walletAddress = user.wallet?.address as Address | undefined
    if (!walletAddress) {
        throw new Error('User does not have a wallet address')
    }
    await createProfileUseCase({
        privyId: user.id,
        info: {
            walletAddress,
            role: (await isAdminUseCase(walletAddress)) ? 'admin' : 'user',
        },
    })
})
