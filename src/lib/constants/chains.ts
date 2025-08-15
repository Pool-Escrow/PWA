import { base, baseSepolia, localhost } from 'viem/chains'

// Chain configurations with default RPC URLs
export const CHAIN_CONFIG = {
  84532: {
    chain: baseSepolia,
    defaultRpcUrl: 'https://sepolia.base.org',
  },
  8453: {
    chain: base,
    defaultRpcUrl: 'https://mainnet.base.org',
  },
  31337: {
    chain: localhost,
    defaultRpcUrl: 'http://localhost:8545',
  },
} as const

export type SupportedChainId = keyof typeof CHAIN_CONFIG

// Default chain for the application
export const DEFAULT_CHAIN_ID: SupportedChainId = 84532
