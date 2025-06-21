import type { ContractCall } from '@/app/_lib/entities/models/contract-call'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import type { Address, Hex} from 'viem';
import { getAbiItem } from 'viem'

export const HasRoleFunction = getAbiItem({
    abi: poolAbi,
    name: 'hasRole',
})

type HasRoleInputs = {
    [K in (typeof HasRoleFunction)['inputs'][number]['name']]: K extends 'role'
        ? Hex
        : K extends 'account'
          ? Address
          : never
}

export function hasRole({ role, account }: HasRoleInputs): ContractCall {
    return {
        address: currentPoolAddress,
        abi: [HasRoleFunction],
        functionName: HasRoleFunction.name,
        args: [role, account],
    }
}
