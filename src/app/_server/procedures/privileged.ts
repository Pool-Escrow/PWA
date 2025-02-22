import 'server-only'

import { createServerActionProcedure } from 'zsa'
import { UnauthorizedError } from '../../_lib/entities/errors/auth'
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
        } catch (error) {
            console.error(error)
            throw new UnauthorizedError('Error checking admin status')
        }
    },
)
