// Token addresses for different chains
// USDC addresses from: https://developers.circle.com/stablecoins/usdc-contract-addresses

export const TOKEN_ADDRESSES = {
  // Base Sepolia Testnet (84532)
  84532: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
    DROP: '0xc9e3a0b2d65cbb151fa149608f99791543290d6d' as const, // Deployed DROP token
  },
  // Base Mainnet (8453)
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
    DROP: '0xd8a698486782d0d3fa336c0f8dd7856196c97616' as const, // Deployed DROP token
  },
  // Ethereum Mainnet (1)
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
    DROP: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy DROP token
  },
  // Arbitrum One (42161)
  42161: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as const,
    DROP: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy DROP token
  },
  // Optimism (10)
  10: {
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as const,
    DROP: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy DROP token
  },
  // Polygon (137)
  137: {
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const,
    DROP: '0x0000000000000000000000000000000000000000' as const, // TODO: Deploy DROP token
  },
  // Local Anvil (31337)
  31337: {
    USDC: '0x0000000000000000000000000000000000000000' as const, // Mock token
    DROP: '0x0000000000000000000000000000000000000000' as const, // Mock token
  },
} as const

export type SupportedChainId = keyof typeof TOKEN_ADDRESSES
export type TokenSymbol = 'USDC' | 'DROP'

// Helper function to get token address
export function getTokenAddress(chainId: SupportedChainId, symbol: TokenSymbol): string {
  return TOKEN_ADDRESSES[chainId][symbol]
}

// Helper function to check if token is deployed
export function isTokenDeployed(chainId: SupportedChainId, symbol: TokenSymbol): boolean {
  const address = getTokenAddress(chainId, symbol)
  return address !== '0x0000000000000000000000000000000000000000'
} 