import { z } from 'zod'

const explorerSchema = z.object({
    name: z.string(),
    url: z.string().url(),
    standard: z.string(),
})

const nativeCurrencySchema = z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
})

export const chainSchema = z.object({
    name: z.string(),
    chain: z.string(),
    rpc: z.array(z.string().url()),
    faucets: z.array(z.string().url()),
    nativeCurrency: nativeCurrencySchema,
    infoURL: z.string().url(),
    shortName: z.string(),
    chainId: z.number(),
    networkId: z.number(),
    slip44: z.number().optional(),
    status: z.string().optional(),
    explorers: z.array(explorerSchema).optional(),
})

export const chainsSchema = z.object({
    chains: z.array(chainSchema),
})
