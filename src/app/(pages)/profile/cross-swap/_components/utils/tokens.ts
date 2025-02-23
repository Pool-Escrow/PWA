import type { Chain, Token } from '../../types'

/**
 * Token and chain utility functions
 */

/**
 * Finds a token symbol by its contract address
 * @param {string} tokenAddress - The token contract address
 * @param {Token[]} tokens - Array of available tokens
 * @returns {string | undefined} The token symbol if found
 */
export const tokenAddressToName = (tokenAddress: string, tokens: Token[]): string | undefined => {
    const token = tokens.find(token => token.tokenContractAddress === tokenAddress)
    return token?.tokenSymbol
}

/**
 * Finds a token logo URL by its contract address
 * @param {string} tokenAddress - The token contract address
 * @param {Token[]} tokens - Array of available tokens
 * @returns {string | undefined} The token logo URL if found
 */
export const tokenAddressToLogo = (tokenAddress: string, tokens: Token[]): string | undefined => {
    const token = tokens.find(token => token.tokenContractAddress === tokenAddress)
    return token?.tokenLogoUrl
}

/**
 * Finds a chain name by its ID
 * @param {string} chainId - The chain ID
 * @param {Chain[]} chains - Array of available chains
 * @returns {string | undefined} The chain name if found
 */
export const chainIdToName = (chainId: string, chains: Chain[]): string | undefined => {
    const chain = chains.find(chain => chain.chainId === Number(chainId))
    return chain?.name
}
