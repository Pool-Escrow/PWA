import type { ContractCall } from '@/app/_lib/entities/models/contract-call'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAbiItem } from 'viem'

const DepositFunction = getAbiItem({
    abi: poolAbi,
    name: 'deposit',
})

type DepositInputs = {
    [K in (typeof DepositFunction)['inputs'][number]['name']]: K extends 'poolId'
        ? bigint
        : K extends 'amount'
          ? bigint
          : never
}

export function deposit({ poolId, amount }: DepositInputs): ContractCall {
    return {
        address: currentPoolAddress,
        abi: [DepositFunction],
        functionName: DepositFunction.name,
        args: [poolId, amount],
    }
}
