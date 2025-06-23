import { env } from '@/env.mjs'
import { createConfig } from '@privy-io/wagmi'
import type { Chain } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { fallback, http } from 'wagmi'

/**
 * Environment variable names for custom RPC endpoints
 * These are NEXT_PUBLIC_ prefixed so they work in both server and client
 */
const RPC_ENV: Record<number, string | undefined> = {
    [base.id]: env.NEXT_PUBLIC_RPC_BASE,
    [baseSepolia.id]: env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
}

// Only log environment detection once in development
if (env.NODE_ENV === 'development' && !globalThis.__wagmiEnvLogged) {
    console.log('[wagmi-config] Environment detection:', {
        NEXT_PUBLIC_NETWORK: env.NEXT_PUBLIC_NETWORK,
        NODE_ENV: env.NODE_ENV,
        isClient: typeof window !== 'undefined',
        isBrowser: typeof window !== 'undefined' && typeof document !== 'undefined',
        hasCustomBaseRpc: !!env.NEXT_PUBLIC_RPC_BASE,
        hasCustomSepoliaRpc: !!env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
    })
    globalThis.__wagmiEnvLogged = true
}

/**
 * Get the appropriate RPC URL for a chain with fallback strategy
 */
const getRpcUrlsForChain = (chain: Chain): string[] => {
    const urls: string[] = []

    // 1. Primary: Environment-specific RPC URL (Alchemy/Infura with API keys)
    const customRpc = RPC_ENV[chain.id]
    if (customRpc && customRpc.length > 0) {
        urls.push(customRpc)
    }

    // 2. High-quality public RPC endpoints (prioritize working ones)
    if (chain.id === base.id) {
        const fallbackUrls = [
            'https://base.publicnode.com',
            'https://base.llamarpc.com',
            'https://base-rpc.publicnode.com',
        ]
        urls.push(...fallbackUrls)
    }

    if (chain.id === baseSepolia.id) {
        // Prioritize working endpoints and avoid sepolia.base.org
        const fallbackUrls = [
            'https://base-sepolia.publicnode.com',
            'https://base-sepolia-rpc.publicnode.com',
            'https://base-sepolia.gateway.tenderly.co',
        ]
        urls.push(...fallbackUrls)
    }

    // 3. Last resort: Default RPC from viem (but filter out problematic ones)
    const defaultUrls = chain.rpcUrls.default.http.filter(url => {
        // Skip the problematic sepolia.base.org endpoint
        if (chain.id === baseSepolia.id && url.includes('sepolia.base.org')) {
            return false
        }
        return true
    })

    urls.push(...defaultUrls)
    return urls
}

/**
 * Create transport configuration for a chain with fallback strategy
 */
const createTransportForChain = (chain: Chain) => {
    const urls = getRpcUrlsForChain(chain)

    if (urls.length === 1) {
        return http(urls[0], {
            timeout: 10_000,
            retryCount: 2,
            retryDelay: 1_000,
        })
    }

    return fallback(
        urls.map(url =>
            http(url, {
                timeout: 10_000,
                retryCount: 1,
                retryDelay: 1_000,
            }),
        ),
        {
            rank: true,
            retryCount: 2,
            retryDelay: 2_000,
        },
    )
}

/**
 * Chain configuration based on environment
 */
const getChainConfiguration = (): { chains: readonly [Chain, ...Chain[]]; defaultChain: Chain } => {
    const network = env.NEXT_PUBLIC_NETWORK

    switch (network) {
        case 'mainnet':
            return {
                chains: [base] as const,
                defaultChain: base,
            }
        case 'testnet':
            return {
                chains: [base, baseSepolia] as const,
                defaultChain: baseSepolia,
            }
        case 'development':
            return {
                chains: [base, baseSepolia] as const,
                defaultChain: baseSepolia,
            }
        default:
            return {
                chains: [base, baseSepolia] as const,
                defaultChain: base,
            }
    }
}

const { chains, defaultChain } = getChainConfiguration()

/**
 * Create transports for all supported chains
 */
const createTransports = () => {
    const transports: Record<number, ReturnType<typeof createTransportForChain>> = {}

    for (const chain of chains) {
        transports[chain.id] = createTransportForChain(chain)
    }

    return transports
}

/**
 * Wagmi configuration for the application
 * This is used by both Privy and direct wagmi usage
 */
export const config = createConfig({
    chains,
    transports: createTransports(),
    multiInjectedProviderDiscovery: true,
    syncConnectedChain: true,
    ssr: true,
})

// Debug logging - only once in development
if (env.NODE_ENV === 'development' && !globalThis.__wagmiConfigLogged) {
    console.log('[wagmi-config] Configuration created:', {
        network: env.NEXT_PUBLIC_NETWORK,
        defaultChain: defaultChain.name,
        supportedChains: chains.map(c => c.name),
        chainIds: chains.map(c => c.id),
        hasCustomRpcUrls: {
            base: !!env.NEXT_PUBLIC_RPC_BASE,
            baseSepolia: !!env.NEXT_PUBLIC_RPC_BASE_SEPOLIA,
        },
    })
    globalThis.__wagmiConfigLogged = true
}

/**
 * Get the wagmi configuration
 * This function can be used to access the config in other parts of the app
 */
export const getConfig = () => config

/**
 * Export supported chains and default chain for convenience
 */
export { defaultChain, chains as supportedChains }

/**
 * Export network information
 */
export const networkInfo = {
    current: env.NEXT_PUBLIC_NETWORK,
    isDevelopment: env.NODE_ENV === 'development',
    isMainnet: env.NEXT_PUBLIC_NETWORK === 'mainnet',
    isTestnet: env.NEXT_PUBLIC_NETWORK === 'testnet',
}
