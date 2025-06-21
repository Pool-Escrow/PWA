import { chainsSchema } from '../_schemas/chainSchema'
import type { Chain, ChainsData } from '../types'

export function loadChains(): Chain[] {
    try {
        const validatedData = chainsSchema.parse(chainsData)
        return validatedData.chains
    } catch (error) {
        console.error('Error validating chains data:', error)
        throw error
    }
}
