import 'server-only'

import type { TokenBalance } from '@/app/_lib/entities/models/token-balance'
import type { Address } from 'viem'
import { getAddressBalance } from '../../persistence/users/blockchain/get-address-balance'

export const getAddressBalanceUseCase = async (address: Address): Promise<TokenBalance | undefined> => {
    return getAddressBalance(address)
}
