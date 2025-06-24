import { env } from '@/env.mjs'
import { dropTokenAddress, poolAddress, tokenAddress } from '@/types/contracts'
import { createConfig, getPublicClient, http } from '@wagmi/core'
import type { Address, Chain } from 'viem'
import { base, baseSepolia } from 'viem/chains'

/**
 * Chain configuration based on environment
 */
const getChainConfiguration = (): { chains: readonly [Chain, ...Chain[]]; defaultChain: Chain } => {
    const network = env.NEXT_PUBLIC_NETWORK

    // Only log in development with verbose flag and only once per session
    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' && !globalThis.__serverConfigLogged) {
        console.log('[server-config] Chain configuration for network:', network)
        globalThis.__serverConfigLogged = true
    }

    switch (network) {
        case 'mainnet':
            if (
                env.NODE_ENV === 'development' &&
                env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' &&
                !globalThis.__serverConfigLogged
            ) {
                console.log('[server-config] Using MAINNET configuration (Base only)')
            }
            return {
                chains: [base] as const,
                defaultChain: base,
            }
        case 'testnet':
            if (
                env.NODE_ENV === 'development' &&
                env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' &&
                !globalThis.__serverConfigLogged
            ) {
                console.log('[server-config] Using TESTNET configuration (Base + Base Sepolia for development)')
            }
            return {
                chains: [base, baseSepolia] as const,
                defaultChain: baseSepolia,
            }
        case 'development':
        default:
            if (
                env.NODE_ENV === 'development' &&
                env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' &&
                !globalThis.__serverConfigLogged
            ) {
                console.log('[server-config] Using DEVELOPMENT configuration (Base + Base Sepolia, default: Sepolia)')
            }
            return {
                chains: [base, baseSepolia] as const,
                defaultChain: baseSepolia,
            }
    }
}

const { chains, defaultChain } = getChainConfiguration()

/**
 * Public environment variable names matching each supported chain.
 * These **must** be prefixed with NEXT_PUBLIC_ so that they are available in both
 * server and browser environments when using Next.js.
 */
const RPC_ENV: Record<number, string | undefined> = {
    [base.id]: env.NEXT_PUBLIC_RPC_BASE,
    [baseSepolia.id]: env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
}

const getRpcUrlForChain = (chain: Chain): string => {
    // Only log RPC configuration once per chain per session with verbose flag
    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        if (!globalThis.__rpcConfigLogged) globalThis.__rpcConfigLogged = {}
        if (!globalThis.__rpcConfigLogged[chain.id]) {
            console.log(`[server-config] Getting RPC URL for chain ${chain.name} (ID: ${chain.id})`)
            globalThis.__rpcConfigLogged[chain.id] = true
        }
    }

    // 1. Primary: Environment-specific RPC URL (Alchemy/Infura with API keys)
    const customRpc = RPC_ENV[chain.id]
    if (customRpc && customRpc.length > 0) {
        if (env.NODE_ENV === 'development' && globalThis.__rpcConfigLogged && !globalThis.__rpcConfigLogged[chain.id]) {
            console.log(`[server-config] Using custom RPC from environment for ${chain.name}`)
        }
        return customRpc
    }

    // 2. Fallback: Use chain's default RPC URL
    const defaultRpc = chain.rpcUrls.default.http[0]
    if (env.NODE_ENV === 'development' && globalThis.__rpcConfigLogged && !globalThis.__rpcConfigLogged[chain.id]) {
        console.log(`[server-config] Using default RPC for ${chain.name}: ${defaultRpc}`)
    }
    return defaultRpc
}

/**
 * Create transports for each chain with fallback strategy
 */
const createTransports = () => {
    const transports: Record<number, ReturnType<typeof http>> = {}

    // Only log transport creation once with verbose flag
    if (
        env.NODE_ENV === 'development' &&
        env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' &&
        !globalThis.__transportConfigLogged
    ) {
        console.log(
            '[server-config] Creating transports for chains:',
            chains.map(c => c.name),
        )
        globalThis.__transportConfigLogged = true
    }

    for (const chain of chains) {
        const rpcUrl = getRpcUrlForChain(chain)
        transports[chain.id] = http(rpcUrl, {
            timeout: 30_000,
            retryCount: 3,
            retryDelay: 1_000,
        })

        if (env.NODE_ENV === 'development' && !globalThis.__transportConfigLogged) {
            console.log(`[server-config] Transport created for ${chain.name}: ${rpcUrl.substring(0, 50)}...`)
        }
    }

    return transports
}

/**
 * Server-side wagmi configuration
 * This config is used for blockchain interactions on the server
 */
export const serverConfig = createConfig({
    chains,
    transports: createTransports(),
})

if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' && !globalThis.__serverInitLogged) {
    console.log('[server-config] Server configuration initialized:', {
        network: env.NEXT_PUBLIC_NETWORK,
        defaultChain: defaultChain.name,
        supportedChains: chains.map(c => c.name),
        hasCustomBaseRpc: !!env.NEXT_PUBLIC_RPC_BASE,
        hasCustomSepoliaRpc: !!env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
    })
    globalThis.__serverInitLogged = true
}

/**
 * Get the current pool contract address based on the default chain
 */
export const currentPoolAddress: Address = poolAddress[defaultChain.id as keyof typeof poolAddress] as Address

/**
 * Get the current token contract address based on the default chain
 */
export const currentTokenAddress: Address = tokenAddress[defaultChain.id as keyof typeof tokenAddress] as Address

/**
 * Get the current drop token contract address based on the default chain
 */
export const currentDropTokenAddress: Address = dropTokenAddress[
    defaultChain.id as keyof typeof dropTokenAddress
] as Address

// Only log contract addresses once in development with verbose flag
if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' && !globalThis.__contractAddressLogged) {
    console.log('[server-config] Contract addresses:', {
        chain: defaultChain.name,
        poolAddress: currentPoolAddress,
        tokenAddress: currentTokenAddress,
        dropTokenAddress: currentDropTokenAddress,
    })
    globalThis.__contractAddressLogged = true
}

/**
 * Get the pool contract address for a specific chain, or the default if not provided
 * @param chainId The ID of the chain to get the address for
 * @returns The contract address
 */
export const getPoolAddressForChain = (chainId?: number): Address | undefined => {
    const targetChainId = chainId || defaultChain.id
    return poolAddress[targetChainId as keyof typeof poolAddress] as Address | undefined
}

/**
 * Get a public client for the default chain
 */
export const getDefaultPublicClient = () => {
    const client = getPublicClient(serverConfig, { chainId: defaultChain.id })
    if (!client) {
        console.error('[server-config] Failed to create public client for chain:', defaultChain.name)
        throw new Error(`Failed to create public client for chain: ${defaultChain.name}`)
    }
    console.log('[server-config] Public client created for chain:', defaultChain.name)
    return client
}

/**
 * Server client alias for backward compatibility
 */
export const serverClient = getDefaultPublicClient

/**
 * Explorer URL for the current chain
 */
export const explorerUrl = defaultChain.blockExplorers?.default?.url || 'https://basescan.org'

// Only log explorer URL once in development with verbose flag
if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true' && !globalThis.__explorerUrlLogged) {
    console.log('[server-config] Explorer URL:', explorerUrl)
    globalThis.__explorerUrlLogged = true
}
