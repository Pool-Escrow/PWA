import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { HasRoleFunction } from '@/app/_lib/blockchain/functions/pool/has-role'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { Role, ROLES } from '@/app/_server/persistence/users/blockchain/has-role'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import { getPublicClient } from '@wagmi/core'
import { Address } from 'viem'

const publicClient = getPublicClient(getConfig())

export const hasRole = async ({ role, account }: { role: Role; account: Address }): Promise<boolean> => {
    return publicClient.readContract({
        address: currentPoolAddress,
        abi: [HasRoleFunction],
        functionName: HasRoleFunction.name,
        args: [role, account as Address],
    })
}

export const useIsAdmin = () => {
    const { user } = usePrivy()
    const address = user?.wallet?.address as Address | undefined

    return useQuery({
        queryKey: ['is-admin', user?.id],
        queryFn: async () => {
            return address ? hasRole({ role: ROLES.ADMIN, account: address }) : false
        },
    })
}
