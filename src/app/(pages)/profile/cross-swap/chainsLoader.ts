import chainsData from './_data/chains.json'
import { chainsSchema } from './_schemas/chainSchema'
import type { Chain } from './types'

export function loadChains(): Chain[] {
    try {
        const validatedData = chainsSchema.parse(chainsData)
        return validatedData.chains
    } catch (error) {
        console.error('Error validating chains data:', error)
        throw error
    }
}
