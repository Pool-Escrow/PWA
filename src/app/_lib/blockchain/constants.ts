import { cache } from 'react'
import type { Address } from 'viem'
import { keccak256, toHex } from 'viem'
import { base, baseSepolia } from 'viem/chains'

export const adminRole = cache(() => keccak256(toHex('WHITELISTED_HOST')))

export const usdcDeployments = {
    [base.id]: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as Address, // base mainnet USDC
    [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address, // base sepolia USDC
}
