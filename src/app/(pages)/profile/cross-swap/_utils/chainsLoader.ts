import { chainsSchema } from '../_schemas/chainSchema'
import type { Chain, ChainsData } from '../types'

let cachedChains: Chain[] | null = null

/**
 * Get the correct URL for chains.json based on environment
 */
function getChainsJsonUrl(): string {
    // SSR: use absolute URL if available, fallback to localhost
    if (typeof window === 'undefined') {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        return `${baseUrl}/data/chains.json`
    }
    // Client: use relative URL
    return '/data/chains.json'
}

/**
 * Load and validate chains data with proper type safety
 */
export async function loadChains(): Promise<Chain[]> {
    if (cachedChains) {
        return cachedChains
    }

    try {
        const url = getChainsJsonUrl()
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch chains data: ${response.status} ${response.statusText}`)
        }

        // Parse JSON and validate with Zod schema for type safety
        const rawData: unknown = await response.json()
        const validatedData: ChainsData = chainsSchema.parse(rawData)

        cachedChains = validatedData.chains
        return cachedChains
    } catch (error) {
        console.error('Error loading or validating chains data:', error)
        throw error
    }
}
