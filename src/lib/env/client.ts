import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod/mini'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().check(z.minLength(1)),
  },
  runtimeEnv: {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  },
})
