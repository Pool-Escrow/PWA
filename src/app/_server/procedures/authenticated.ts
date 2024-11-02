import 'server-only'

import { createServerActionProcedure } from 'zsa'
import { verifyToken } from '../auth/privy'
import { AuthenticationError } from '../../_lib/entities/errors/auth'
import { rateLimitByKey } from '../lib/limiter'

export const authenticatedProcedure = createServerActionProcedure().handler(async () => {
    try {
        const user = await verifyToken()
        if (!user) {
            throw new AuthenticationError('Authenticated user not found')
        }

        // User-based rate limiting
        rateLimitByKey(`${user.id}-global`, 10, 10_000)

        return { user }
    } catch (error) {
        console.error('Authentication procedure failed:', error)
        throw error
    }
})
