import { keccak256, toHex } from 'viem'

export const ADMIN_ROLE = keccak256(toHex('WHITELISTED_HOST'))

export type Role = typeof ADMIN_ROLE
