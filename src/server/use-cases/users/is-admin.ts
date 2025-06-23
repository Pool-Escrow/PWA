import 'server-only'

import { ROLES, hasRole } from '@/server/persistence/users/blockchain/has-role'

export const isAdminUseCase = async (address?: string): Promise<boolean> => {
    if (!address) return false

    return hasRole({
        role: ROLES.ADMIN,
        account: address,
    })
}
