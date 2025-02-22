import 'server-only'

import type { TokenBalance } from '@/app/_lib/entities/models/token-balance'
import { getBalance } from '@wagmi/core'
import type { Address } from 'viem'
import { currentPoolAddress, serverConfig } from '../../../blockchain/server-config'

export async function getAddressBalance(address: string): Promise<TokenBalance | undefined> {
    try {
        const result = await getBalance(serverConfig, {
            address: address as Address,
            token: currentPoolAddress,
        })

        return {
            value: result.value.toString(),
            symbol: result.symbol,
            decimals: result.decimals,
            formatted: result.formatted,
        }
    } catch (error) {
        console.error('Error fetching address balance and token info:', error)
        return
    }
}
