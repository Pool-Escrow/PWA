import type { ContractCall } from '@/lib/entities/models/contract-call'
import { currentPoolAddress } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAbiItem } from 'viem'

const DepositFunction = getAbiItem({
    abi: poolAbi,
    name: 'deposit',
})

type DepositInputs = {
    [K in (typeof DepositFunction)['inputs'][number]['name']]: K extends 'poolId' | 'amount' ? string : never
}

export function deposit({ poolId, amount }: DepositInputs): ContractCall {
    return {
        address: currentPoolAddress,
        abi: [DepositFunction],
        functionName: DepositFunction.name,
        args: [BigInt(poolId), BigInt(amount)],
    }
}
