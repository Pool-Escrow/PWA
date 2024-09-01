import type { ContractCall } from '@/app/pwa/_client/hooks/use-smart-transaction'
import { currentTokenAddress } from '@/app/pwa/_server/blockchain/server-config'
import { dropletAbi } from '@/types/contracts'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

const ApproveFunction = getAbiItem({
    abi: dropletAbi,
    name: 'approve',
})

type ApproveInputs = {
    [K in (typeof ApproveFunction)['inputs'][number]['name']]: K extends 'spender'
        ? Address
        : K extends 'amount'
          ? bigint
          : never
}

export function approve({ spender, amount }: ApproveInputs): ContractCall {
    return {
        address: currentTokenAddress,
        abi: [ApproveFunction],
        functionName: 'approve',
        args: [spender, amount],
    }
}
