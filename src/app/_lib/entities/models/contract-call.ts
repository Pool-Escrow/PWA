import type { Abi, Address, Hex } from 'viem'

export type ContractCall = {
    address: Address
    abi: Abi
    functionName: string
    args: unknown[] // ContractFunctionArgs[]
}
