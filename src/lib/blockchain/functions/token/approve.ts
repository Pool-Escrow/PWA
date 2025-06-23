import type { ContractCall } from '@/lib/entities/models/contract-call'
import { currentTokenAddress } from '@/server/blockchain/server-config'
import { tokenAbi } from '@/types/contracts'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

const ApproveFunction = getAbiItem({
    abi: tokenAbi,
    name: 'approve',
})

type ApproveInputs = {
    [K in (typeof ApproveFunction)['inputs'][number]['name']]: K extends 'spender'
        ? Address
        : K extends 'amount'
          ? string
          : never
}

export function approve({ spender, amount }: ApproveInputs): ContractCall {
    return {
        address: currentTokenAddress,
        abi: [ApproveFunction],
        functionName: 'approve',
        args: [spender, BigInt(amount)],
    }
}
