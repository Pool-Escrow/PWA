import 'server-only'

import type { TokenBalance } from '@/lib/entities/models/token-balance'
import { getAddressBalance } from '@/server/persistence/users/blockchain/get-address-balance'
import type { Address } from 'viem'

export const getAddressBalanceUseCase = async (address: Address): Promise<TokenBalance | undefined> => {
    return getAddressBalance(address)
}
