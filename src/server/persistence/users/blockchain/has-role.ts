// import 'server-only'

import { adminRole } from '@/lib/blockchain/constants'
import { HasRoleFunction } from '@/lib/blockchain/functions/pool/has-role'
import { currentPoolAddress, serverClient, serverConfig } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'

export const fetchClaimablePools = async ({ queryKey }: { queryKey: [string, string, number] }) => {
    const [_, address] = queryKey
    const publicClient = getPublicClient(serverConfig)

    const claimablePools = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getClaimablePools',
        address: currentPoolAddress,
        args: [address as Address],
    })

    return claimablePools
}

export const ROLES = {
    ADMIN: adminRole(),
    SPONSOR: adminRole(),
}

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const hasRole = async ({ role, account }: { role: Role; account: string }): Promise<boolean> => {
    try {
        const result = await serverClient().readContract({
            address: currentPoolAddress,
            abi: [HasRoleFunction],
            functionName: 'hasRole',
            args: [role, account as Address],
        })

        return Boolean(result)
    } catch (error) {
        console.error('Error checking user role:', error)
        return false
    }
}
