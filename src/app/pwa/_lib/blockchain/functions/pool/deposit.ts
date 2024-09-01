import type { ContractCall } from '@/app/pwa/_client/hooks/use-smart-transaction'
import { currentPoolAddress } from '@/app/pwa/_server/blockchain/server-config'
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
        functionName: 'deposit',
        args: [poolId, amount],
    }
}
