import 'server-only'

import { createServerActionProcedure } from 'zsa'
import { rateLimitByKey } from '../lib/limiter'

const GLOBAL_USER = 'unauthenticated-global'

export const unauthenticatedProcedure = createServerActionProcedure().handler(() => {
    rateLimitByKey(GLOBAL_USER, 10, 10_000)
})
