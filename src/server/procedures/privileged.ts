import 'server-only'

import { UnauthorizedError } from '@/lib/entities/errors/auth'
import { createServerActionProcedure } from 'zsa'
import { isAdminUseCase } from '../use-cases/users/is-admin'
import { authenticatedProcedure } from './authenticated'

export const privilegedProcedure = createServerActionProcedure(authenticatedProcedure).handler(
    async ({ ctx: { user } }) => {
        const address = user.wallet?.address

        try {
            const isAdmin = await isAdminUseCase(address)

            if (!isAdmin) {
                throw new UnauthorizedError('User is not an admin')
            }

            return { user }
        } catch {
            throw new UnauthorizedError('Error checking admin status')
        }
    },
)
