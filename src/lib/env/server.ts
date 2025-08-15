import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // RPC URLs for different chains
    BASE_SEPOLIA_RPC_URL: z.optional(z.url()),
    BASE_MAINNET_RPC_URL: z.optional(z.url()),
    ANVIL_RPC_URL: z.optional(z.url()),

    // Etherscan API key (unified for Base/Basescan)
    ETHERSCAN_API_KEY: z.optional(z.string()),

    // Node environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
